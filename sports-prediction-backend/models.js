const path = require("path");
const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database(path.join(__dirname, 'gameData.db'), sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
    if (err) {
        console.error('Error opening database ' + err.message);
    } else {
        console.log('Connected to the SQLite database.');
    }
});

function fetchPlayerWins(playerId) {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT COUNT(*) as wins
            FROM games
            WHERE (player1Id = ? AND player1Score > player2Score) OR (player2Id = ? AND player2Score > player1Score);
        `;
        db.get(query, [playerId, playerId], (err, row) => {
            if (err) {
                console.error("Database query error:", err.message);
                return reject(err);
            }
            resolve(row.wins);
        });
    });
}

async function fetchMaxPlayerWins() {
    return new Promise((resolve, reject) => {
        const query = `SELECT MAX(wins) as maxWins FROM ( SELECT player1Id as playerId, COUNT(*) as wins FROM games WHERE player1Score > player2Score GROUP BY player1Id UNION ALL SELECT player2Id as playerId, COUNT(*) as wins FROM games WHERE player2Score > player1Score GROUP BY player2Id ) as winCounts;`;
        db.get(query, [], (err, row) => {
            if (err) {
                console.error("Database query error:", err.message); return reject(err);
            } resolve(row.maxWins);
        });
    });

}

    function fetchLastGames(playerId, limit = 20) {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT player1Id, player2Id, player1Score, player2Score
            FROM games
            WHERE player1Id = ? OR player2Id = ?
            ORDER BY createdAt ASC
            LIMIT ?;
        `;
        db.all(query, [playerId, playerId, limit], (err, rows) => {
            if (err) {
                console.error("Database query error:", err.message);
                return reject(err); // Make sure to return here
            }

            if (!rows || rows.length === 0) {
                console.warn(`No games found for player ID ${playerId}.`);
                return resolve([]); // Return an empty array if no games are found
            }

            // Map each game result to win (1), draw (0), or loss (-1)
            const gameResults = rows.map(row => {
                if (row.player1Id === playerId) {
                    // Player is player1
                    if (row.player1Score > row.player2Score) return 1;  // Win
                    else if (row.player1Score < row.player2Score) return -1; // Loss
                    else return 0; // Draw
                } else {
                    // Player is player2
                    if (row.player2Score > row.player1Score) return 1;  // Win
                    else if (row.player2Score < row.player1Score) return -1; // Loss
                    else return 0; // Draw
                }
            });

            resolve(gameResults);
        });
    });
}

function calculateForm(games, numGames) {
    const relevantGames = games.slice(0, numGames);
    const wins = relevantGames.filter(game => game === 1).length;  // Player 1 wins
    const losses = relevantGames.filter(game => game === -1).length;  // Player 2 wins
    const draws = relevantGames.filter(game => game === 0).length;  // Draws

    return Math.abs ((wins - losses + (draws /numGames)) / numGames);
}

function applyDecay(weight, decayFactor, interval) {
    return weight * Math.exp(-decayFactor * interval);
}

async function calculatePlayerForm(playerId) {
    const playerGames = await fetchLastGames(playerId); // Fetch last X games for player
    const playerWins = await fetchPlayerWins(playerId);
    const maxWins = await fetchMaxPlayerWins();
    // Calculate form for multiple intervals: 5, 10, 15, and 20 games
    const form5 = calculateForm(playerGames, 5);
    const form10 = calculateForm(playerGames, 10);
    const form15 = calculateForm(playerGames, 15);
    const form20 = calculateForm(playerGames, 20);

    // Apply decay to the forms to give more weight to recent games
    const decayFactor = 0.5;  // Decay rate (controls how fast older games lose significance)
    const weightedForm5 = applyDecay(form5, decayFactor, 5);
    const weightedForm10 = applyDecay(form10, decayFactor, 10);
    const weightedForm15 = applyDecay(form15, decayFactor, 15);
    const weightedForm20 = applyDecay(form20, decayFactor, 20);

    // Combine all forms with their respective weights (more recent games weigh more)
    const totalWeight = (weightedForm5 * 0.4) + (weightedForm10 * 0.3) + (weightedForm15 * 0.2) + (weightedForm20 * 0.1);
    const playerStrength = (playerWins / Math.pow(maxWins, 2));
    // Return combined form as a weighted average
    return (totalWeight / 4) + playerStrength;
}

