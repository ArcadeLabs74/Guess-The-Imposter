import { supabase, getSessionId } from './supabaseClient';
import type { DbRoom, DbPlayer, DbClue, GameSettings, Player, WordData } from '../types/game';
import { generateAiWord } from './geminiService';

export interface RoomSubscriptionCallbacks {
  onRoomChange: (room: DbRoom) => void;
  onPlayersChange: (players: Player[]) => void;
  onCluesChange: (clues: DbClue[]) => void;
  onBroadcast?: (event: string, payload: unknown) => void;
}

class MultiplayerService {
  /**
   * Generates a clean 6-8 char room code like GTI-4921
   */
  public generateRoomCode(): string {
    const num = Math.floor(1000 + Math.random() * 9000);
    return `GTI-${num}`;
  }

  /**
   * Host creates a new multiplayer room in Supabase
   */
  public async createRoom(
    hostName: string,
    hostColor: string,
    settings: GameSettings
  ): Promise<{ room: DbRoom; player: DbPlayer }> {
    const sessionId = getSessionId();
    const code = this.generateRoomCode();
    const { data: authData } = await supabase.auth.getUser();
    const userId = authData?.user?.id || null;

    // 1. Insert Room
    const { data: roomData, error: roomError } = await supabase
      .from('rooms')
      .insert({
        code,
        host_id: sessionId,
        host_user_id: userId,
        phase: 'home',
        imposter_count: settings.imposterCount,
        round_count: settings.roundCount,
        category: settings.category,
        current_round: 1,
        current_turn_index: 0,
      })
      .select()
      .single();

    if (roomError || !roomData) {
      throw new Error(roomError?.message || 'Failed to create room in Supabase.');
    }

    // 2. Insert Host Player
    const { data: playerData, error: playerError } = await supabase
      .from('players')
      .insert({
        room_id: roomData.id,
        session_id: sessionId,
        user_id: userId,
        name: hostName.trim() || 'Host Operative',
        color: hostColor,
        is_host: true,
        role: 'crew',
        is_ready: true,
      })
      .select()
      .single();

    if (playerError || !playerData) {
      throw new Error(playerError?.message || 'Failed to register host player in room.');
    }

    return { room: roomData as DbRoom, player: playerData as DbPlayer };
  }

  /**
   * Join an existing room via 6-8 char code
   */
  public async joinRoom(
    code: string,
    playerName: string,
    playerColor: string
  ): Promise<{ room: DbRoom; player: DbPlayer }> {
    const sessionId = getSessionId();
    const cleanCode = code.trim().toUpperCase();
    const { data: authData } = await supabase.auth.getUser();
    const userId = authData?.user?.id || null;

    // 1. Find Room
    const { data: roomData, error: roomError } = await supabase
      .from('rooms')
      .select('*')
      .eq('code', cleanCode)
      .single();

    if (roomError || !roomData) {
      throw new Error('Room not found. Please verify the room code and try again.');
    }

    // 2. Check if player already exists in room (reconnect)
    const { data: existingPlayer } = await supabase
      .from('players')
      .select('*')
      .eq('room_id', roomData.id)
      .eq('session_id', sessionId)
      .maybeSingle();

    if (existingPlayer) {
      // Update name/color if changed
      const { data: updatedPlayer } = await supabase
        .from('players')
        .update({
          name: playerName.trim() || existingPlayer.name,
          color: playerColor || existingPlayer.color,
          user_id: userId || existingPlayer.user_id,
        })
        .eq('id', existingPlayer.id)
        .select()
        .single();

      return { room: roomData as DbRoom, player: (updatedPlayer || existingPlayer) as DbPlayer };
    }

    // 3. Insert new player
    const { data: newPlayer, error: joinError } = await supabase
      .from('players')
      .insert({
        room_id: roomData.id,
        session_id: sessionId,
        user_id: userId,
        name: playerName.trim() || 'Agent Guest',
        color: playerColor,
        is_host: false,
        role: 'crew',
        is_ready: true,
      })
      .select()
      .single();

    if (joinError || !newPlayer) {
      throw new Error(joinError?.message || 'Failed to join room.');
    }

    return { room: roomData as DbRoom, player: newPlayer as DbPlayer };
  }

  /**
   * Fetch all current players for a room
   */
  public async getPlayers(roomId: string): Promise<Player[]> {
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .eq('room_id', roomId)
      .order('joined_at', { ascending: true });

    if (error || !data) return [];
    return data.map((p: DbPlayer) => ({
      id: p.id,
      name: p.name,
      color: p.color,
      role: p.role,
      votedFor: p.voted_for,
      isHost: p.is_host,
      sessionId: p.session_id,
    }));
  }

  /**
   * Fetch all clues for a room
   */
  public async getClues(roomId: string): Promise<DbClue[]> {
    const { data, error } = await supabase
      .from('clues')
      .select('*')
      .eq('room_id', roomId)
      .order('created_at', { ascending: true });

    if (error || !data) return [];
    return data as DbClue[];
  }

