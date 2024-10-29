const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Adjust the path to point to your SQLite database file correctly
const db = new sqlite3.Database(path.join(__dirname, 'gameData.db'), sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
    if (err) {
        console.error('Error opening database ' + err.message);
    } else {
        console.log('Connected to the SQLite database.');
    }
});

module.exports = db;
