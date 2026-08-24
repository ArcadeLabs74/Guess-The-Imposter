export type GamePhase = 'home' | 'reveal' | 'clue' | 'vote' | 'results';

export type PlayerRole = 'crew' | 'imposter';

export interface Player {
  id: string;
  name: string;
  color: string;
  role: PlayerRole;
  votedFor: string | null; // player id or 'skip'
  isHost?: boolean;
  sessionId?: string;
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

// Supabase Database Row Types
export interface DbRoom {
  id: string;
  code: string;
  host_id: string;
  phase: GamePhase;
  imposter_count: number;
  round_count: number;
  category: string;
  secret_word: string | null;
  imposter_hint: string | null;
  current_round: number;
  current_turn_index: number;
  winner: 'crew' | 'imposter' | null;
  win_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbPlayer {
  id: string;
  room_id: string;
  session_id: string;
  name: string;
  color: string;
  is_host: boolean;
  role: PlayerRole;
  voted_for: string | null;
  is_ready: boolean;
  joined_at: string;
}

export interface DbClue {
  id: string;
  room_id: string;
  player_id: string;
  player_name: string;
  player_color: string;
  round_number: number;
  clue_text: string;
  created_at: string;
}
