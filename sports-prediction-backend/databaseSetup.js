const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('gameData.db');

db.serialize(() => {
    // Create players table
    db.run(`CREATE TABLE IF NOT EXISTS players (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        wins INTEGER DEFAULT 0,
        losses INTEGER DEFAULT 0,
        draws INTEGER DEFAULT 0,
        points INTEGER DEFAULT 0
    )`);

    // Create games table
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

module.exports = db;
