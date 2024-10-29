const express = require('express');
const db = require('../databaseSetup'); // Assuming you have this set up to connect to SQLite

const router = express.Router();

// Create a new player
router.post('/', (req, res) => {
    const { name } = req.body;

    const stmt = db.prepare(`INSERT INTO players (name) VALUES (?)`);
    stmt.run(name, function(err) {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        res.status(201).json({ id: this.lastID, name });
    });
    stmt.finalize();
});

// Get all players
router.get('/', (req, res) => {
    db.all(`SELECT * FROM players`, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(200).json(rows);
    });
});

// Get a player by ID
router.get('/:id', (req, res) => {
    const { id } = req.params;
    db.get(`SELECT * FROM players WHERE id = ?`, [id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!row) {
            return res.status(404).json({ error: 'Player not found' });
        }
        res.status(200).json(row);
    });
});

// Update a player by ID
router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { name } = req.body;

    const stmt = db.prepare(`UPDATE players SET name = ? WHERE id = ?`);
    stmt.run(name, id, function(err) {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Player not found' });
        }
        res.status(200).json({ id, name });
    });
    stmt.finalize();
});

// Delete a player by ID
router.delete('/:id', (req, res) => {
    const { id } = req.params;

    const stmt = db.prepare(`DELETE FROM players WHERE id = ?`);
    stmt.run(id, function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Player not found' });
        }
        res.status(204).send(); // No content
    });
    stmt.finalize();
});

module.exports = router;
