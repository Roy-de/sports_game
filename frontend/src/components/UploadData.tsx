import React, { useEffect, useState } from 'react';

interface Player {
    id: number;
    name: string;
}

interface GameData {
    player1Id: number;
    player2Id: number;
    player1Score: number;
    player2Score: number;
}

const UploadData: React.FC = () => {
    const [players, setPlayers] = useState<Player[]>([]);
    const [formData, setFormData] = useState<GameData>({
        player1Id: 0,
        player2Id: 0,
        player1Score: 0,
        player2Score: 0,
    });
    const [error, setError] = useState<string | null>(null);

    // Fetch players from the API
    useEffect(() => {
        const fetchPlayers = async () => {
            try {
                const response = await fetch('/api/players');
                if (!response.ok) throw new Error('Failed to fetch players');
                const data = await response.json();
                setPlayers(data);
                // Set initial values for the form
                if (data.length > 1) {
                    setFormData({
                        player1Id: data[0].id,
                        player2Id: data[1].id,
                        player1Score: 0,
                        player2Score: 0,
                    });
                }
            } catch (error) {
                console.error(error);
                setError('Error fetching players');
            }
        };

        fetchPlayers();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: name.includes('Score') ? parseInt(value) : parseInt(value),
        }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const { player1Id, player2Id, player1Score, player2Score } = formData;

        // Validate that Player 1 and Player 2 are not the same
        if (player1Id === player2Id) {
            setError('Players cannot be the same.');
            return;
        }

        // Validate that scores are non-negative
        if (player1Score < 0 || player2Score < 0) {
            setError('Scores cannot be negative.');
            return;
        }

        setError(null); // Clear any previous error

        console.log('Game Data Submitted:', formData);
        try {
            const response = await fetch('/api/games', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) throw new Error('Failed to save game data');

            // Reset form data after successful submission
            setFormData({
                player1Id: players[0]?.id || 0,
                player2Id: players[1]?.id || 0,
                player1Score: 0,
                player2Score: 0,
            });
            alert('Game data saved successfully!');
        } catch (error) {
            console.error(error);
            setError('Failed to save game data.');
        }
    };

    return (
        <div className="h-screen flex flex-row">
            <form onSubmit={handleSubmit} className="flex flex-col space-y-10 items-start justify-start h-full w-fit mx-auto pt-20">
                {error && <div className="text-red-500 mb-4">{error}</div>}
                <div className={"flex flex-row space-x-20"}>
                    <div>
                        <label className="block mb-1">Player 1</label>
                        <select
                            name="player1Id"
                            className="appearance-none w-96 p-2 pr-10 text-xl bg-transparent border border-slate-500"
                            value={formData.player1Id}
                            onChange={handleChange}
                        >
                            {players.map((player) => (
                                <option key={player.id} value={player.id}>{player.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block mb-1">Player 2</label>
                        <select
                            name="player2Id"
                            className="appearance-none p-2 pr-10 text-xl bg-transparent border border-slate-500 w-96"
                            value={formData.player2Id}
                            onChange={handleChange}
                        >
                            {players.map((player) => (
                                <option key={player.id} value={player.id}>{player.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className={"flex flex-row space-x-20"}>
                    <div>
                        <label className="block mb-1">Player 1 Score</label>
                        <input
                            type="number"
                            name="player1Score"
                            className="p-2 rounded text-lg w-96"
                            value={formData.player1Score}
                            onChange={handleChange}
                        />
                    </div>
                    <div>
                        <label className="block mb-1">Player 2 Score</label>
                        <input
                            type="number"
                            name="player2Score"
                            className="p-2 rounded text-lg w-96"
                            value={formData.player2Score}
                            onChange={handleChange}
                        />
                    </div>
                </div>
                <button type="submit"
                        className="mt-4 bg-gradient-to-r from-[#005dff] via-[#9935b9] to-[#fd185a] w-full text-white py-2 font-bold">
                    Save Game Data
                </button>
            </form>
        </div>
    );
};

export default UploadData;
