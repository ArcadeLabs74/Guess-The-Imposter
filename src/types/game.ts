export type GamePhase = 'home' | 'reveal' | 'clue' | 'vote' | 'results';

export type PlayerRole = 'crew' | 'imposter';

export interface Player {
  id: string;
  name: string;
  color: string;
  role: PlayerRole;
  votedFor: string | null; // player id or 'skip'
}

export interface GameSettings {
  imposterCount: number;
  roundCount: number;
  category: string;
}

export interface WordData {
  category: string;
  secretWord: string;
  imposterHint: string;
}

export interface ClueItem {
  id: string;
  playerId: string;
  playerName: string;
  playerColor: string;
  round: number;
  text: string;
}

export interface VoteResult {
  ejectedPlayerId: string | null;
  ejectedPlayerName: string | null;
  ejectedRole: PlayerRole | null;
  isTie: boolean;
  voteCounts: Record<string, number>;
  skippedCount: number;
}
