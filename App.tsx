import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { View } from './types';
import type { Settings, GameState, Suggestion, BugReport, Player, Role, MultiplayerSession, MultiplayerPlayer } from './types';
import { DEFAULT_SETTINGS, DEFAULT_ROLE_POINTS, TRANSLATIONS, SOUNDS, CORE_ROLES, EXTRA_ROLES } from './constants';
import Dashboard from './screens/Dashboard';
import SettingsScreen from './screens/Settings';
import SuggestionsScreen from './screens/Suggestions';
import BugReportScreen from './screens/BugReport';
import PlayerSetup from './screens/PlayerSetup';
import RoleAssignment from './screens/RoleAssignment';
import Gameplay from './screens/Gameplay';
import Results from './screens/Results';
import MultiplayerLogin from './screens/MultiplayerLogin';
import MultiplayerLobby from './screens/MultiplayerLobby';
import Tutorial from './screens/Tutorial';

// --- Context ---
interface AppContextType {
    setView: (view: View) => void;
    settings: Settings;
    updateSettings: (newSettings: Partial<Settings>) => void;
    gameState: GameState;
    setGameState: React.Dispatch<React.SetStateAction<GameState>>;
    resetGame: () => void;
    suggestions: Suggestion[];
    addSuggestion: (text: string) => void;
    removeSuggestion: (id: string) => void;
    bugReports: BugReport[];
    addBugReport: (text: string, screenshot?: string) => void;
    removeBugReport: (id: string) => void;
    t: (key: string) => string;
    playSound: (sound: keyof typeof SOUNDS) => void;
    vibrate: () => void;
    coins: number;
    setCoins: React.Dispatch<React.SetStateAction<number>>;
    isAdminMode: boolean;
    setIsAdminMode: React.Dispatch<React.SetStateAction<boolean>>;
    // Multiplayer state
    multiplayerName: string;
    setMultiplayerName: React.Dispatch<React.SetStateAction<string>>;
    session: MultiplayerSession | null;
    setSession: React.Dispatch<React.SetStateAction<MultiplayerSession | null>>;
    multiplayerPlayer: MultiplayerPlayer | null;
}

export const AppContext = React.createContext<AppContextType | null>(null);

// --- Custom Hooks ---
function useLocalStorage<T,>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
    const [storedValue, setStoredValue] = useState<T>(() => {
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.error(error);
            return initialValue;
        }
    });

    const setValue = (value: T | ((val: T) => T)) => {
        try {
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            setStoredValue(valueToStore);
            window.localStorage.setItem(key, JSON.stringify(valueToStore));
        } catch (error) {
            console.error(error);
        }
    };

    return [storedValue, setValue];
}

