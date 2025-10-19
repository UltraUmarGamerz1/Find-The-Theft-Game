export enum View {
  DASHBOARD,
  SETTINGS,
  SUGGESTIONS,
  BUG_REPORT,
  PLAYER_SETUP,
  ROLE_ASSIGNMENT,
  GAMEPLAY,
  RESULTS,
  MULTIPLAYER_LOGIN,
  MULTIPLAYER_LOBBY,
  TUTORIAL,
}

export type Theme = 'wooden' | 'modern' | 'minecraft' | 'gta5' | 'classic' | 'paper' | 'real_life';
export type Language = 'en' | 'ur' | 'hi' | 'ro';

export interface Settings {
  theme: Theme;
  sound: boolean;
  vibration: boolean;
  music: boolean;
  language: Language;
}

export const ROLES = ['King', 'Minister', 'Soldier', 'Thief', 'Laundry', 'Cleaner', 'Chef', 'Gardener', 'Prince', 'Queen'] as const;
export type Role = typeof ROLES[number];

export interface Player {
  id: string;
  name: string;
  role: Role | null;
  score: number;
  isAI: boolean;
}

export interface RolePoints {
  King: number;
  Minister: number;
  Soldier: number;
  Thief: number;
  Laundry: number;
  Cleaner: number;
  Chef: number;
  Gardener: number;
  Prince: number;
  Queen: number;
}

export interface GameState {
  players: Player[];
  rolePoints: RolePoints;
  totalRounds: number;
  currentRound: number;
  roundHistory: any[];
}

export interface Suggestion {
  id: string;
  text: string;
  timestamp: number;
}

export interface BugReport {
  id: string;
  text: string;
  screenshot?: string; // base64 string
  timestamp: number;
}

// --- Multiplayer Types ---
export interface MultiplayerPlayer {
  id: string;
  name: string;
}

export interface MultiplayerSession {
  gameId: string;
  hostId: string;
  players: MultiplayerPlayer[];
  status: 'waiting' | 'playing' | 'finished';
  // We can expand this later to sync game state
  gameState?: GameState; 
}