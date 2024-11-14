import React, { useEffect, useState } from 'react';

interface Players {
    id: number,
    name: string,
    wins: number,
    losses: number,
    draws: number,
    points: number
}

interface Game {
    id: number,
    player1Id: number,
    player2Id: number,
    player1Score: number,
    player2Score: number,
    createdAt: string
}

const Predictions = () => {
    const [players, setPlayers] = useState<Players[]>([]);
    const [player1, setPlayer1] = useState<Players | null>(null);
    const [player2, setPlayer2] = useState<Players | null>(null);
    const [games, setGames] = useState<Game[]>([]);
    const [prediction, setPrediction] = useState({
        player1Win: 0,
        player2Win: 0,
        draw: 0
    });

    useEffect(() => {
        const fetchPlayers = async () => {
            try {
                const response = await fetch('/api/players');
                if (!response.ok) console.log('Failed to fetch players');
                const data = await response.json();
                setPlayers(data);
                if (data.length > 0) {
                    setPlayer1(data[0]);
                    setPlayer2(data[1]);
                }
            } catch (error) {
                console.error(error);
            }
        };
        const fetchGames = async () => {
            try {
                const response = await fetch('/api/games');
                if (!response.ok) console.log('Failed to fetch players');
                const data = await response.json();
                setGames(data)
            } catch (error) {
                console.error(error);
            }
        };

        fetchPlayers().then(r => console.log(r));
        fetchGames().then(r => console.log(r))
    }, []);
    // Function to calculate the total games and win/loss percentage

    // Function to fetch predictions from the backend
    const fetchPrediction = async () => {
        if (!player1 || !player2) return;

        try {
            const response = await fetch('/predict', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    player1Id: player1.id,
                    player2Id: player2.id
                })
            });

            if (response.ok) {
                const data = await response.json();
                setPrediction({
                    player1Win: data.probabilities.player1Win,
                    player2Win: data.probabilities.player2Win,
                    draw: data.probabilities.draw
                });
            } else {
                console.error('Failed to fetch prediction');
            }
        } catch (error) {
            console.error('Error fetching prediction:', error);
        }
    };

    useEffect(() => {
        if (player1 && player2) {
            fetchPrediction();
        }
    }, [player1, player2]);

    if (players.length === 0) {
        return <div>Loading players...</div>; // Loading state
    }

    // Display the predicted chances based on server response
    const player1Chance = prediction.player1Win * 100;
    const player2Chance = prediction.player2Win * 100;
    const drawChance = prediction.draw * 100;

    const getTotalGamesPlayed = (playerId: number) => {
        return games.reduce((count, game) => {
            if (game.player1Id === playerId || game.player2Id === playerId) {
                return count + 1;
            }
            return count;
        }, 0);
    };

// Calculate total games played for player 1 and player 2
    const player1GamesPlayed = player1 ? getTotalGamesPlayed(player1.id) : 0;
    const player2GamesPlayed = player2 ? getTotalGamesPlayed(player2.id) : 0;

