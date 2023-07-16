const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const app = express();
app.use(express.json());
const dBPath = path.join(__dirname, "cricketMatchDetails.db");
//console.log(dBPath);
let dBConnObj = null;
const connectDBAndStartServer = async () => {
  try {
    dBConnObj = await open({ filename: dBPath, driver: sqlite3.Database });
    app.listen(3000, () => {
      console.log("Server is listening on http://localhost:3000/");
      //console.log(dBConnObj);
        
    });
  } catch (e) {
    console.log(`Error is :${e.message}`);
    process.exit(1);
  }
};

connectDBAndStartServer();

//API 1
app.get("/players/", async (request, response) => {
  const getPlayersQuery = `SELECT * FROM player_details;`;
  const responseData = await dBConnObj.all(getPlayersQuery);
  response.send(
    responseData.map((obj) => {
      return {
        playerId: obj.player_id,
        playerName: obj.player_name,
      };
    })
  );
});

//API 2
app.get("/players/:playerId/", async (request, response) => {
  const {playerId} = request.params;  
  const getPlayerQuery = `SELECT * FROM player_details
  WHERE player_id = ${playerId};`;
  const responseData = await dBConnObj.get(getPlayerQuery);
  response.send({
        playerId: responseData.player_id,
        playerName: responseData.player_name,
      });

  
});


//API 3
app.put("/players/:playerId/", async (request, response) => {
  const {playerId} = request.params;  
  const{playerName} = request.body; 
  const updatePlayerQuery = `UPDATE player_details
  SET player_name = '${playerName}'   
  WHERE player_id = ${playerId};`;
  const responseData = await dBConnObj.run(updatePlayerQuery);
  response.send("Player Details Updated");

  
});

//API 4

app.get("/matches/:matchId/", async (request, response) => {
  const {matchId} = request.params;  
  const getMatchQuery = `SELECT * FROM match_details
  WHERE match_id = ${matchId};`;
  const responseData = await dBConnObj.get(getMatchQuery);
  response.send({
        matchId: responseData.match_id,
        match: responseData.match,
        year : responseData.year
      });

  
});


//API 5
app.get("/players/:playerId/matches", async (request, response) => {
  const {playerId} = request.params;  
  //console.log(playerId);
  
  const getPlayerMatchesQuery = `SELECT match_details.match_id,
  match_details.match, match_details.year
   FROM match_details 
  INNER JOIN player_match_score  ON 
  match_details.match_id = player_match_score.match_id
  WHERE player_match_score.player_id = ${playerId}`;
  const responseData = await dBConnObj.all(getPlayerMatchesQuery);
  //console.log(responseData);
  
   response.send(
    responseData.map((obj) => {
      return {
        matchId: obj.match_id,
        match: obj.match,
        year : obj.year
      };
    })
  );

  
});

//API 6
app.get("/matches/:matchId/players", async (request, response) => {
  const {matchId} = request.params;  
  console.log(matchId);
  
  const getMatchPlayersQuery = `SELECT player_match_score.player_id,
  player_details.player_name
   FROM player_details 
  INNER JOIN player_match_score ON 
  player_details.player_id = player_match_score.player_id
  WHERE player_match_score.match_id = ${matchId};`;
  console.log(getMatchPlayersQuery);
  
  const responseData = await dBConnObj.all(getMatchPlayersQuery);
  console.log(responseData);
  
   response.send(
    responseData.map((obj) => {
      return {
        playerId: obj.player_id,
        playerName: obj.player_name
        
      };
    })
  );

  
});


//API 7
app.get("/players/:playerId/playerScores", async (request, response) => {
  const {playerId} = request.params;  
  console.log(playerId);
  
  const getPlayerStatsQuery = `SELECT player_details.player_id,
  player_details.player_name,SUM(player_match_score.score) AS 
  totalScore,SUM(player_match_score.fours) AS 
  totalFours, SUM(player_match_score.sixes) AS totalSixes
   FROM player_details 
  INNER JOIN player_match_score  ON 
  player_details.player_id = player_match_score.player_id
  WHERE player_details.player_id = ${playerId}`;
  const responseData = await dBConnObj.get(getPlayerStatsQuery);
  console.log(responseData);
  
   response.send(
   
       {
        playerId :responseData.player_id,
        playerName  :responseData.player_name,
        totalScore: responseData.totalScore,
        totalFours: responseData.totalFours,
        totalSixes : responseData.totalSixes
      }
    
  );

  
});

module.exports = app;