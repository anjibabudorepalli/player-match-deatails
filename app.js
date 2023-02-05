const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const app = express();
app.use(express.json());
let db = null;
const dbPath = path.join(__dirname, "cricketMatchDetails.db");
const initilizeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Start at http://localhost/3000");
    });
  } catch (e) {
    console.log(`DB Error${e.message}`);
    process.exit();
  }
};

initilizeDbAndServer();

///API1 GET PLAYERS

app.get("/players/", async (request, response) => {
  const sql = `SELECT * FROM player_details;`;
  const data = await db.all(sql);
  response.send(
    data.map((k) => {
      return {
        playerId: k.player_id,
        playerName: k.player_name,
      };
    })
  );
});

///API2 GET SINGLE PLAYER

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;

  const sql = `SELECT * FROM 
  player_details
  WHERE player_id=${playerId};`;
  const data = await db.get(sql);
  response.send({ playerId: data.player_id, playerName: data.player_name });
});

///API3 PUT PLAYER DETAILS

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const { playerName } = request.body;
  const sql = `UPDATE player_details 
    SET player_name='${playerName}'
    WHERE player_id=${playerId};`;
  await db.run(sql);
  response.send("Player Details Updated");
});

///API4 GET SINGLE MATCH

app.get("/matches/:matchId/", async (request, response) => {
  const { matchId } = request.params;
  const sql = `SELECT
               * FROM
                match_details
                WHERE match_id=${matchId};`;
  const data = await db.get(sql);
  response.send({
    matchId: data.match_id,
    match: data.match,
    year: data.year,
  });
});

///API5 GET ALL MATCHES OF SINGLE PLAYER

app.get("/players/:playerId/matches", async (request, response) => {
  const { playerId } = request.params;
  const sql = `SELECT *
                FROM   match_details NATURAL JOIN 
                player_match_score
                WHERE player_match_score.player_id=${playerId};`;
  const data = await db.all(sql);
  response.send(
    data.map((k) => {
      return {
        matchId: k.match_id,
        match: K.match,
        year: K.year,
      };
    })
  );
});

///API6

app.get("/matches/:matchId/players", async (request, response) => {
  const { matchId } = request.params;
  const sql = `SELECT * 
    FROM player_details 
    INNER JOIN player_match_score
    WHERE 
    match_id=${matchId};`;
  const data = await db.all(sql);
  response.send(
    data.map((k) => {
      return {
        playerId: k.player_id,
        playerName: k.player_name,
      };
    })
  );
});

///API7

app.get("/players/:playerId/playerScores", async (request, response) => {
  const { playerId } = request.params;
  const sql = `SELECT
                player_id,
                player_name,
               SUM(score) as a,
               SUM(fours) as b,
               SUM(sixes) as c
               FROM 
               player_match_score INNER JOIN player_details
               ON player_match_score.player_id=player_details.player_id
               WHERE
               player_id=${playerId}
               GROUP BY player_id;`;
  const data = await db.get(sql);
  response.send({
    playerId: data.player_id,
    playerName: data.player_name,
    totalScore: data.a,
    totalFours: data.b,
    totalSixes: data.c,
  });
});

module.exports = app;
