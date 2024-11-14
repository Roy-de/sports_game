const express = require('express');
const {predictMatchOutcome} = require("../models");

const router = express.Router();

router.post("/", async (req, res) => {
    try {
        const {player1Id, player2Id} = req.body;

        // Check that player IDs are provided
        if (!player1Id || !player2Id) {
            return res.status(400).json({error: "Both player1Id and player2Id are required"});
        }

        // Call the predictMatchOutcome function to get prediction results
        const outcomeProbabilities = await predictMatchOutcome(player1Id, player2Id);

        // Format the response data
        res.json({
            player1Id: player1Id,
            player2Id: player2Id,
            probabilities: {
                player1Win: outcomeProbabilities.player1Win,
                player2Win: outcomeProbabilities.player2Win,
                draw: outcomeProbabilities.draw,
            },
        });
    } catch (error) {
        console.error("Error predicting match outcome:", error);
        res.status(500).json({error: "An error occurred while predicting the match outcome."});
    }
});

module.exports = router;
