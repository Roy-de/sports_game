import React, { useState, useEffect } from 'react';

const PlayerManagement: React.FC = () => {
    const [players, setPlayers] = useState<{ id: number; name: string; wins: number; losses: number; draws: number; points: number; }[]>([]);
    const [playerName, setPlayerName] = useState('');
    const [selectedPlayer, setSelectedPlayer] = useState<{ id: number; name: string; } | null>(null);

    useEffect(() => {
        // Fetch players on component mount
        const fetchPlayers = async () => {
            const response = await fetch('http://localhost:5000/api/players');
            const data = await response.json();
            setPlayers(data);
        };

        fetchPlayers();
    }, []);

    const handleAddPlayer = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const response = await fetch('http://localhost:5000/api/players', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name: playerName }),
        });

        if (response.ok) {
            const newPlayer = await response.json();
            setPlayers((prevPlayers) => [...prevPlayers, newPlayer]);
            setPlayerName('');
        } else {
            console.error('Failed to add player');
        }
    };

    const handleEditPlayer = (player: { id: number; name: string; }) => {
        setSelectedPlayer(player);
        setPlayerName(player.name);
    };

    const handleUpdatePlayer = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!selectedPlayer) return;

        const response = await fetch(`http://localhost:5000/api/players/${selectedPlayer.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name: playerName }),
        });

        if (response.ok) {
            const updatedPlayer = await response.json();
            setPlayers((prevPlayers) =>
                prevPlayers.map((player) => (player.id === updatedPlayer.id ? updatedPlayer : player))
            );
            setPlayerName('');
            setSelectedPlayer(null);
        } else {
            console.error('Failed to update player');
        }
    };

    const handleDeletePlayer = async (id: number) => {
        const response = await fetch(`http://localhost:5000/api/players/${id}`, {
            method: 'DELETE',
        });

        if (response.ok) {
            setPlayers((prevPlayers) => prevPlayers.filter((player) => player.id !== id));
        } else {
            console.error('Failed to delete player');
        }
    };

    return (
        <div className="player-management mt-20 flex flex-row h-screen">
            <div className={"flex flex-col items-center justify-start h-full w-fit mx-auto space-y-10"}>
                <form onSubmit={selectedPlayer ? handleUpdatePlayer : handleAddPlayer} className={"flex flex-col items-center justify-center"}>
                    <label className={"py-4 font-bold text-lg"}>
                        {selectedPlayer ? 'Update Player' : 'Create New Player'}
                    </label>
                    <div className={"space-x-6"}>
                        <input
                            type="text"
                            className={"py-1.5 px-2"}
                            value={playerName}
                            onChange={(e) => setPlayerName(e.target.value)}
                            placeholder="Enter player name"
                            required
                        />
                        <button
                            className={"bg-gradient-to-r from-[#005dff] via-[#9935b9] to-[#fd185a] text-white px-4 py-2 font-bold"}
                            type="submit">
                            {selectedPlayer ? 'Update Player' : 'Add Player'}
                        </button>
                    </div>
                </form>
                <div className={"border border-slate-200 w-full"}/>
                {/* Player Table */}
                <table className="w-full border-collapse border border-gray-300 mt-4 h-screen overflow-y-scroll">
                    <thead className={"bg-gradient-to-r from-[#005dff] via-[#9935b9] to-[#fd185a] text-white px-4 py-2 font-bold"}>
                    <tr>
                        <th className="px-10 py-2 text-left">Player Name</th>
                        <th className="px-10 py-2 text-left">Wins</th>
                        <th className="px-10 py-2 text-left">Losses</th>
                        <th className="px-10 py-2 text-left">Draws</th>
                        <th className="px-10 py-2 text-left">Points</th>
                        <th className="px-10 py-2 text-left">Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {players.map((player) => (
                        <tr key={player.id} className={`${player.id % 2 === 0 ? "bg-gray-100": ""}`}>
                            <td className="border-b border-gray-300 px-4 py-2">{player.name}</td>
                            <td className="border-b border-gray-300 px-4 py-2">{player.wins}</td>
                            <td className="border-b border-gray-300 px-4 py-2">{player.losses}</td>
                            <td className="border-b border-gray-300 px-4 py-2">{player.draws}</td>
                            <td className="border-b border-gray-300 px-4 py-2">{player.points}</td>
                            <td className="border-b border-gray-300 px-4 py-2 space-x-4">
                                <button
                                    onClick={() => handleEditPlayer(player)}
                                    className="text-blue-500 font-bold px-2 py-1 mx-1">
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDeletePlayer(player.id)}
                                    className="font-bold text-red-500 px-2 py-1">
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PlayerManagement;
