import React, { useContext, useState } from 'react';
import { AppContext } from '../App';
import { View } from '../types';
import type { Player, Role, RolePoints } from '../types';
import ThemedButton from '../components/Button';

const PlayerSetup: React.FC = () => {
    const context = useContext(AppContext);
    const [numPlayers, setNumPlayers] = useState(4);
    const [playerNames, setPlayerNames] = useState<string[]>(Array(4).fill(''));
    const [rolePoints, setRolePoints] = useState<RolePoints>(context?.gameState.rolePoints || {});
    const [totalRounds, setTotalRounds] = useState(10);
    
    if (!context) return null;
    const { setView, setGameState, t } = context;

    const handleNumPlayersChange = (delta: number) => {
        const newNum = Math.max(4, Math.min(6, numPlayers + delta));
        setNumPlayers(newNum);
        setPlayerNames(prev => {
            const newNames = [...prev];
            while (newNames.length < newNum) newNames.push('');
            return newNames.slice(0, newNum);
        });
    };

    const handleNameChange = (index: number, name: string) => {
        setPlayerNames(prev => {
            const newNames = [...prev];
            newNames[index] = name;
            return newNames;
        });
    };

    const handlePointChange = (role: Role, value: string) => {
        const points = parseInt(value, 10) || 0;
        setRolePoints(prev => ({...prev, [role]: points}));
    };

    const handleStartGame = () => {
        if (playerNames.some(name => name.trim() === '')) {
            alert('Please enter a name for every player.');
            return;
        }

        const coreRoles: Role[] = ['King', 'Minister', 'Soldier', 'Thief'];
        const extraRoles: Role[] = ['Laundry', 'Cleaner'];

        const rolesForGame: Role[] = [...coreRoles];
        const numExtraRoles = playerNames.length - coreRoles.length;
        if (numExtraRoles > 0) {
            rolesForGame.push(...extraRoles.slice(0, numExtraRoles));
        }

        const shuffledRoles = rolesForGame.sort(() => 0.5 - Math.random());
        const players: Player[] = playerNames.map((name, i) => ({
            id: `p${i+1}`,
            name,
            role: shuffledRoles[i],
            score: 0,
        }));
        
        setGameState(prev => ({
            ...prev,
            players,
            rolePoints,
            totalRounds,
            currentRound: 1,
        }));
        setView(View.ROLE_ASSIGNMENT);
    };

    return (
        <div className="w-full h-full flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-black/70 p-6 rounded-xl max-w-3xl w-full space-y-4 border-2 border-[var(--accent-color)]">
                <h1 className="text-4xl font-bold text-stroke text-center mb-4">{t('Enter Players')}</h1>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left Column: Player Names */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-center space-x-4">
                            <label className="text-xl text-stroke">{t('Number of Players')}</label>
                            <button onClick={() => handleNumPlayersChange(-1)} className="text-4xl w-10 h-10 bg-[var(--secondary-color)] text-[var(--bg-color)] rounded-full">-</button>
                            <span className="text-3xl font-bold">{numPlayers}</span>
                            <button onClick={() => handleNumPlayersChange(1)} className="text-4xl w-10 h-10 bg-[var(--secondary-color)] text-[var(--bg-color)] rounded-full">+</button>
                        </div>
                        {playerNames.map((name, i) => (
                            <input
                                key={i}
                                type="text"
                                placeholder={`${t('Player Name')} ${i + 1}`}
                                value={name}
                                onChange={(e) => handleNameChange(i, e.target.value)}
                                className="w-full p-2 rounded bg-[var(--primary-color)] text-[var(--text-color)] border-2 border-[var(--accent-color)]"
                            />
                        ))}
                    </div>
                    
                    {/* Right Column: Game Settings */}
                    <div className="space-y-4">
                        <h2 className="text-2xl text-stroke">{t('Role Points')}</h2>
                        <div className="grid grid-cols-2 gap-2">
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