async function predictMatchOutcome(player1Id, player2Id) {
    try {
        const player1Form = await calculatePlayerForm(player1Id);
        const player2Form = await calculatePlayerForm(player2Id);

        // Calculate the difference in form scores
        const formDifference = player1Form - player2Form;

        // Adjust sigmoid steepness to make form differences more impactful
        const sigmoid = (x) => 1 / (1 + Math.exp(10 * x)); // Increased steepness

        // Predict win probability for player 1
        const player1Prob = sigmoid(formDifference);

        // Predict win probability for player 2
        const player2Prob = 1 - player1Prob;

        // Adjust draw probability factor to reduce draw likelihood
        const drawProb = 1 / (1.5 + Math.exp(7 * Math.abs(formDifference)));  // Reduced draw likelihood

        // Standardize probabilities to ensure they sum up to 1 (100%)
        const totalProbability = player1Prob + player2Prob + (drawProb/3);

        // Adjust probabilities to ensure they sum to 1
        const standardizedPlayer1Win = (player1Prob / totalProbability) * 100;
        const standardizedPlayer2Win = (player2Prob / totalProbability) * 100;
        const standardizedDraw = (drawProb / totalProbability) * 100;

        return {
            player1Win: standardizedPlayer1Win,
            player2Win: standardizedPlayer2Win,
            draw: standardizedDraw
        };
    } catch (error) {
        console.error("Error predicting match outcome:", error);
    }
}


// const testGames = [
//     { player1Id: 325, player2Id: 1189, actualOutcome: 1 },
//     { player1Id: 487, player2Id: 271, actualOutcome: 1 },
//     { player1Id: 1243, player2Id: 1783, actualOutcome: 1 },
//     { player1Id: 1297, player2Id: 1405, actualOutcome: -1 },
//     { player1Id: 379, player2Id: 271, actualOutcome: 0 },
//     { player1Id: 487, player2Id: 325, actualOutcome: -1 },
//     { player1Id: 1297, player2Id: 1243, actualOutcome: -1 },
//     { player1Id: 1783, player2Id: 1405, actualOutcome: 1 },
//     { player1Id: 1243, player2Id: 1405, actualOutcome: 1 },
//     { player1Id: 271, player2Id: 325, actualOutcome: -1 },
// ];


/*
(async () => {
    let correctPredictions = 0;
    let totalGames = testGames.length;

    for (let game of testGames) {
        const { player1Id, player2Id, actualOutcome } = game;

        // Predict the match outcome
        const outcomeProbabilities = await predictMatchOutcome(player1Id, player2Id);

        // Determine the predicted outcome based on probabilities
        let predictedOutcome = null;

        if (outcomeProbabilities.player1Win > outcomeProbabilities.player2Win && outcomeProbabilities.player1Win > outcomeProbabilities.draw) {
            predictedOutcome = 1; // Player 1 wins
        } else if (outcomeProbabilities.player2Win > outcomeProbabilities.player1Win && outcomeProbabilities.player2Win > outcomeProbabilities.draw) {
            predictedOutcome = -1; // Player 2 wins
        } else {
            predictedOutcome = 0; // Draw
        }

        // Compare predicted outcome with actual outcome
        if (predictedOutcome === actualOutcome) {
            correctPredictions++;
        }

        // Log predicted vs actual outcome
        console.log(`Game: Player 1 (ID: ${player1Id}) vs Player 2 (ID: ${player2Id})`);
        console.log(`Results: Win: ${outcomeProbabilities.player1Win} Loss: ${outcomeProbabilities.player2Win} Draw: ${outcomeProbabilities.draw}`)
        console.log(`Predicted Outcome: ${predictedOutcome === 1 ? "Player 1 Wins" : predictedOutcome === -1 ? "Player 2 Wins" : "Draw"}`);
        console.log(`Actual Outcome: ${actualOutcome === 1 ? "Player 1 Wins" : actualOutcome === -1 ? "Player 2 Wins" : "Draw"}`);
        console.log("==============================================");
    }

    // Calculate accuracy
    const accuracy = (correctPredictions / totalGames) * 100;
    console.log(`Prediction Accuracy: ${accuracy.toFixed(2)}%`);
})();
*/

module.exports = {
    predictMatchOutcome
}