// --- App Component ---
export default function App() {
    const [view, setView] = useState<View>(View.DASHBOARD);
    const [settings, setSettings] = useLocalStorage<Settings>('settings', DEFAULT_SETTINGS);
    const [suggestions, setSuggestions] = useLocalStorage<Suggestion[]>('suggestions', []);
    const [bugReports, setBugReports] = useLocalStorage<BugReport[]>('bug-reports', []);
    const [coins, setCoins] = useLocalStorage<number>('coins', 0);
    const [isAdminMode, setIsAdminMode] = useState(false);
    const [multiplayerName, setMultiplayerName] = useLocalStorage<string>('multiplayerName', '');
    const [session, setSession] = useState<MultiplayerSession | null>(null);

    const multiplayerPlayer = useMemo<MultiplayerPlayer | null>(() => {
        if (!multiplayerName) return null;
        return { id: multiplayerName, name: multiplayerName }; // Simple ID for now
    }, [multiplayerName]);
    
    const initialGameState: GameState = useMemo(() => ({
        players: [],
        rolePoints: DEFAULT_ROLE_POINTS,
        totalRounds: 10,
        currentRound: 1,
        roundHistory: [],
    }), []);

    const [gameState, setGameState] = useState<GameState>(initialGameState);
    
    const audioRefs = useRef<{[key: string]: HTMLAudioElement}>({});

    useEffect(() => {
        Object.entries(SOUNDS).forEach(([key, src]) => {
            if (!audioRefs.current[key]) {
                const audio = new Audio(src);
                audio.preload = 'auto';
                if (key === 'backgroundMusic') {
                    audio.loop = true;
                }
                audioRefs.current[key] = audio;
            }
        });
    }, []);

    useEffect(() => {
        if (isAdminMode) {
            setCoins(9999);
        }
    }, [isAdminMode, setCoins]);

    // Real-time session sync using storage event
    useEffect(() => {
        const handleStorageChange = (event: StorageEvent) => {
            if (session && event.key === `session-${session.gameId}` && event.newValue) {
                const updatedSession: MultiplayerSession = JSON.parse(event.newValue);
                setSession(updatedSession);

                // If host starts the game, all players transition
                if (updatedSession.status === 'playing' && session.status === 'waiting') {
                    // Initialize game state from session
                    const gamePlayers: Player[] = updatedSession.players.map(p => ({
                        id: p.id,
                        name: p.name,
                        role: null,
                        score: 0,
                        isAI: false,
                    }));

                    const rolesForGame: Role[] = [...CORE_ROLES, ...EXTRA_ROLES.slice(0, gamePlayers.length - CORE_ROLES.length)];
                    const shuffledRoles = rolesForGame.sort(() => Math.random() - 0.5);

                    const playersWithRoles = gamePlayers.map((player, index) => ({
                        ...player,
                        role: shuffledRoles[index]
                    }));

                    setGameState(prev => ({
                        ...prev,
                        players: playersWithRoles,
                        currentRound: 1,
                        totalRounds: 10, // Default for now
                    }));
                    setView(View.ROLE_ASSIGNMENT);
                }
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, [session, setGameState, setSession]);


    useEffect(() => {
        document.documentElement.setAttribute('data-theme', settings.theme);
    }, [settings.theme]);

    useEffect(() => {
        const bgMusic = audioRefs.current.backgroundMusic;
        if (bgMusic) {
            if (settings.music && bgMusic.paused) {
                bgMusic.play().catch(e => console.error("Autoplay prevented", e));
            } else if (!settings.music && !bgMusic.paused) {
                bgMusic.pause();
            }
        }
    }, [settings.music]);


    const playSound = useCallback((sound: keyof typeof SOUNDS) => {
        if (settings.sound) {
            const audio = audioRefs.current[sound];
            if (audio) {
                audio.currentTime = 0;
                audio.play().catch(e => console.error("Sound play failed", e));
            }
        }
    }, [settings.sound]);

    const vibrate = useCallback(() => {
        if (settings.vibration && 'vibrate' in navigator) {
            navigator.vibrate(100);
        }
    }, [settings.vibration]);

    const updateSettings = useCallback((newSettings: Partial<Settings>) => {
        setSettings(prev => ({ ...prev, ...newSettings }));
    }, [setSettings]);

    const addSuggestion = useCallback((text: string) => {
        const newSuggestion: Suggestion = { id: Date.now().toString(), text, timestamp: Date.now() };
        setSuggestions(prev => [newSuggestion, ...prev]);
    }, [setSuggestions]);
    
    const removeSuggestion = useCallback((id: string) => {
        setSuggestions(prev => prev.filter(s => s.id !== id));
    }, [setSuggestions]);

    const addBugReport = useCallback((text: string, screenshot?: string) => {
        const newBugReport: BugReport = { id: Date.now().toString(), text, screenshot, timestamp: Date.now() };
        setBugReports(prev => [newBugReport, ...prev]);
    }, [setBugReports]);

    const removeBugReport = useCallback((id: string) => {
        setBugReports(prev => prev.filter(b => b.id !== id));
    }, [setBugReports]);

    const resetGame = useCallback(() => {
        const rolesForGame: Role[] = [...CORE_ROLES];
        const numPlayers = gameState.players.length;
        const numExtraRoles = numPlayers > 0 ? numPlayers - CORE_ROLES.length : 0;

        if (numExtraRoles > 0) {
            rolesForGame.push(...EXTRA_ROLES.slice(0, numExtraRoles));
        }
        const shuffledRoles = rolesForGame.sort(() => Math.random() - 0.5);

        const playersWithNewRoles = gameState.players.map((player, index) => ({
            ...player,
            role: shuffledRoles[index]
        }));
        
        setGameState(prev => ({
            ...initialGameState,
            players: playersWithNewRoles.map(p => ({...p, score: 0})), // Reset scores but keep names
            rolePoints: prev.rolePoints,
            totalRounds: prev.totalRounds
        }));
    }, [gameState.players, initialGameState, setGameState]);
    
    const t = useCallback((key: string): string => {
        return TRANSLATIONS[settings.language][key] || key;
    }, [settings.language]);

    const contextValue = useMemo(() => ({
        setView,
        settings,
        updateSettings,
        gameState,
        setGameState,
        resetGame,
        suggestions,
        addSuggestion,
        removeSuggestion,
        bugReports,
        addBugReport,
        removeBugReport,
        t,
        playSound,
        vibrate,
        coins,
        setCoins,
        isAdminMode,
        setIsAdminMode,
        multiplayerName,
        setMultiplayerName,
        session,
        setSession,
        multiplayerPlayer
    }), [settings, updateSettings, gameState, resetGame, suggestions, removeSuggestion, bugReports, removeBugReport, t, playSound, vibrate, coins, isAdminMode, multiplayerName, session, multiplayerPlayer, addSuggestion, addBugReport, setGameState, setCoins, setIsAdminMode, setMultiplayerName, setSession]);

    const renderView = () => {
        switch (view) {
            case View.DASHBOARD:
                return <Dashboard />;
            case View.SETTINGS:
                return <SettingsScreen />;
            case View.SUGGESTIONS:
                return <SuggestionsScreen />;
            case View.BUG_REPORT:
                return <BugReportScreen />;
            case View.PLAYER_SETUP:
                return <PlayerSetup />;
            case View.ROLE_ASSIGNMENT:
                return <RoleAssignment />;
            case View.GAMEPLAY:
                return <Gameplay />;
            case View.RESULTS:
                 return <Results />;
            case View.MULTIPLAYER_LOGIN:
                return <MultiplayerLogin />;
            case View.MULTIPLAYER_LOBBY:
                return <MultiplayerLobby />;
            case View.TUTORIAL:
                return <Tutorial />;
            default:
                return <Dashboard />;
        }
    };

    return (
        <AppContext.Provider value={contextValue}>
            <div className="w-full h-screen overflow-hidden bg-black/50 text-[var(--text-color)] relative">
                {isAdminMode && (
                    <div 
                        className="absolute top-0 left-0 right-0 bg-red-800 text-white text-center py-1 z-[100] text-sm font-bold animate-pulse"
                        style={{ fontFamily: 'sans-serif', letterSpacing: '1px' }}
                    >
                        ADMIN MODE ACTIVE
                    </div>
                )}
                <div className={`w-full h-full ${isAdminMode ? 'pt-6' : ''}`}>
                    {renderView()}
                </div>
            </div>
        </AppContext.Provider>
    );
}