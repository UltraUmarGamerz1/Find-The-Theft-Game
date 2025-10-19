import React, { useContext, useState } from 'react';
import { AppContext } from '../App';
import { View } from '../types';
import type { Player, Role, RolePoints } from '../types';
import ThemedButton from '../components/Button';
import { CORE_ROLES, EXTRA_ROLES } from '../constants';

interface CustomPlayer {
    name: string;
    isAI: boolean;
}

const PlayerSetup: React.FC = () => {
    const context = useContext(AppContext);
    const [players, setPlayers] = useState<CustomPlayer[]>([
        { name: '', isAI: false },
        { name: '', isAI: false },
        { name: '', isAI: false },
        { name: '', isAI: false },
    ]);
    const [rolePoints, setRolePoints] = useState<RolePoints>(context?.gameState.rolePoints || {});
    const [totalRounds, setTotalRounds] = useState(10);
    
    if (!context) return null;
    const { setView, setGameState, t } = context;

    const handleAddPlayer = () => {
        if (players.length < 10) {
            setPlayers([...players, { name: '', isAI: false }]);
        }
    };

    const handleRemovePlayer = (index: number) => {
        if (players.length > 4) {
            setPlayers(players.filter((_, i) => i !== index));
        }
    };

    const handleNameChange = (index: number, newName: string) => {
        const newPlayers = [...players];
        newPlayers[index].name = newName;
        setPlayers(newPlayers);
    };

    const handleToggleAI = (index: number) => {
        const newPlayers = [...players];
        const player = newPlayers[index];
        player.isAI = !player.isAI;
        if (player.isAI) {
            let botNum = 1;
            const existingAiNames = newPlayers.filter((p, i) => i !== index && p.isAI).map(p => p.name);
            while (existingAiNames.includes(`AI Bot ${botNum}`)) {
                botNum++;
            }
            player.name = `AI Bot ${botNum}`;
        } else {
            player.name = '';
        }
        setPlayers(newPlayers);
    };

    const handlePointChange = (role: Role, value: string) => {
        const points = parseInt(value, 10) || 0;
        setRolePoints(prev => ({...prev, [role]: points}));
    };

    const handleStartGame = () => {
        if (!players.some(p => !p.isAI)) {
            alert('There must be at least one human player.');
            return;
        }

        if (players.filter(p => !p.isAI).some(p => p.name.trim() === '')) {
            alert('Please enter a name for all human players.');
            return;
        }

        const humanPlayerNames = players.filter(p => !p.isAI).map(p => p.name.trim().toLowerCase());
        const uniqueHumanNames = new Set(humanPlayerNames);
        if (uniqueHumanNames.size !== humanPlayerNames.length) {
            alert('Human player names must be unique.');
            return;
        }

        const finalPlayers: Player[] = players.map((p, i) => ({
            id: `p${i + 1}`,
            name: p.name.trim(),
            role: null,
            score: 0,
            isAI: p.isAI,
        }));

        const rolesForGame: Role[] = [...CORE_ROLES];
        const numExtraRoles = finalPlayers.length - CORE_ROLES.length;
        if (numExtraRoles > 0) {
            rolesForGame.push(...EXTRA_ROLES.slice(0, numExtraRoles));
        }

        const shuffledRoles = rolesForGame.sort(() => 0.5 - Math.random());
        const playersWithRoles: Player[] = finalPlayers.map((p, i) => ({
            ...p,
            role: shuffledRoles[i],
        }));
        
        setGameState(prev => ({
            ...prev,
            players: playersWithRoles,
            rolePoints,
            totalRounds,
            currentRound: 1,
        }));
        setView(View.ROLE_ASSIGNMENT);
    };

    return (
        <div className="w-full h-full flex items-start justify-center p-4 pt-8 overflow-y-auto">
            <div className="bg-black/70 p-6 rounded-xl max-w-3xl w-full space-y-4 border-2 border-[var(--accent-color)]">
                <h1 className="text-4xl font-bold text-stroke text-center mb-4">{t('Enter Players')}</h1>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left Column: Player and AI Setup */}
                    <div className="space-y-4">
                        <h2 className="text-2xl text-stroke text-center">{t('Player Names')}</h2>
                        <div className="space-y-2 max-h-[250px] overflow-y-auto pr-2">
                            {players.map((player, index) => (
                                <div key={index} className="flex items-center gap-2 bg-black/20 p-2 rounded-lg">
                                    <span className="text-xl text-stroke">{index + 1}.</span>
                                    <input
                                        type="text"
                                        placeholder={`${t('Player Name')}`}
                                        value={player.name}
                                        onChange={(e) => handleNameChange(index, e.target.value)}
                                        className="flex-grow p-2 rounded bg-[var(--primary-color)] text-[var(--text-color)] border-2 border-[var(--accent-color)] disabled:opacity-50"
                                        disabled={player.isAI}
                                        aria-label={`Player ${index + 1} name`}
                                    />
                                    <button
                                        onClick={() => handleToggleAI(index)}
                                        className="px-3 py-2 rounded bg-[var(--secondary-color)] text-[var(--bg-color)] font-bold w-28 text-center transition-opacity hover:opacity-80"
                                        aria-label={`Toggle Player ${index + 1} to ${player.isAI ? 'Human' : 'AI'}`}
                                    >
                                        {player.isAI ? `🤖 ${t('AI')}` : `👤 ${t('Human')}`}
                                    </button>
                                    <button
                                        onClick={() => handleRemovePlayer(index)}
                                        disabled={players.length <= 4}
                                        className="w-10 h-10 text-2xl font-bold bg-red-600 text-white rounded-full disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors"
                                        aria-label={`Remove Player ${index + 1}`}
                                    >
                                        -
                                    </button>
                                </div>
                            ))}
                        </div>
                        <div className="text-center">
                            <ThemedButton
                                variant="secondary"
                                onClick={handleAddPlayer}
                                disabled={players.length >= 10}
                                className="!w-auto"
                            >
                                + {t('Add Player')}
                            </ThemedButton>
                        </div>
                        <div className="text-center text-lg text-stroke opacity-80">
                            Total Players: {players.length}
                        </div>
                    </div>
                    
                    {/* Right Column: Game Settings */}
                    <div className="space-y-4">
                        <h2 className="text-2xl text-stroke">{t('Role Points')}</h2>
                        <div className="grid grid-cols-2 gap-2 max-h-[250px] overflow-y-auto pr-2">
                            {Object.entries(rolePoints).map(([role, points]) => (
                                <div key={role}>
                                    <label className="text-lg">{t(role)}</label>
                                    <input
                                        type="number"
                                        value={points}
                                        onChange={(e) => handlePointChange(role as Role, e.target.value)}
                                        className="w-full p-1 rounded bg-[var(--primary-color)] text-[var(--text-color)] border-2 border-[var(--accent-color)]"
                                    />
                                </div>
                            ))}
                        </div>
                        <div>
                            <label className="text-2xl text-stroke">{t('Total Rounds')}</label>
                            <input
                                type="number"
                                value={totalRounds}
                                onChange={(e) => setTotalRounds(Math.max(1, parseInt(e.target.value) || 1))}
                                className="w-full p-2 rounded bg-[var(--primary-color)] text-[var(--text-color)] border-2 border-[var(--accent-color)]"
                            />
                        </div>
                    </div>
                </div>

                <div className="pt-4 flex justify-around">
                    <ThemedButton variant="secondary" onClick={() => setView(View.DASHBOARD)}>{t('Back')}</ThemedButton>
                    <ThemedButton variant="secondary" onClick={handleStartGame}>{t('Start Game')}</ThemedButton>
                </div>
            </div>
        </div>
    );
};

export default PlayerSetup;