// Total games played by both players
    const totalGamesPlayed = player1GamesPlayed + player2GamesPlayed;
    const totalDraws = (player1?.draws || 0) + (player2?.draws || 0);
    // @ts-ignore
    return (
        <div className="h-screen flex flex-row">
            <div className="flex flex-col items-start justify-start h-full w-fit mx-auto">
                <div className={"flex flex-row w-full justify-between items-center pb-10 border-b pt-20"}>
                    {/* Dropdown for Player 1 */}
                    <div className="relative mb-4 w-64">
                        <select
                            className="appearance-none w-full p-2 pr-10 text-xl bg-transparent border border-slate-500"
                            value={player1?.id || ''}
                            onChange={(e) => {
                                const selectedPlayer = players.find(p => p.id === parseInt(e.target.value));
                                setPlayer1(selectedPlayer || players[1]); // Fallback to second player
                            }}
                        >
                            {players.map(player => (
                                <option key={player.id} value={player.id}>{player.name}</option>
                            ))}
                        </select>
                    </div>
                    <div
                        className={"text-7xl font-extrabold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent"}>
                        VS
                    </div>
                    {/* Dropdown for Player 2 */}
                    <div className="relative mb-4 w-64">
                        <select
                            className="appearance-none w-full p-2 pr-10 text-xl bg-transparent border border-slate-500"
                            value={player2?.id || ''}
                            onChange={(e) => {
                                const selectedPlayer = players.find(p => p.id === parseInt(e.target.value));
                                setPlayer2(selectedPlayer || players[1]); // Fallback to second player
                            }}
                        >
                            {players.map(player => (
                                <option key={player.id} value={player.id}>{player.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className={"flex flex-row"}>
                    <LeftSection player={player1} games={games} />
                    <CenterSection
                        player_1victories={player1?.wins}
                        player_2victories={player2?.wins}
                        games_played={totalGamesPlayed / 2}
                        draws={totalDraws / 2}/>
                    <RightSection player={player2} games={games} />
                </div>
                <div className="flex flex-col items-center justify-center w-full">
                    <div className="mt-6 p-4 rounded w-full text-center">
                        <div className="relative mt-4 w-full h-2 rounded-full">
                            {/* Player 1 Section */}
                            <div
                                className="absolute h-full rounded-l-full"
                                style={{
                                    width: `${player1Chance}%`,
                                    backgroundColor: 'rgb(255, 0, 0)', // Red for Player 1
                                    transition: 'width 0.5s ease'
                                }}
                            />
                            {/* Draw Section */}
                            <div
                                className="absolute h-full"
                                style={{
                                    width: `${drawChance}%`,
                                    backgroundColor: 'rgb(200, 200, 200)', // Gray for Draw
                                    left: `${player1Chance}%`,
                                    transition: 'left 0.5s ease, width 0.5s ease'
                                }}
                            />
                            {/* Player 2 Section */}
                            <div
                                className="absolute h-full rounded-r-full"
                                style={{
                                    width: `${player2Chance}%`,
                                    backgroundColor: 'rgb(0, 0, 255)', // Blue for Player 2
                                    left: `${player1Chance + drawChance}%`,
                                    transition: 'left 0.5s ease, width 0.5s ease'
                                }}
                            />

                            {/* Player 1 Percentage */}
                            <div
                                className="absolute text-[#ff0000] font-bold"
                                style={{
                                    left: `${(player1Chance / 100) * 50}%`,
                                    transform: 'translateX(-50%)',
                                    top: '-40px', // Position above the bar
                                }}
                            >
                                {Math.round(player1Chance)}%
                            </div>
                            {/* Draw Percentage */}
                            <div
                                className="absolute text-gray-700 font-bold"
                                style={{
                                    left: `${(player1Chance + (drawChance / 100) * (player2Chance / 2))}%`,
                                    transform: 'translateX(-50%)',
                                    top: '-40px', // Position above the bar
                                }}
                            >
                                {Math.round(drawChance)}%
                            </div>
                            {/* Player 2 Percentage */}
                            <div
                                className="absolute text-[#0000ff] font-bold"
                                style={{
                                    left: `${(player1Chance + drawChance + (player2Chance / 100) * 50)}%`,
                                    transform: 'translateX(-50%)',
                                    top: '-40px', // Position above the bar
                                }}
                            >
                                {Math.round(player2Chance)}%
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Predictions;


const CenterSection: React.FC<{
    player_1victories: number | undefined,
    player_2victories: number | undefined,
    games_played: number | undefined,
    draws: number | undefined
}> = ({ player_1victories, player_2victories, games_played, draws }) => {
    return (
        <div className="flex items-center middle-section">
            <div className="p-4">
                <div className="flex flex-col items-center px-4 text-center">
                    <div className="relative flex flex-col items-center justify-center"
                         style={{width: '80px', height: '80px'}}>
                        <h2 className="m-0 font-black">{player_1victories}</h2>
                        <p className="m-0 text-xs">VICTORIES</p>
                        <div className="absolute inset-0 h-full">
                            <svg
                                version="1.1"
                                id="Layer_1"
                                xmlns="http://www.w3.org/2000/svg"
                                xmlnsXlink="http://www.w3.org/1999/xlink"
                                x="0px"
                                y="0px"
                                viewBox="0 0 512 512"
                                style={{fill: 'rgb(6, 88, 240)'}}
                                xmlSpace="preserve"
                            >
                                <g>
                                    <g>
                                        <path d="M485.291,129.408l-224-128c-3.285-1.877-7.296-1.877-10.581,0l-224,128c-3.328,1.899-5.376,5.44-5.376,9.259v234.667
                                    c0,3.819,2.048,7.36,5.376,9.259l224,128c1.643,0.939,3.456,1.408,5.291,1.408c1.835,0,3.648-0.469,5.291-1.408l224-128
                                    c3.328-1.899,5.376-5.44,5.376-9.259V138.667C490.667,134.848,488.619,131.307,485.291,129.408z M469.333,367.147L256,489.045
                                    L42.667,367.147V144.853L256,22.955l213.333,121.899V367.147z"></path>
                                    </g>
                                </g>
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex flex-col items-center p-4">
                <div className="flex flex-col items-center justify-center">
                    <div
                        className="text-6xl font-bold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                        {games_played}
                    </div>
                    <div
                        className={"bg-clip-text text-transparent font-bold text-4xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"}>
                        GAMES PLAYED
                    </div>
                </div>

                <div className="mt-4">
                    <div className="relative flex flex-col items-center justify-center"
                         style={{width: '80px', height: '80px'}}>
                        <h2 className="m-0 font-black">{draws}</h2>
                        <p className="m-0 text-xs">DRAWS</p>
                        <div className="absolute inset-0 h-full">
                            <svg
                                version="1.1"
                                id="Layer_1"
                                xmlns="http://www.w3.org/2000/svg"
                                xmlnsXlink="http://www.w3.org/1999/xlink"
                                x="0px"
                                y="0px"
                                viewBox="0 0 512 512"
                                style={{fill: 'rgb(153, 153, 153)'}}
                                xmlSpace="preserve"
                            >
                                <g>
                                    <g>
                                        <path d="M485.291,129.408l-224-128c-3.285-1.877-7.296-1.877-10.581,0l-224,128c-3.328,1.899-5.376,5.44-5.376,9.259v234.667
                                    c0,3.819,2.048,7.36,5.376,9.259l224,128c1.643,0.939,3.456,1.408,5.291,1.408c1.835,0,3.648-0.469,5.291-1.408l224-128
                                    c3.328-1.899,5.376-5.44,5.376-9.259V138.667C490.667,134.848,488.619,131.307,485.291,129.408z M469.333,367.147L256,489.045
                                    L42.667,367.147V144.853L256,22.955l213.333,121.899V367.147z"></path>
                                    </g>
                                </g>
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
            <div className="p-4">
                <div className="flex flex-col items-center px-4 text-center">
                    <div className="relative flex flex-col items-center justify-center"
                         style={{width: '80px', height: '80px'}}>
                        <h2 className="m-0 font-black">{player_2victories}</h2>
                        <p className="m-0 text-xs">VICTORIES</p>
                        <div className="absolute inset-0 h-full">
                            <svg
                                version="1.1"
                                id="Layer_1"
                                xmlns="http://www.w3.org/2000/svg"
                                xmlnsXlink="http://www.w3.org/1999/xlink"
                                x="0px"
                                y="0px"
                                viewBox="0 0 512 512"
                                style={{fill: 'rgb(246, 20, 87)'}}
                                xmlSpace="preserve"
                            >
                                <g>
                                    <g>
                                        <path d="M485.291,129.408l-224-128c-3.285-1.877-7.296-1.877-10.581,0l-224,128c-3.328,1.899-5.376,5.44-5.376,9.259v234.667
                                    c0,3.819,2.048,7.36,5.376,9.259l224,128c1.643,0.939,3.456,1.408,5.291,1.408c1.835,0,3.648-0.469,5.291-1.408l224-128
                                    c3.328-1.899,5.376-5.44,5.376-9.259V138.667C490.667,134.848,488.619,131.307,485.291,129.408z M469.333,367.147L256,489.045
                                    L42.667,367.147V144.853L256,22.955l213.333,121.899V367.147z"></path>
                                    </g>
                                </g>
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}


const LeftSection: React.FC<{player: Players | null, games: Game[]}> = ({ player, games }) => {
    const playerId = player?.id;
    const lastFiveGames = games.slice(-5); // Get the last 5 games played
    let wins = 0;
    let losses = 0;
    let draws = 0;

    // Calculate wins and losses for the last five games
    lastFiveGames.forEach(game => {
        if (game.player1Id === playerId) {
            if (game.player1Score > game.player2Score) {
                wins++;
            } else if (game.player1Score < game.player2Score) {
                losses++;
            }
            else {
                draws++
            }
        } else if (game.player2Id === playerId) {
            if (game.player2Score > game.player1Score) {
                wins++;
            } else if (game.player2Score < game.player1Score) {
                losses++;
            }
            else {
                draws++
            }
        }
    });

    const totalGames = Math.min(lastFiveGames.length, 5);
    const formPercentage = totalGames > 0 ? ((wins / totalGames) * 100).toFixed(2) : 0;

    return (
        <>
            <div className="left-section">
                <div className="relative flex flex-row items-center p-4">
                    <div className={"flex flex-col items-center justify-center"}>
                        {/* Points Section */}
                        <div className="relative flex flex-col items-center justify-center w-20 h-20">
                            <h2 className="m-0 font-black text-2xl">{player?.points}</h2>
                            <p className="m-0 text-sm">POINTS</p>
                            <div className="absolute inset-0">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 512 512"
                                    className="fill-[#0658f0]"
                                >
                                    <path
                                        d="M485.291,129.408l-224-128c-3.285-1.877-7.296-1.877-10.581,0l-224,128c-3.328,1.899-5.376,5.44-5.376,9.259v234.667c0,3.819,2.048,7.36,5.376,9.259l224,128c1.643,0.939,3.456,1.408,5.291,1.408c1.835,0,3.648-0.469,5.291-1.408l224-128c3.328-1.899,5.376-5.44,5.376-9.259V138.667C490.667,134.848,488.619,131.307,485.291,129.408z M469.333,367.147L256,489.045L42.667,367.147V144.853L256,22.955l213.333,121.899V367.147z"></path>
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Performance Section */}
                    <div className="p-4">
                        <div className="flex flex-col items-center mb-4">
                            <div className="text-center">
                                <span className="border-b-4 border-blue-600 text-4xl text-[#2563eb] font-bold">
                                    {Math.floor(formPercentage as number)}%
                                </span>
                                <p className="m-0"><small>Form</small></p>
                            </div>
                            <div className="text-sm">PERFORMANCE</div>
                            <div className="flex flex-row">
                                {/* Performance Indicators */}
                                {Array.from({ length: totalGames }, (_, index) => {
                                    if (index < wins) return 'W'; // Win
                                    if (index < wins + draws) return 'D'; // Draw
                                    if (index < wins + draws + losses) return 'L'; // Loss
                                    return '-'; // No result
                                }).map((indicator, index) => (
                                    <div key={index}
                                         className={`relative m-1 p-1 text-xs w-6 h-6 flex items-center justify-center ${indicator === 'W' ? 'bg-green-600' :
                                             indicator === 'L' ? 'bg-red-600' :
                                                 indicator === 'D' ? 'bg-yellow-600' :
                                                     'bg-gray-400'}`}>
                                        <span className="leading-none text-white">{indicator}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
};


const RightSection: React.FC<{player: Players | null, games: Game[]}> = ({ player, games }) => {
    const playerId = player?.id;
    const lastFiveGames = games.slice(-5); // Get the last 5 games played
    let wins = 0;
    let losses = 0;
    let draws = 0;

    // Calculate wins and losses for the last five games
    lastFiveGames.forEach(game => {
        if (game.player1Id === playerId) {
            if (game.player1Score > game.player2Score) {
                wins++;
            } else if (game.player1Score < game.player2Score) {
                losses++;
            }
            else {
                draws++
            }
        } else if (game.player2Id === playerId) {
            if (game.player2Score > game.player1Score) {
                wins++;
            } else if (game.player2Score < game.player1Score) {
                losses++;
            }
            else {
                draws++
            }
        }
    });

    const totalGames = Math.min(lastFiveGames.length, 5);
    const formPercentage = totalGames > 0 ? ((wins / totalGames) * 100).toFixed(2) : 0;
    return (
        <>
            <div className="left-section">
                <div className="relative flex flex-row items-center p-4">
                    {/* Performance Section */}
                    <div className="p-4">
                        <div className="flex flex-col items-center mb-4">
                            <div className="text-center">
                                <span className="border-b-4 border-red-600 text-4xl text-red-600 font-bold">{Math.floor(formPercentage as number)}%</span>
                                <p className="m-0"><small>Form</small></p>
                            </div>
                            <div className="text-sm">PERFORMANCE</div>
                            <div className="flex flex-row">
                                {/* Performance Indicators */}
                                {Array.from({ length: totalGames }, (_, index) => {
                                    if (index < wins) return 'W'; // Win
                                    if (index < wins + draws) return 'D'; // Draw
                                    if (index < wins + draws + losses) return 'L'; // Loss
                                    return '-'; // No result
                                })
                                    .reverse()
                                    .map((indicator, index) => (
                                    <div key={index}
                                         className={`relative m-1 p-1 text-xs w-6 h-6 flex items-center justify-center ${indicator === 'W' ? 'bg-green-600' :
                                             indicator === 'L' ? 'bg-red-600' :
                                                 indicator === 'D' ? 'bg-yellow-600' :
                                                     'bg-gray-400'}`}>
                                        <span className="leading-none text-white">{indicator}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className={"flex flex-col items-center justify-center"}>
                        {/* Points Section */}
                        <div className="relative flex flex-col items-center justify-center w-20 h-20">
                            <h2 className="m-0 font-black text-2xl">{player?.points}</h2>
                            <p className="m-0 text-sm">POINTS</p>
                            <div className="absolute inset-0">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 512 512"
                                    className="fill-[#f61457]"
                                >
                                    <path
                                        d="M485.291,129.408l-224-128c-3.285-1.877-7.296-1.877-10.581,0l-224,128c-3.328,1.899-5.376,5.44-5.376,9.259v234.667c0,3.819,2.048,7.36,5.376,9.259l224,128c1.643,0.939,3.456,1.408,5.291,1.408c1.835,0,3.648-0.469,5.291-1.408l224-128c3.328-1.899,5.376-5.44,5.376-9.259V138.667C490.667,134.848,488.619,131.307,485.291,129.408z M469.333,367.147L256,489.045L42.667,367.147V144.853L256,22.955l213.333,121.899V367.147z"></path>
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}