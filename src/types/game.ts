export type GamePhase =
  | 'home'
  | 'lobby'
  | 'role_reveal'
  | 'clue_phase'
  | 'voting_phase'
  | 'vote_reveal'
  | 'game_over';

export type PlayerRole = 'crew' | 'imposter';

export interface Player {
  id: string;
  name: string;
  avatar: string;
  color: string;
  isHost: boolean;
  isBot: boolean;
  role: PlayerRole;
  isReady: boolean;
  votedFor?: string | null; // player id or 'skip'
  hasSubmittedClue?: boolean;
}

export interface ClueItem {
  id: string;
  playerId: string;
  playerName: string;
  playerAvatar: string;
  playerColor: string;
  isBot: boolean;
  round: number;
  clue: string;
  timestamp: number;
  reactions: Record<string, number>;
}

export interface GameSettings {
  imposterCount: number;
  roundCount: number; // number of clue rounds (e.g. 1 to 3)
  turnTimerSeconds: number; // 30, 45, 60, or 0 for unlimited
  category: string;
  customCategoryPrompt: string;
  geminiApiKey: string;
  useGeminiApi: boolean;
  botCount: number;
}

export interface WordData {
  category: string;
  secretWord: string;
  imposterHint: string; // The single subtle clue given to the imposter
  difficulty?: 'easy' | 'medium' | 'hard';
  description?: string;
}

export interface VoteResult {
  votedOutPlayerId: string | null;
  votedOutPlayerName: string | null;
  votedOutRole: PlayerRole | null;
  isImposterCaught: boolean;
  isTie: boolean;
  voteCounts: Record<string, number>; // playerId -> count
  skippedCount: number;
  imposterGuessAttempt?: string;
  imposterGuessSuccess?: boolean;
}

export interface GameStats {
  winner: 'crew' | 'imposter';
  reason: string;
  totalRounds: number;
  mvpPlayerName?: string;
  aiDebrief?: string;
}
