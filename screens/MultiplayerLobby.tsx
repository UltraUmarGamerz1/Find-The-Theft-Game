import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../App';
import { View } from '../types';
import type { MultiplayerSession, Player, Role } from '../types';
import ThemedButton from '../components/Button';
import { CORE_ROLES, EXTRA_ROLES } from '../constants';

const MultiplayerLobby: React.FC = () => {
    const context = useContext(AppContext);
    const [joinGameId, setJoinGameId] = useState('');
    const [copyButtonText, setCopyButtonText] = useState('Copy');

    if (!context) return null;

    const { setView, t, session, setSession, multiplayerPlayer, setGameState } = context;

    useEffect(() => {
        // Redirect to login if user reloads on this page without a name
        if (!multiplayerPlayer) {
            setView(View.MULTIPLAYER_LOGIN);
        }
    }, [multiplayerPlayer, setView]);

    const updateSessionInStorage = (newSession: MultiplayerSession) => {
        localStorage.setItem(`session-${newSession.gameId}`, JSON.stringify(newSession));
        // Manually trigger a storage event for the current tab to react
        window.dispatchEvent(new StorageEvent('storage', {
            key: `session-${newSession.gameId}`,
            newValue: JSON.stringify(newSession),
        }));
    };

    const handleCreateGame = () => {
        if (!multiplayerPlayer) return;
        const gameId = `game-${Date.now()}`;
        const newSession: MultiplayerSession = {
            gameId,
            hostId: multiplayerPlayer.id,
            players: [multiplayerPlayer],
            status: 'waiting',
        };
        setSession(newSession);
        updateSessionInStorage(newSession);
    };

    const handleJoinGame = () => {
        if (!multiplayerPlayer || !joinGameId) return;

        const sessionData = localStorage.getItem(`session-${joinGameId}`);
        if (!sessionData) {
            alert(t('Game not found.'));
            return;
        }

        const gameSession: MultiplayerSession = JSON.parse(sessionData);

        if (gameSession.status !== 'waiting') {
            alert(t('Game has already started.'));
            return;
        }

        if (gameSession.players.length >= 10) {
            alert(t('Lobby is full.'));
            return;
        }

        if (!gameSession.players.some(p => p.id === multiplayerPlayer.id)) {
            gameSession.players.push(multiplayerPlayer);
        }

        setSession(gameSession);
        updateSessionInStorage(gameSession);
    };

    const handleLeaveLobby = () => {
        if (!session || !multiplayerPlayer) return;

        const sessionData = localStorage.getItem(`session-${session.gameId}`);
        if (!sessionData) {
            setSession(null);
            return;
        }
        
        const gameSession: MultiplayerSession = JSON.parse(sessionData);
        gameSession.players = gameSession.players.filter(p => p.id !== multiplayerPlayer.id);

        // If host leaves, assign a new host or delete session
        if (gameSession.hostId === multiplayerPlayer.id) {
            if (gameSession.players.length > 0) {
                gameSession.hostId = gameSession.players[0].id;
            } else {
                localStorage.removeItem(`session-${session.gameId}`);
                setSession(null);
                return;
            }
        }
        updateSessionInStorage(gameSession);
        setSession(null);
    };

    const handleStartGame = () => {
        if (!session || !multiplayerPlayer || session.hostId !== multiplayerPlayer.id) return;
        if (session.players.length < 4) {
            alert('You need at least 4 players to start the game.');
            return;
        }

        const updatedSession = { ...session, status: 'playing' as 'playing' };
        setSession(updatedSession);
        updateSessionInStorage(updatedSession);
    };

    const handleCopyId = () => {
        if (!session) return;
        navigator.clipboard.writeText(session.gameId);
        setCopyButtonText(t('Copied!'));
        setTimeout(() => setCopyButtonText(t('Copy')), 2000);
    };
    
    // Waiting Lobby View
    if (session) {
        return (
            <div className="w-full h-full flex flex-col items-center justify-start p-4 pt-8 overflow-y-auto">
                <div className="bg-black/70 p-6 rounded-xl max-w-lg w-full space-y-4 border-2 border-[var(--accent-color)] text-center">
                    <h1 className="text-4xl font-bold text-stroke">{t('Lobby')}</h1>
                    <p className="text-xl text-stroke">{t('Share this ID with your friends:')}</p>
                    <div className="flex items-center justify-center bg-[var(--primary-color)] p-2 rounded-lg">
                        <span className="text-2xl font-mono tracking-widest">{session.gameId}</span>
                        <button onClick={handleCopyId} className="ml-4 px-3 py-1 bg-[var(--secondary-color)] text-[var(--bg-color)] rounded">{copyButtonText}</button>
                    </div>
                    <div className="bg-black/40 p-4 rounded-lg min-h-[200px]">
                        <h2 className="text-2xl text-stroke mb-2">{t('Players')} ({session.players.length}/10)</h2>
                        <ul className="space-y-2">
                            {session.players.map(p => (
                                <li key={p.id} className="text-xl text-stroke p-2 bg-[var(--secondary-color)]/20 rounded-md">
                                    {p.name} {p.id === session.hostId ? '👑' : ''}
                                </li>
                            ))}
                        </ul>
                    </div>
                    {multiplayerPlayer?.id === session.hostId ? (
                        <ThemedButton onClick={handleStartGame} disabled={session.players.length < 4}>
                            {t('Start Game')}
                        </ThemedButton>
                    ) : (
                        <p className="text-2xl text-stroke animate-pulse">{t('Waiting for players...')}</p>
                    )}
                    <div className="flex justify-around pt-4">
                        <ThemedButton variant="secondary" onClick={handleLeaveLobby}>{t('Leave Lobby')}</ThemedButton>
                    </div>
                </div>
            </div>
        );
    }
    
    // Create/Join View
    return (
        <div className="w-full h-full flex flex-col items-center justify-start p-4 pt-8 overflow-y-auto">
            <div className="bg-black/60 p-8 rounded-2xl max-w-lg w-full text-center space-y-6 border-2 border-[var(--accent-color)]">
                <h1 className="text-4xl font-bold text-stroke">Hi, {multiplayerPlayer?.name}!</h1>
                
                <ThemedButton onClick={handleCreateGame}>
                    {t('Create Game')}
                </ThemedButton>

                <div className="relative flex items-center justify-center">
                    <hr className="w-full border-[var(--secondary-color)]" />
                    <span className="absolute px-3 font-medium text-stroke bg-[var(--bg-color)]">OR</span>
                </div>

                <div className="space-y-2">
                    <input
                        type="text"
                        value={joinGameId}
                        onChange={(e) => setJoinGameId(e.target.value)}
                        placeholder={t('Enter Game ID')}
                        className="w-full p-3 rounded bg-[var(--primary-color)] text-[var(--text-color)] border-2 border-[var(--accent-color)] text-center text-2xl"
                    />
                    <ThemedButton variant="secondary" onClick={handleJoinGame} disabled={!joinGameId}>
                        {t('Join Game')}
                    </ThemedButton>
                </div>
                
                <div className="pt-6 text-center">
                    <ThemedButton variant="secondary" onClick={() => setView(View.DASHBOARD)}>
                        {t('Back')}
                    </ThemedButton>
                </div>
            </div>
        </div>
    );
};

export default MultiplayerLobby;