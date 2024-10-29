import React from 'react';

const PlayerStatistics: React.FC = () => {
    // Sample player statistics data
    const statistics = [
        { player: "John Doe", gamesPlayed: 20, goals: 15, assists: 5 },
        { player: "Jane Smith", gamesPlayed: 22, goals: 10, assists: 8 },
        { player: "Mike Johnson", gamesPlayed: 18, goals: 12, assists: 4 },
    ];

    return (
        <div className="flex flex-col p-6 bg-gray-100 h-full">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Player Statistics</h1>
            <table className="min-w-full bg-white border border-gray-300 rounded-lg shadow-md">
                <thead>
                <tr className="bg-blue-900 text-white">
                    <th className="py-2 px-4 border-b">Player</th>
                    <th className="py-2 px-4 border-b">Games Played</th>
                    <th className="py-2 px-4 border-b">Goals</th>
                    <th className="py-2 px-4 border-b">Assists</th>
                </tr>
                </thead>
                <tbody>
                {statistics.map((stat, index) => (
                    <tr key={index} className="hover:bg-gray-100">
                        <td className="py-2 px-4 border-b">{stat.player}</td>
                        <td className="py-2 px-4 border-b">{stat.gamesPlayed}</td>
                        <td className="py-2 px-4 border-b">{stat.goals}</td>
                        <td className="py-2 px-4 border-b">{stat.assists}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default PlayerStatistics;
