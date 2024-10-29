const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const csv = require('csv-parser');

const db = new sqlite3.Database('./gameData.db');

// Ensure tables exist
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS players (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        wins INTEGER DEFAULT 0,
        losses INTEGER DEFAULT 0,
        draws INTEGER DEFAULT 0,
        points INTEGER DEFAULT 0
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS games (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        player1Id INTEGER NOT NULL,
        player2Id INTEGER NOT NULL,
        player1Score INTEGER NOT NULL,
        player2Score INTEGER NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (player1Id) REFERENCES players(id),
        FOREIGN KEY (player2Id) REFERENCES players(id)
    )`);
});

// Function to add or find a player and return their ID
function findOrCreatePlayer(playerName, callback) {
    db.get(`SELECT id FROM players WHERE name = ?`, [playerName], (err, row) => {
        if (err) throw err;
        if (row) {
            callback(row.id); // Player already exists, return their ID
        } else {
            db.run(`INSERT INTO players (name) VALUES (?)`, [playerName], function (err) {
                if (err) throw err;
                callback(this.lastID); // New player ID
            });
        }
    });
}

// Function to insert game results
function insertGame(data) {

    const homeScore = parseInt(data.HomeScore, 10);
    const awayScore = parseInt(data.AwayScore, 10);
    console.log(`Parsed scores for ${data.HomePlayer} vs ${data.AwayPlayer}: Home Score = ${homeScore}, Away Score = ${awayScore}`);

    if (isNaN(homeScore) || isNaN(awayScore) || homeScore === null || awayScore === null) {
        console.log(`Skipping game due to missing or invalid scores: ${data.HomePlayer} vs ${data.AwayPlayer}`);
        return;
    }


    findOrCreatePlayer(data.HomePlayer, (player1Id) => {
        findOrCreatePlayer(data.AwayPlayer, (player2Id) => {
            db.run(`INSERT INTO games (player1Id, player2Id, player1Score, player2Score, createdAt)
                    VALUES (?, ?, ?, ?, ?)`,
                [player1Id, player2Id, homeScore, awayScore, data.DateTime],
                (err) => {
                    if (err) throw err;
                    console.log(`Game added: ${data.HomePlayer} vs ${data.AwayPlayer}`);
                }
            );

            // Update player stats
            if (homeScore > awayScore) {
                db.run(`UPDATE players SET wins = wins + 1, points = points + 3 WHERE id = ?`, [player1Id]);
                db.run(`UPDATE players SET losses = losses + 1 WHERE id = ?`, [player2Id]);
            } else if (homeScore < awayScore) {
                db.run(`UPDATE players SET wins = wins + 1, points = points + 3 WHERE id = ?`, [player2Id]);
                db.run(`UPDATE players SET losses = losses + 1 WHERE id = ?`, [player1Id]);
            } else {
                db.run(`UPDATE players SET draws = draws + 1, points = points + 1 WHERE id = ?`, [player1Id]);
                db.run(`UPDATE players SET draws = draws + 1, points = points + 1 WHERE id = ?`, [player2Id]);
            }
        });
    });
}

// Read the CSV file and insert data
fs.createReadStream('past_results_data.csv')
    .pipe(csv())
    .on('data', (row) => {
        const gameData = {
            Date: row['Date'],
            ID: row['ID'],
            Game: row['Game'],
            Level: row['Level'],
            DateTime: row['Date/Time'],
            HomeTeam: row['Home Team'],
            HomePlayer: row['Home Player'],
            AwayTeam: row['Away Team'],
            AwayPlayer: row['Away Player'],
            HomeScore: parseInt(row['Home Score']),
            AwayScore: parseInt(row['Away Score']),
            Status: row['Status']
        };
        insertGame(gameData);
    })
    .on('end', () => {
        console.log('CSV file successfully processed and data inserted.');
    });
