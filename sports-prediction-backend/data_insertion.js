const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const csv = require('csv-parser');
const db = new sqlite3.Database('./gameData.db');

// Ensure tables exist
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS players (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,  -- Ensure uniqueness
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

// Step 1: Collect unique players
const uniquePlayers = new Set();
fs.createReadStream('past_results_data.csv')
    .pipe(csv())
    .on('data', (row) => {
        uniquePlayers.add(row['Home Player']);
        uniquePlayers.add(row['Away Player']);
    })
    .on('end', () => {
        console.log('Unique players collected:', Array.from(uniquePlayers));
        // Step 2: Insert unique players into the database
        const playersArray = Array.from(uniquePlayers);
        let placeholders = playersArray.map(() => '(?)').join(','); // Create placeholders for the insert query
        db.serialize(() => {
            const stmt = db.prepare(`INSERT OR IGNORE INTO players (name) VALUES ${placeholders}`); // Use INSERT OR IGNORE to avoid duplicates
            playersArray.forEach(player => {
                stmt.run(player); // Insert each player
                console.log("Inserting player: ", player);
            });
            stmt.finalize(); // Finalize the statement
            // Step 3: Now insert the games
            insertGames();
        });
    });

// Function to insert game results and update player stats
function insertGames() {
    fs.createReadStream('past_results_data.csv')
        .pipe(csv())
        .on('data', (row) => {
            const homeScore = parseInt(row['Home Score'], 10);
            const awayScore = parseInt(row['Away Score'], 10);
            const homePlayer = row['Home Player'];
            const awayPlayer = row['Away Player'];

            // Validate scores
            if (isNaN(homeScore) || isNaN(awayScore)) {
                console.log(`Invalid scores for ${homePlayer} vs ${awayPlayer}`);
                return;
            }

            // Fetch player IDs
            db.all(`SELECT id FROM players WHERE name IN (?, ?)`, [homePlayer, awayPlayer], (err, rows) => {
                if (err) throw err;
                if (rows.length === 2) {
                    const player1Id = rows[0].id;
                    const player2Id = rows[1].id;

                    // Insert game result into the games table
                    db.run(`INSERT INTO games (player1Id, player2Id, player1Score, player2Score) VALUES (?, ?, ?, ?)`,
                        [player1Id, player2Id, homeScore, awayScore], function(err) {
                            if (err) throw err;
                            console.log(`Game recorded with ID: ${this.lastID}`);

                            // Update player stats
                            updatePlayerStats(player1Id, player2Id, homeScore, awayScore);
                        });
                }
            });
        })
        .on('end', () => {
            console.log('All game results processed and inserted.');
        });
}

// Function to update player stats
function updatePlayerStats(player1Id, player2Id, player1Score, player2Score) {
    if (player1Score > player2Score) {
        // Player 1 wins, Player 2 loses
        db.run(`UPDATE players SET wins = wins + 1, points = points + 3 WHERE id = ?`, player1Id);
        db.run(`UPDATE players SET losses = losses + 1 WHERE id = ?`, player2Id);
    } else if (player1Score < player2Score) {
        // Player 2 wins, Player 1 loses
        db.run(`UPDATE players SET losses = losses + 1 WHERE id = ?`, player1Id);
        db.run(`UPDATE players SET wins = wins + 1, points = points + 3 WHERE id = ?`, player2Id);
    } else {
        // Draw
        db.run(`UPDATE players SET draws = draws + 1, points = points + 1 WHERE id IN (?, ?)`, [player1Id, player2Id]);
    }
}
