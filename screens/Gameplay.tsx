import React, { useContext, useState, useMemo } from 'react';
import { AppContext } from '../App';
import { View } from '../types';
import type { Player, Role } from '../types';
import ThemedButton from '../components/Button';
import Modal from '../components/Modal';
import PauseMenu from './PauseMenu';
import { ROLE_ICONS } from '../constants';

const Gameplay: React.FC = () => {
    const context = useContext(AppContext);
    const [guessResult, setGuessResult] = useState<{ correct: boolean; thief: Player } | null>(null);
    const [isPaused, setIsPaused] = useState(false);

    if (!context) return null;
    const { gameState, setGameState, setView, playSound, t } = context;
    const { players, currentRound, totalRounds, rolePoints } = gameState;

    const king = useMemo(() => players.find(p => p.role === 'King'), [players]);
    const minister = useMemo(() => players.find(p => p.role === 'Minister'), [players]);
    const thief = useMemo(() => players.find(p => p.role === 'Thief'), [players]);
    
    const potentialThieves = useMemo(() => players.filter(p => p.role !== 'King' && p.role !== 'Minister'), [players]);

    const handleGuess = (guessedPlayer: Player) => {
        if (!thief || !minister) return;
        
        const isCorrect = guessedPlayer.id === thief.id;
        
        if (isCorrect) {
            playSound('win');
            setGameState(prev => ({
                ...prev,
                players: prev.players.map(p => p.id === minister.id ? { ...p, score: p.score + (rolePoints.Minister || 800) } : p)
            }));
        } else {
            playSound('lose');
            setGameState(prev => ({
                ...prev,
                players: prev.players.map(p => {
                    if (p.id === thief.id) return { ...p, score: p.score + (rolePoints.Minister || 800) };
                    if (p.id === minister.id) return { ...p, score: 0 }; // Minister's score becomes 0
                    return p;
                })
            }));
        }
        setGuessResult({ correct: isCorrect, thief });
    };

    const handleNext = () => {
        setGuessResult(null);
        if (currentRound >= totalRounds) {
            setView(View.RESULTS);
        } else {
            // Re-shuffle roles for the next round
            const coreRoles: Role[] = ['King', 'Minister', 'Soldier', 'Thief'];
            const extraRoles: Role[] = ['Laundry', 'Cleaner'];

            const rolesForGame: Role[] = [...coreRoles];
            const numExtraRoles = players.length - coreRoles.length;
            if (numExtraRoles > 0) {
                rolesForGame.push(...extraRoles.slice(0, numExtraRoles));
            }
            const shuffledRoles = rolesForGame.sort(() => 0.5 - Math.random());
            const playersWithNewRoles = players.map((player, index) => ({
                ...player,
                role: shuffledRoles[index],
            }));

            setGameState(prev => ({
                ...prev,
                players: playersWithNewRoles,
                currentRound: prev.currentRound + 1
            }));
            setView(View.ROLE_ASSIGNMENT);
        }
    };

    if (!king || !minister || !thief) {
        return <div className="p-4 text-center">Error: Essential roles (King, Minister, Thief) not found. Please restart the game.</div>;
    }

    return (
        <div className="w-full h-full flex flex-col items-center justify-center p-4 relative">
            <ThemedButton variant="secondary" className="!absolute top-4 right-4 !w-24 !h-12 !text-lg" onClick={() => setIsPaused(true)}>{t('Pause')}</ThemedButton>
            
            <h1 className="text-4xl font-bold text-stroke mb-2">
                {t('Round')} {currentRound} {t('of')} {totalRounds}
            </h1>

            <div className="w-full max-w-md bg-[var(--secondary-color)]/30 rounded-full h-4 my-2 border-2 border-[var(--accent-color)] overflow-hidden shadow-lg">
                <div 
                    className="bg-[var(--accent-color)] h-full rounded-full transition-width duration-500 ease-in-out" 
                    style={{ width: `${(currentRound / totalRounds) * 100}%` }}
                ></div>
            </div>
            
            <div className="text-center bg-black/60 p-6 rounded-lg border-2 border-[var(--accent-color)]">
                <p className="text-2xl text-stroke flex items-center justify-center flex-wrap gap-x-2">
                    <span>{ROLE_ICONS.King} {t('King')} ({king.name})</span>
                    <span>{t('commands')}</span>
                    <span>{ROLE_ICONS.Minister} {t('Minister')} ({minister.name}):</span>
                </p>
                <p className="text-5xl font-black text-stroke text-[var(--accent-color)] my-4">
                    "{t('Find the Thief!')}"
                </p>

                <h2 className="text-3xl text-stroke mt-6">{t('Guess the Thief')}</h2>
                <div className="grid grid-cols-2 gap-4 mt-4">
                    {potentialThieves.map(player => (
                        <ThemedButton
                            key={player.id}
                            variant="secondary"
                            onClick={() => handleGuess(player)}
                            disabled={!!guessResult}
                            className="flex items-center justify-center gap-2"
                        >
                            <span>👤</span>
                            <span>{player.name}</span>
                        </ThemedButton>
                    ))}
                </div>
            </div>

            <Modal isOpen={!!guessResult} title={guessResult?.correct ? t('Correct Guess!') : t('Wrong Guess!')}>
                <div className="text-center space-y-4">
                    <p className="text-3xl text-stroke mb-4">
                        {guessResult?.thief.name} {t('was the Thief.')} {ROLE_ICONS.Thief}
                    </p>
                    <div className="space-y-2 text-left bg-[var(--primary-color)]/50 p-3 rounded-lg border border-[var(--secondary-color)] max-h-48 overflow-y-auto">
                        {players.map(p => (
                            <div key={p.id} className="flex justify-between items-center text-xl text-stroke">
                                <span>{p.name}</span>
                                <span className="font-sans">{p.role && `${ROLE_ICONS[p.role]} ${t(p.role)}`}</span>
                            </div>
                        ))}
                    </div>
                    <ThemedButton variant="secondary" onClick={handleNext} sound="win">
                        {currentRound >= totalRounds ? t('Show Results') : t('Next Round')}
                    </ThemedButton>
                </div>
            </Modal>
            
            <PauseMenu isOpen={isPaused} onClose={() => setIsPaused(false)} />
        </div>
    );
};

export default Gameplay;