  /**
   * Anti-Cheat RPC: Fetch player's confidential role and word/hint without leaking to others
   */
  public async getPlayerPrivateCard(roomId: string): Promise<WordData & { role: 'crew' | 'imposter' }> {
    const sessionId = getSessionId();
    const { data, error } = await supabase.rpc('get_player_private_card', {
      p_room_id: roomId,
      p_session_id: sessionId,
    });

    if (error || !data || data.error) {
      throw new Error(data?.error || error?.message || 'Unable to decrypt classified role card.');
    }

    return {
      category: data.category || 'General',
      secretWord: data.secretWord || 'CLASSIFIED',
      imposterHint: data.imposterHint || '',
      role: data.role || 'crew',
    };
  }

  /**
   * Host launches the game: rolls secret word, assigns roles, updates room phase to 'reveal'
   */
  public async startGame(roomId: string, settings: GameSettings): Promise<void> {
    // 1. Pick secret word & imposter hint via Gemini AI (with preset deck fallback)
    const word = await generateAiWord(settings.category);

    // 2. Fetch all players
    const { data: playerList, error: fetchErr } = await supabase
      .from('players')
      .select('id')
      .eq('room_id', roomId)
      .order('joined_at', { ascending: true });

    if (fetchErr || !playerList || playerList.length < 3) {
      throw new Error('A minimum of 3 operatives are required to launch a mission.');
    }

    // 3. Randomize Imposter(s)
    const imposterIndices = new Set<number>();
    const count = Math.min(settings.imposterCount, playerList.length - 2);
    while (imposterIndices.size < count) {
      imposterIndices.add(Math.floor(Math.random() * playerList.length));
    }

    // 4. Update each player's role in DB
    for (let i = 0; i < playerList.length; i++) {
      const isImp = imposterIndices.has(i);
      await supabase
        .from('players')
        .update({
          role: isImp ? 'imposter' : 'crew',
          voted_for: null,
        })
        .eq('id', playerList[i].id);
    }

    // 5. Clear old clues
    await supabase.from('clues').delete().eq('room_id', roomId);

    // 6. Update room to reveal phase
    const { error: roomErr } = await supabase
      .from('rooms')
      .update({
        phase: 'reveal',
        category: word.category,
        secret_word: word.secretWord,
        imposter_hint: word.imposterHint,
        imposter_count: settings.imposterCount,
        round_count: settings.roundCount,
        current_round: 1,
        current_turn_index: 0,
        winner: null,
        win_reason: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', roomId);

    if (roomErr) {
      throw new Error(roomErr.message);
    }
  }

  /**
   * Advance from Reveal to Clue Discussion
   */
  public async advanceToCluePhase(roomId: string): Promise<void> {
    await supabase
      .from('rooms')
      .update({
        phase: 'clue',
        current_round: 1,
        current_turn_index: 0,
        updated_at: new Date().toISOString(),
      })
      .eq('id', roomId);
  }

  /**
   * Submit a clue during the clue discussion phase
   */
  public async submitClue(
    roomId: string,
    playerId: string,
    playerName: string,
    playerColor: string,
    currentRound: number,
    totalRounds: number,
    currentTurnIndex: number,
    totalPlayers: number,
    clueText: string
  ): Promise<void> {
    // 1. Insert Clue
    await supabase.from('clues').insert({
      room_id: roomId,
      player_id: playerId,
      player_name: playerName,
      player_color: playerColor,
      round_number: currentRound,
      clue_text: clueText.trim(),
    });

    // 2. Compute Next State
    const nextTurn = currentTurnIndex + 1;
    if (nextTurn < totalPlayers) {
      await supabase
        .from('rooms')
        .update({
          current_turn_index: nextTurn,
          updated_at: new Date().toISOString(),
        })
        .eq('id', roomId);
    } else if (currentRound < totalRounds) {
      await supabase
        .from('rooms')
        .update({
          current_round: currentRound + 1,
          current_turn_index: 0,
          updated_at: new Date().toISOString(),
        })
        .eq('id', roomId);
    } else {
      // Finished all rounds -> transition to vote phase
      await supabase
        .from('rooms')
        .update({
          phase: 'vote',
          updated_at: new Date().toISOString(),
        })
        .eq('id', roomId);
    }
  }

  /**
   * Call emergency early vote
   */
  public async callEmergencyVote(roomId: string): Promise<void> {
    await supabase
      .from('rooms')
      .update({
        phase: 'vote',
        updated_at: new Date().toISOString(),
      })
      .eq('id', roomId);
  }

  /**
   * Cast a ballot vote
   */
  public async castVote(
    roomId: string,
    voterPlayerId: string,
    targetPlayerId: string | 'skip'
  ): Promise<void> {
    // 1. Update this voter's ballot
    await supabase
      .from('players')
      .update({ voted_for: targetPlayerId })
      .eq('id', voterPlayerId);

    // 2. Check if all players have voted
    const { data: allPlayers } = await supabase
      .from('players')
      .select('*')
      .eq('room_id', roomId);

    if (!allPlayers) return;

    const allVoted = allPlayers.every((p: DbPlayer) => p.voted_for !== null);
    if (allVoted) {
      // Calculate outcome
      this.tallyVotesAndFinish(roomId, allPlayers);
    }
  }

  /**
   * Calculate votes and declare winner
   */
  private async tallyVotesAndFinish(roomId: string, allPlayers: DbPlayer[]): Promise<void> {
    const counts: Record<string, number> = {};
    let skipped = 0;

    allPlayers.forEach((p) => {
      const target = p.voted_for;
      if (!target || target === 'skip') skipped++;
      else counts[target] = (counts[target] || 0) + 1;
    });

    let top = 0;
    let ejectedId: string | null = null;
    let isTie = false;

    Object.entries(counts).forEach(([id, n]) => {
      if (n > top) {
        top = n;
        ejectedId = id;
        isTie = false;
      } else if (n === top) {
        isTie = true;
      }
    });

    const imposters = allPlayers.filter((p) => p.role === 'imposter');
    const imposterNames = imposters.map((p) => p.name).join(', ');

    let winner: 'crew' | 'imposter' = 'crew';
    let winReason = '';

    if (!ejectedId || isTie || skipped >= top) {
      winner = 'imposter';
      winReason = `The council tied or skipped voting! The imposter (${imposterNames}) slips away undetected.`;
    } else {
      const ejected = allPlayers.find((p) => p.id === ejectedId);
      const caught = ejected?.role === 'imposter';

      if (caught) {
        winner = 'crew';
        winReason = `${ejected?.name} was the imposter! The crew successfully unmasks the infiltrator.`;
      } else {
        winner = 'imposter';
        winReason = `${ejected?.name} was innocent! The real imposter (${imposterNames}) escaped.`;
      }
    }

    await supabase
      .from('rooms')
      .update({
        phase: 'results',
        winner,
        win_reason: winReason,
        updated_at: new Date().toISOString(),
      })
      .eq('id', roomId);
  }

  /**
   * Host Emergency Override: Force tally current recorded votes and proceed to results
   */
  public async forceTallyCurrentVotes(roomId: string): Promise<void> {
    const { data: allPlayers } = await supabase
      .from('players')
      .select('*')
      .eq('room_id', roomId);

    if (allPlayers && allPlayers.length > 0) {
      await this.tallyVotesAndFinish(roomId, allPlayers);
    }
  }

  /**
   * Host Emergency Override: Skip/cancel voting phase and return all players to room lobby
   */
  public async returnToLobby(roomId: string): Promise<void> {
    // 1. Reset all player votes and roles for new setup
    await supabase
      .from('players')
      .update({ voted_for: null, role: 'crew' })
      .eq('room_id', roomId);

    // 2. Reset room to lobby phase
    await supabase
      .from('rooms')
      .update({
        phase: 'home',
        current_round: 1,
        current_turn_index: 0,
        winner: null,
        win_reason: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', roomId);
  }

  /**
   * Rematch: re-rolls secret word, re-shuffles roles, clears clues/votes, restarts game
   */
  public async rematch(roomId: string, settings: GameSettings): Promise<void> {
    await this.startGame(roomId, settings);
  }

  /**
   * Subscribe to all Realtime updates for this room
   */
  public subscribeToRoom(roomId: string, callbacks: RoomSubscriptionCallbacks): () => void {
    const channel = supabase
      .channel(`room:${roomId}`)
      // 1. Room table updates
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'rooms', filter: `id=eq.${roomId}` },
        (payload) => {
          if (payload.new) {
            callbacks.onRoomChange(payload.new as DbRoom);
          }
        }
      )
      // 2. Players table updates (joins, leaves, role updates, votes)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'players', filter: `room_id=eq.${roomId}` },
        async () => {
          const updatedPlayers = await this.getPlayers(roomId);
          callbacks.onPlayersChange(updatedPlayers);
        }
      )
      // 3. Clues table updates
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'clues', filter: `room_id=eq.${roomId}` },
        async () => {
          const updatedClues = await this.getClues(roomId);
          callbacks.onCluesChange(updatedClues);
        }
      )
      // 4. Lightweight Realtime Broadcast for emoji/sound triggers
      .on('broadcast', { event: 'reaction' }, (payload) => {
        if (callbacks.onBroadcast) {
          callbacks.onBroadcast('reaction', payload);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }

  /**
   * Broadcast an ephemeral reaction (zero DB write overhead)
   */
  public async broadcastReaction(roomId: string, emoji: string, senderName: string): Promise<void> {
    const channel = supabase.channel(`room:${roomId}`);
    await channel.send({
      type: 'broadcast',
      event: 'reaction',
      payload: { emoji, senderName, timestamp: Date.now() },
    });
  }
}

export const multiplayerService = new MultiplayerService();
