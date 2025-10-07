import React, { useContext, useMemo } from 'react';
import { AppContext } from '../App';
import { View } from '../types';
import ThemedButton from '../components/Button';

const Results: React.FC = () => {
    const context = useContext(AppContext);
    if (!context) return null;

    const { gameState, setView, resetGame, t } = context;

    const sortedPlayers = useMemo(() => {
        return [...gameState.players].sort((a, b) => b.score - a.score);
    }, [gameState.players]);
    
    const handleRestart = () => {
        resetGame();
        setView(View.ROLE_ASSIGNMENT);
    };

    const getRankContent = (index: number) => {
        switch (index) {
            case 0: return '🏆 1st';
            case 1: return '🥈 2nd';
            case 2: return '🥉 3rd';
            default: return `${index + 1}th`;
        }
    };

    return (
        <div className="w-full h-full flex flex-col items-center justify-center p-4">
            <div className="bg-black/70 p-8 rounded-2xl max-w-lg w-full space-y-4 border-2 border-[var(--accent-color)]">
                <h1 className="text-5xl font-bold text-stroke text-center mb-6">{t('Game Over')}</h1>
                <h2 className="text-3xl text-stroke text-center mb-4">{t('Final Scores')}</h2>

                <div className="space-y-3">
                    {sortedPlayers.map((player, index) => (
                        <div key={player.id} className={`flex items-center justify-between p-3 rounded-lg ${index === 0 ? 'bg-[var(--glow-color)] text-black' : 'bg-[var(--primary-color)]'}`}>
                            <span className={`font-bold text-xl ${index === 0 ? 'text-black' : 'text-stroke'}`}>
                                {getRankContent(index)}
                                {index === 0 && <span className="ml-2">👑</span>}
                            </span>
                            <span className="text-2xl font-bold">{player.name}</span>
                            <span className="text-xl font-semibold">{player.score} {t('Points')}</span>
                        </div>
                    ))}
                    {sortedPlayers.length > 3 && sortedPlayers.slice(3).map((player, index) => (
                         <div key={player.id} className="flex items-center justify-between p-3 rounded-lg bg-[var(--primary-color)] opacity-70">
                            <span className="font-bold text-xl text-stroke">{t('Lost')}</span>
                            <span className="text-2xl font-bold">{player.name}</span>
                            <span className="text-xl font-semibold">{player.score} {t('Points')}</span>
                        </div>
                    ))}
                </div>

                <div className="pt-6 flex justify-around">
                    <ThemedButton variant="secondary" onClick={handleRestart}>{t('Restart')}</ThemedButton>
                    <ThemedButton variant="secondary" onClick={() => setView(View.DASHBOARD)}>{t('Exit')}</ThemedButton>
                </div>
            </div>
            <footer className="absolute bottom-4 text-center w-full text-sm text-stroke opacity-70">
                Ultra Gamerz Studio
            </footer>
        </div>
    );
};

export default Results;
