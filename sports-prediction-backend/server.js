const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const gamesRoutes = require('./routes/games');
const playersRoutes = require('./routes/players');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use('/api/games', gamesRoutes);
app.use('/api/players', playersRoutes); // Use player routes

if (process.env.NODE_ENV === 'production') {
    // Serve static files from the React app
    app.use(express.static(path.join(__dirname, '/build'))); // Adjusted path

    // Handle client-side routing
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '/build', 'index.html')); // Adjusted path
    });
}
// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
