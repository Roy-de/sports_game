const express = require('express');
const db = require('../databaseSetup');

const router = express.Router();

// Function to update player stats
const updatePlayerStats = (playerId, wins, losses, draws, points) => {
    const stmt = db.prepare(`
        UPDATE players 
        SET 
            wins = wins + ?, 
            losses = losses + ?, 
            draws = draws + ?,
            points = points + ? 
        WHERE 
            id = ?
    `);

    stmt.run(wins, losses, draws, points, playerId);
    stmt.finalize();
};

// Create a new game entry and update player stats
router.post('/', (req, res) => {
    const { player1Id, player2Id, player1Score, player2Score } = req.body;

    // Insert the game
    const stmt = db.prepare(`INSERT INTO games (player1Id, player2Id, player1Score, player2Score) VALUES (?, ?, ?, ?)`);
    stmt.run(player1Id, player2Id, player1Score, player2Score, function(err) {
        if (err) {
            return res.status(400).json({ error: err.message });
        }

        // Determine stats updates based on scores
        let player1Wins = 0, player1Losses = 0, player1Draws = 0, player1Points = 0;
        let player2Wins = 0, player2Losses = 0, player2Draws = 0, player2Points = 0;

        if (player1Score > player2Score) {
            // Player 1 wins
            player1Wins = 1;
            player1Points = 3;
            player2Losses = 1;
            player2Points = 0;
        } else if (player1Score < player2Score) {
            // Player 2 wins
            player2Wins = 1;
            player2Points = 3;
            player1Losses = 1;
            player1Points = 0;
        } else {
            // Draw
            player1Draws = 1;
            player2Draws = 1;
            player1Points = 1;
            player2Points = 1;
        }

        // Update player statistics
        updatePlayerStats(player1Id, player1Wins, player1Losses, player1Draws, player1Points);
        updatePlayerStats(player2Id, player2Wins, player2Losses, player2Draws, player2Points);

        res.status(201).json({
            id: this.lastID,
            player1Id,
            player2Id,
            player1Score,
            player2Score
        });
    });
    stmt.finalize();
});

// Get all games
router.get('/', (req, res) => {
    db.all(`SELECT * FROM games`, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(200).json(rows);
    });
});

module.exports = router;
