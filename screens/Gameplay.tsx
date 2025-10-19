import React, { useContext, useState, useMemo, useEffect } from 'react';
import { AppContext } from '../App';
import { View } from '../types';
import type { Player, Role } from '../types';
import ThemedButton from '../components/Button';
import Modal from '../components/Modal';
import PauseMenu from './PauseMenu';
import { ROLE_ICONS, CORE_ROLES, EXTRA_ROLES, HINT_COSTS } from '../constants';

const Gameplay: React.FC = () => {
    const context = useContext(AppContext);
    const [guessResult, setGuessResult] = useState<{ correct: boolean; thief: Player } | null>(null);
    const [isPaused, setIsPaused] = useState(false);
    const [isAIThinking, setIsAIThinking] = useState(false);
    const [hint, setHint] = useState<string | null>(null);
    const [hintUsed, setHintUsed] = useState(false);
    const [coinChangeMessage, setCoinChangeMessage] = useState<string>('');
    const [isHintModalOpen, setIsHintModalOpen] = useState(false);

    if (!context) return null;
    const { gameState, setGameState, setView, playSound, t, coins, setCoins, isAdminMode } = context;
    const { players, currentRound, totalRounds, rolePoints } = gameState;

    const king = useMemo(() => players.find(p => p.role === 'King'), [players]);
    const minister = useMemo(() => players.find(p => p.role === 'Minister'), [players]);
    const thief = useMemo(() => players.find(p => p.role === 'Thief'), [players]);
    
    const potentialThieves = useMemo(() => players.filter(p => p.role !== 'King' && p.role !== 'Minister'), [players]);
    const nonThieves = useMemo(() => potentialThieves.filter(p => p.id !== thief?.id), [potentialThieves, thief]);

    useEffect(() => {
        if (isAdminMode && minister && !minister.isAI && !guessResult && thief) {
            const timer = setTimeout(() => {
                handleGuess(thief);
            }, 1500);
            return () => clearTimeout(timer);
        } else if (minister && minister.isAI && !guessResult) {
            setIsAIThinking(true);
            const thinkTimer = setTimeout(() => {
                if (thief && potentialThieves.length > 0) {
                    let guessedPlayer: Player;
                    
                    // AI has a 75% chance to guess correctly
                    const isSmarterGuess = Math.random() < 0.75; 
        
                    if (isSmarterGuess) {
                        guessedPlayer = thief;
                    } else {
                        // Guess randomly from the innocent players
                        const innocentPlayers = potentialThieves.filter(p => p.id !== thief.id);
                        if (innocentPlayers.length > 0) {
                            guessedPlayer = innocentPlayers[Math.floor(Math.random() * innocentPlayers.length)];
                        } else {
                            // Fallback: if somehow only the thief is a potential guess, guess them.
                            guessedPlayer = thief;
                        }
                    }
                    handleGuess(guessedPlayer);
                }
                setIsAIThinking(false);
            }, 2500);

            return () => clearTimeout(thinkTimer);
        }
    }, [minister, guessResult, players, currentRound, isAdminMode, thief]);

    const handleGuess = (guessedPlayer: Player) => {
        if (!thief || !minister || guessResult) return;
        
        const isCorrect = guessedPlayer.id === thief.id;
        
        if (isCorrect) {
            playSound('win');
            setGameState(prev => ({
                ...prev,
                players: prev.players.map(p => p.id === minister.id ? { ...p, score: p.score + (rolePoints.Minister || 800) } : p)
            }));
        } else {
            playSound('lose');
            if (minister && !minister.isAI) {
                const penalty = 20;
                setCoins(prev => Math.max(0, prev - penalty));
                setCoinChangeMessage(`- ${penalty} ${t('Coins')} ${t('Lost')}`);
            }
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
        setHint(null);
        setHintUsed(false);
        setCoinChangeMessage('');
        if (currentRound >= totalRounds) {
            setView(View.RESULTS);
        } else {
            // Re-shuffle roles for the next round
            const rolesForGame: Role[] = [...CORE_ROLES];
            const numExtraRoles = players.length - CORE_ROLES.length;
            if (numExtraRoles > 0) {
                rolesForGame.push(...EXTRA_ROLES.slice(0, numExtraRoles));
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

    type HintType = keyof typeof HINT_COSTS;

    const handleBuyHint = (type: HintType) => {
        const cost = HINT_COSTS[type];
        if (!isAdminMode && coins < cost) {
            alert(t('Not enough coins!'));
            return;
        }
        if (!thief) return;

        let hintText = '';

        switch (type) {
            case 'SMALL':
                if (nonThieves.length < 1) {
                    alert(t('Not enough players for this hint.'));
                    return;
                }
                const randomNonThief = nonThieves[Math.floor(Math.random() * nonThieves.length)];
                hintText = `${randomNonThief.name} ${t('is not the Thief.')}`;
                break;
            case 'NORMAL':
                if (nonThieves.length < 2) {
                    alert(t('Not enough players for this hint.'));
                    return;
                }
                const revealedNormal = [...nonThieves].sort(() => 0.5 - Math.random()).slice(0, 2);
                hintText = `${revealedNormal.map(p => p.name).join(` ${t('and')} `)} ${t('are not the Thief.')}`;
                break;
            case 'BIG':
                if (nonThieves.length < 3) {
                    alert(t('Not enough players for this hint.'));
                    return;
                }
                const revealedBig = [...nonThieves].sort(() => 0.5 - Math.random()).slice(0, 3);
                const names = revealedBig.map(p => p.name);
                hintText = `${names.slice(0, -1).join(', ')} ${t('and')} ${names.slice(-1)} ${t('are not the Thief.')}`;
                break;
            case 'REAL':
                hintText = `${thief.name} ${t('is the Thief!')}`;
                break;
        }

        if (hintText) {
            if (!isAdminMode) {
                setCoins(prev => prev - cost);
            }
            setHint(hintText);
            setHintUsed(true);
            setIsHintModalOpen(false);
        }
    };


    if (!king || !minister || !thief) {
        return <div className="p-4 text-center">Error: Essential roles (King, Minister, Thief) not found. Please restart the game.</div>;
    }

    return (
        <div className="w-full h-full flex flex-col items-center justify-start p-4 pt-8 relative overflow-y-auto">
             {isAdminMode && (
                <div className="absolute top-2 left-2 bg-red-800/80 p-2 rounded-lg border-2 border-red-400 z-20 max-w-[200px]">
                    <p className="text-sm font-bold text-white animate-pulse text-center mb-1 text-stroke">ADMIN MODE</p>
                    <div className="text-xs text-white">
                        {players.map(p => (
                            <p key={p.id}>{p.name}: {p.role && t(p.role)}</p>
                        ))}
                    </div>
                </div>
             )}
             <div className="absolute top-4 right-4 flex items-center gap-4 z-10">
                <div className="bg-black/70 p-2 px-4 rounded-full flex items-center gap-2 border-2 border-[var(--accent-color)] shadow-lg">
                    <span className="text-xl" role="img" aria-label="coin">🪙</span>
                    <span className="text-xl font-bold text-stroke">{coins}</span>
                </div>
                <ThemedButton variant="secondary" className="!w-24 !h-12 !text-lg" onClick={() => setIsPaused(true)}>{t('Pause')}</ThemedButton>
            </div>
            
            <h1 className="text-4xl font-bold text-stroke mb-2">
                {t('Round')} {currentRound} {t('of')} {totalRounds}
            </h1>

            <div className="w-full max-w-md bg-[var(--secondary-color)]/30 rounded-full h-4 my-2 border-2 border-[var(--accent-color)] overflow-hidden shadow-lg">
                <div 
                    className="bg-[var(--accent-color)] h-full rounded-full transition-width duration-500 ease-in-out" 
                    style={{ width: `${(currentRound / totalRounds) * 100}%` }}
                ></div>
            </div>
            
            <div className="text-center bg-black/60 p-6 rounded-lg border-2 border-[var(--accent-color)] relative">
                {isAIThinking && (
                    <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-10 rounded-lg">
                        <p className="text-3xl text-stroke animate-pulse">{t('Minister is thinking...')}</p>
                    </div>
                )}
                <p className="text-2xl text-stroke flex items-center justify-center flex-wrap gap-x-2">
                    <span>{ROLE_ICONS.King} {t('King')} ({king.name})</span>
                    <span>{t('commands')}</span>
                    <span>{ROLE_ICONS.Minister} {t('Minister')} ({minister.name}):</span>
                </p>
                <p className="text-5xl font-black text-stroke text-[var(--accent-color)] my-4">
                    "{t('Find the Thief!')}"
                </p>

                <h2 className="text-3xl text-stroke mt-6">{t('Guess the Thief')}</h2>
                {minister && !minister.isAI && !hintUsed && (
                    <div className="text-center my-2">
                        <ThemedButton variant="secondary" onClick={() => setIsHintModalOpen(true)} className="!w-auto !h-auto !text-base">
                            {t('Buy Hint')} 🪙
                        </ThemedButton>
                    </div>
                )}
                <div className="grid grid-cols-2 gap-4 mt-2">
                    {potentialThieves.map(player => (
                        <ThemedButton
                            key={player.id}
                            variant="secondary"
                            onClick={() => handleGuess(player)}
                            disabled={!!guessResult || minister.isAI || (isAdminMode && !minister.isAI)}
                            className="flex items-center justify-center gap-2"
                        >
                            <span>{player.isAI ? '🤖' : '👤'}</span>
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
                    {coinChangeMessage && (
                        <p className="text-2xl text-stroke text-red-500 animate-pulse">
                            {coinChangeMessage}
                        </p>
                    )}
                    <div className="space-y-2 text-left bg-[var(--primary-color)]/50 p-3 rounded-lg border border-[var(--secondary-color)] max-h-48 overflow-y-auto">
                        {players.map(p => (
                            <div key={p.id} className="flex justify-between items-center text-xl text-stroke">
                                <span>{p.isAI ? '🤖' : '👤'} {p.name}</span>
                                <span className="font-sans">{p.role && `${ROLE_ICONS[p.role]} ${t(p.role)}`}</span>
                            </div>
                        ))}
                    </div>
                    <ThemedButton variant="secondary" onClick={handleNext} sound="win">
                        {currentRound >= totalRounds ? t('Show Results') : t('Next Round')}
                    </ThemedButton>
                </div>
            </Modal>
            
            <Modal isOpen={isHintModalOpen} onClose={() => setIsHintModalOpen(false)} title={t('Buy Hint')}>
                <div className="flex flex-col space-y-3">
                    <ThemedButton
                        variant="secondary"
                        onClick={() => handleBuyHint('SMALL')}
                        disabled={!isAdminMode && (coins < HINT_COSTS.SMALL || nonThieves.length < 1)}
                        className="!h-auto !text-lg !p-3"
                    >
                        <div className="flex flex-col items-center">
                            <span>{t('Small Hint')} (🪙{HINT_COSTS.SMALL})</span>
                            <span className="text-sm font-normal opacity-80">{t('Reveal one innocent player.')}</span>
                        </div>
                    </ThemedButton>

                    <ThemedButton
                        variant="secondary"
                        onClick={() => handleBuyHint('NORMAL')}
                        disabled={!isAdminMode && (coins < HINT_COSTS.NORMAL || nonThieves.length < 2)}
                        className="!h-auto !text-lg !p-3"
                    >
                        <div className="flex flex-col items-center">
                            <span>{t('Normal Hint')} (🪙{HINT_COSTS.NORMAL})</span>
                            <span className="text-sm font-normal opacity-80">{t('Reveal two innocent players.')}</span>
                        </div>
                    </ThemedButton>

                    <ThemedButton
                        variant="secondary"
                        onClick={() => handleBuyHint('BIG')}
                        disabled={!isAdminMode && (coins < HINT_COSTS.BIG || nonThieves.length < 3)}
                        className="!h-auto !text-lg !p-3"
                    >
                        <div className="flex flex-col items-center">
                            <span>{t('Big Hint')} (🪙{HINT_COSTS.BIG})</span>
                            <span className="text-sm font-normal opacity-80">{t('Reveal three innocent players.')}</span>
                        </div>
                    </ThemedButton>

                    <ThemedButton
                        variant="secondary"
                        onClick={() => handleBuyHint('REAL')}
                        disabled={!isAdminMode && coins < HINT_COSTS.REAL}
                        className="!h-auto !text-lg !p-3"
                    >
                        <div className="flex flex-col items-center">
                            <span>{t('Real Answer')} (🪙{HINT_COSTS.REAL})</span>
                            <span className="text-sm font-normal opacity-80">{t('Reveal the Thief!')}</span>
                        </div>
                    </ThemedButton>
                </div>
            </Modal>

            <Modal isOpen={!!hint} onClose={() => setHint(null)} title={t('Hint')}>
                <div className='text-center space-y-4'>
                    <p className="text-3xl text-stroke">{hint}</p>
                    <ThemedButton variant="secondary" onClick={() => setHint(null)}>{t('OK')}</ThemedButton>
                </div>
            </Modal>
            
            <PauseMenu isOpen={isPaused} onClose={() => setIsPaused(false)} />
        </div>
    );
};

export default Gameplay;