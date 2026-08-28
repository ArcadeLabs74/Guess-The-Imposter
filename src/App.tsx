import { useEffect, useState } from 'react';
import {
  VenetianMask,
  Home,
  BookOpen,
  Volume2,
  VolumeX,
  LogOut,
  Radio,
  User as UserIcon,
  LogIn,
} from 'lucide-react';
import type { User } from '@supabase/supabase-js';
import type { GamePhase, Player, GameSettings, WordData, ClueItem, VoteResult, DbRoom, DbClue } from './types/game';
import { PLAYER_COLORS } from './data/presetWords';
import { generateAiWord } from './services/geminiService';
import { initButtonFx } from './lib/animations';
import { soundManager } from './services/soundService';
import { multiplayerService } from './services/multiplayerService';
import { getSessionId } from './services/supabaseClient';
import { authService } from './services/authService';

import { HomeScreen } from './components/HomeScreen';
import { RoleRevealScreen } from './components/RoleRevealScreen';
import { ClueScreen } from './components/ClueScreen';
import { VoteScreen } from './components/VoteScreen';
import { ResultsScreen } from './components/ResultsScreen';
import { HowToPlayModal } from './components/HowToPlayModal';
import { AuthModal } from './components/AuthModal';

const DEFAULT_SETTINGS: GameSettings = {
  imposterCount: 1,
  roundCount: 2,
  category: 'random',
};

export function App() {
  const [phase, setPhase] = useState<GamePhase>('home');
  const [showRules, setShowRules] = useState(false);
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authRequiredForOnline, setAuthRequiredForOnline] = useState(false);

  const [muted, setMuted] = useState(() => {
    const saved = localStorage.getItem('imposter_muted') === '1';
    soundManager.setMuted(saved);
    return saved;
  });

  useEffect(() => {
    initButtonFx();

    authService.getCurrentUser().then((user) => setAuthUser(user));
    const unsubscribe = authService.onAuthStateChange((user) => {
      setAuthUser(user);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const toggleMute = () => {
    const next = soundManager.toggleMute();
    setMuted(next);
    localStorage.setItem('imposter_muted', next ? '1' : '0');
  };

  // Local & Common Game State
  const [players, setPlayers] = useState<Player[]>([]);
  const [settings, setSettings] = useState<GameSettings>(DEFAULT_SETTINGS);
  const [wordData, setWordData] = useState<WordData | null>(null);

  const [clues, setClues] = useState<ClueItem[]>([]);
  const [currentRound, setCurrentRound] = useState(1);
  const [currentTurnIndex, setCurrentTurnIndex] = useState(0);
  const [revealIndex, setRevealIndex] = useState(0);
  const [voterIndex, setVoterIndex] = useState(0);

  const [voteResult, setVoteResult] = useState<VoteResult | null>(null);
  const [votes, setVotes] = useState<Record<string, string | 'skip'>>({});
  const [winner, setWinner] = useState<'crew' | 'imposter'>('crew');
  const [winReason, setWinReason] = useState('');

  // Online Multiplayer Supabase State
  const [isOnline, setIsOnline] = useState(false);
  const [onlineRoom, setOnlineRoom] = useState<DbRoom | null>(null);
  const [myPlayer, setMyPlayer] = useState<Player | null>(null);
  const sessionId = getSessionId();

  // --- Realtime Supabase Room Subscription ---------------------------------
  useEffect(() => {
    if (!isOnline || !onlineRoom?.id) return;

    const unsubscribe = multiplayerService.subscribeToRoom(onlineRoom.id, {
      onRoomChange: async (updatedRoom) => {
        setOnlineRoom(updatedRoom);
        setSettings({
          imposterCount: updatedRoom.imposter_count,
          roundCount: updatedRoom.round_count,
          category: updatedRoom.category,
        });
        setCurrentRound(updatedRoom.current_round);
        setCurrentTurnIndex(updatedRoom.current_turn_index);

        // Synchronize phase transitions across all devices
        if (updatedRoom.phase !== phase) {
          setPhase(updatedRoom.phase);

          if (updatedRoom.phase === 'reveal') {
            soundManager.playCardFlip();
            try {
              const privateCard = await multiplayerService.getPlayerPrivateCard(updatedRoom.id);
              setWordData(privateCard);
              setMyPlayer((prev) => (prev ? { ...prev, role: privateCard.role } : null));
            } catch (e) {
              console.error('Failed to load private card:', e);
            }
          } else if (updatedRoom.phase === 'clue') {
            // Clue phase starts
          } else if (updatedRoom.phase === 'vote') {
            soundManager.playEmergency();
          } else if (updatedRoom.phase === 'results') {
            // Build vote result from current players
            const updatedPlayers = await multiplayerService.getPlayers(updatedRoom.id);
            setPlayers(updatedPlayers);
            setWinner(updatedRoom.winner || 'crew');
            setWinReason(updatedRoom.win_reason || '');

            const counts: Record<string, number> = {};
            let skipped = 0;
            updatedPlayers.forEach((p) => {
              if (!p.votedFor || p.votedFor === 'skip') skipped++;
              else counts[p.votedFor] = (counts[p.votedFor] || 0) + 1;
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

            const ejected = updatedPlayers.find((p) => p.id === ejectedId);
            setVoteResult({
              ejectedPlayerId: ejectedId,
              ejectedPlayerName: ejected?.name || null,
              ejectedRole: ejected?.role || null,
              isTie,
              voteCounts: counts,
              skippedCount: skipped,
            });
          }
        }
      },
      onPlayersChange: (updatedPlayers) => {
        setPlayers(updatedPlayers);
        const me = updatedPlayers.find((p) => p.sessionId === sessionId) || null;
        if (me) setMyPlayer(me);
      },
      onCluesChange: (updatedClues: DbClue[]) => {
        setClues(
          updatedClues.map((c) => ({
            id: c.id,
            playerId: c.player_id,
            playerName: c.player_name,
            playerColor: c.player_color,
            round: c.round_number,
            text: c.clue_text,
          }))
        );
      },
    });

    return () => {
      unsubscribe();
    };
  }, [isOnline, onlineRoom?.id, phase, sessionId]);

  // --- Online Multiplayer Actions ------------------------------------------

  const handleHostOnline = async (hostName: string, hostColor: string, gameSettings: GameSettings) => {
    const { room, player } = await multiplayerService.createRoom(hostName, hostColor, gameSettings);
    setIsOnline(true);
    setOnlineRoom(room);
    const hostP: Player = {
      id: player.id,
      name: player.name,
      color: player.color,
      role: player.role,
      votedFor: null,
      isHost: true,
      sessionId,
    };
    setMyPlayer(hostP);
    setPlayers([hostP]);
    setSettings(gameSettings);
    setPhase('home');
  };

  const handleJoinOnline = async (code: string, playerName: string, playerColor: string) => {
    const { room, player } = await multiplayerService.joinRoom(code, playerName, playerColor);
    setIsOnline(true);
    setOnlineRoom(room);
    const joinedP: Player = {
      id: player.id,
      name: player.name,
      color: player.color,
      role: player.role,
      votedFor: null,
      isHost: player.is_host,
      sessionId,
    };
    setMyPlayer(joinedP);
    const allPlayers = await multiplayerService.getPlayers(room.id);
    setPlayers(allPlayers);
    setSettings({
      imposterCount: room.imposter_count,
      roundCount: room.round_count,
      category: room.category,
    });
    setPhase('home');
  };

  const handleStartOnline = async () => {
    if (!onlineRoom) return;
    await multiplayerService.startGame(onlineRoom.id, settings);
  };

  const handleConfirmRole = async () => {
    if (isOnline) {
      if (onlineRoom && myPlayer?.isHost) {
        await multiplayerService.advanceToCluePhase(onlineRoom.id);
      }
    } else {
      if (revealIndex < players.length - 1) {
        setRevealIndex(revealIndex + 1);
      } else {
        setClues([]);
        setCurrentRound(1);
        setCurrentTurnIndex(0);
        setPhase('clue');
      }
    }
  };

  const handleAddClue = async (text: string) => {
    if (isOnline && onlineRoom && myPlayer) {
      const activePlayer = players[currentTurnIndex] || myPlayer;
      await multiplayerService.submitClue(
        onlineRoom.id,
        activePlayer.id,
        activePlayer.name,
        activePlayer.color,
        currentRound,
        settings.roundCount,
        currentTurnIndex,
        players.length,
        text
      );
    } else {
      // Local Pass & Play
      const activePlayer = players[currentTurnIndex];
      const newClue: ClueItem = {
        id: `clue_${Date.now()}`,
        playerId: activePlayer.id,
        playerName: activePlayer.name,
        playerColor: activePlayer.color,
        round: currentRound,
        text,
      };
      setClues([...clues, newClue]);

      const nextTurn = currentTurnIndex + 1;
      if (nextTurn < players.length) {
        setCurrentTurnIndex(nextTurn);
      } else if (currentRound < settings.roundCount) {
        setCurrentRound(currentRound + 1);
        setCurrentTurnIndex(0);
      } else {
        setVoterIndex(0);
        setPhase('vote');
      }
    }
  };

  const handleCallVote = async () => {
    if (isOnline && onlineRoom) {
      await multiplayerService.callEmergencyVote(onlineRoom.id);
    } else {
      setVoterIndex(0);
      setPhase('vote');
    }
  };

  const handleCastVote = async (targetId: string | 'skip') => {
    if (isOnline && onlineRoom && myPlayer) {
      await multiplayerService.castVote(onlineRoom.id, myPlayer.id, targetId);
    } else {
      // Local Pass & Play
      const voter = players[voterIndex];
      const updatedVotes = { ...votes, [voter.id]: targetId };
      setVotes(updatedVotes);

      if (voterIndex < players.length - 1) {
        setVoterIndex(voterIndex + 1);
      } else {
        tallyAndFinishLocal(updatedVotes);
      }
    }
  };

  const tallyAndFinishLocal = (allVotes: Record<string, string | 'skip'>) => {
    const counts: Record<string, number> = {};
    let skipped = 0;

    players.forEach((p) => {
      const target = allVotes[p.id];
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

    const imposters = players.filter((p) => p.role === 'imposter');
    const imposterNames = imposters.map((p) => p.name).join(', ');

    if (!ejectedId || isTie || skipped >= top) {
      setVoteResult({
        ejectedPlayerId: null,
        ejectedPlayerName: null,
        ejectedRole: null,
        isTie: true,
        voteCounts: counts,
        skippedCount: skipped,
      });
      setWinner('imposter');
      setWinReason(
        `The group couldn't agree. The imposter (${imposterNames}) slips away undetected.`
      );
    } else {
      const ejected = players.find((p) => p.id === ejectedId)!;
      const caught = ejected.role === 'imposter';
      setVoteResult({
        ejectedPlayerId: ejected.id,
        ejectedPlayerName: ejected.name,
        ejectedRole: ejected.role,
        isTie: false,
        voteCounts: counts,
        skippedCount: skipped,
      });
      if (caught) {
        setWinner('crew');
        setWinReason(`${ejected.name} was the imposter. The crew wins!`);
      } else {
        setWinner('imposter');
        setWinReason(
          `${ejected.name} was innocent. The real imposter (${imposterNames}) gets away with it.`
        );
      }
    }
    setPhase('results');
  };

  const handleRematch = async () => {
    if (isOnline && onlineRoom) {
      await multiplayerService.rematch(onlineRoom.id, settings);
    } else {
      const reshuffled: Player[] = players.map((p) => ({
        ...p,
        role: 'crew',
        votedFor: null,
      }));
      const imposterIndices = new Set<number>();
      const count = Math.min(settings.imposterCount, reshuffled.length - 2);
      while (imposterIndices.size < count) {
        imposterIndices.add(Math.floor(Math.random() * reshuffled.length));
      }
      reshuffled.forEach((p, i) => {
        if (imposterIndices.has(i)) p.role = 'imposter';
      });
      setPlayers(reshuffled);
      const newWord = await generateAiWord(settings.category);
      setWordData(newWord);
      setClues([]);
      setVoteResult(null);
      setVotes({});
      setRevealIndex(0);
      setCurrentRound(1);
      setCurrentTurnIndex(0);
      setPhase('reveal');
    }
  };

  const handleReturnHome = () => {
    if (phase !== 'home' && !window.confirm('Leave current session and return to home?')) return;
    setPhase('home');
    if (!isOnline) {
      setPlayers([]);
      setClues([]);
      setVoteResult(null);
      setVotes({});
    }
  };

  const handleLeaveOnlineRoom = () => {
    if (window.confirm('Leave online multiplayer room?')) {
      setIsOnline(false);
      setOnlineRoom(null);
      setMyPlayer(null);
      setPlayers([]);
      setClues([]);
      setVoteResult(null);
      setPhase('home');
    }
  };

  // --- Local Pass & Play Setup ---------------------------------------------
  const startLocalGame = async (names: string[], gameSettings: GameSettings) => {
    setIsOnline(false);
    setOnlineRoom(null);
    setMyPlayer(null);

    const roster: Player[] = names.map((name, i) => ({
      id: `p${i}`,
      name,
      color: PLAYER_COLORS[i % PLAYER_COLORS.length],
      role: 'crew',
      votedFor: null,
    }));

    const imposterIndices = new Set<number>();
    const count = Math.min(gameSettings.imposterCount, roster.length - 2);
    while (imposterIndices.size < count) {
      imposterIndices.add(Math.floor(Math.random() * roster.length));
    }
    roster.forEach((p, i) => {
      if (imposterIndices.has(i)) p.role = 'imposter';
    });

    setPlayers(roster);
    setSettings(gameSettings);
    const newWord = await generateAiWord(gameSettings.category);
    setWordData(newWord);
    setRevealIndex(0);
    setVotes({});
    setPhase('reveal');
  };

  const handleHostReturnToLobby = async () => {
    if (isOnline && onlineRoom) {
      await multiplayerService.returnToLobby(onlineRoom.id);
    }
  };

  const handleHostForceTally = async () => {
    if (isOnline && onlineRoom) {
      await multiplayerService.forceTallyCurrentVotes(onlineRoom.id);
    }
  };

  return (
    <div className="app-shell">
      {/* Top Navigation Bar */}
      <header className="app-top-nav">
        <div className="nav-brand">
          <span className="status-dot-live" />
          <span className="nav-brand-text">
            {isOnline && onlineRoom ? `GTI // ${onlineRoom.code}` : 'GTI // SOCIAL DEDUCTION'}
          </span>
        </div>

        <div className="nav-actions">
          {/* Operative Account Dossier / Sign In Button */}
          {authUser ? (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  height: 32,
                  padding: '0 10px',
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-strong)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--ink)',
                  fontSize: 11,
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 600,
                  maxWidth: 160,
                }}
                title={`Signed in as ${authUser.email}`}
              >
                <UserIcon size={12} color="var(--accent-strong)" style={{ flexShrink: 0 }} />
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {authUser.user_metadata?.display_name || authUser.email?.split('@')[0]}
                </span>
              </span>

              <button
                className="nav-icon-btn"
                style={{ width: 32, height: 32 }}
                onClick={() => {
                  soundManager.playClick();
                  authService.signOut();
                }}
                aria-label="Sign Out"
                title="Sign out of operative dossier"
              >
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              style={{ height: 32, padding: '0 12px', fontSize: 11, gap: 5 }}
              onClick={() => {
                soundManager.playClick();
                setAuthRequiredForOnline(false);
                setShowAuthModal(true);
              }}
            >
              <LogIn size={13} />
              <span>SIGN IN</span>
            </button>
          )}

          {isOnline && onlineRoom && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', background: 'var(--accent-dim)', color: 'var(--accent-strong)', borderRadius: '999px', fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
              <Radio size={12} className="status-dot-live" />
              ONLINE LOBBY
            </span>
          )}

          <button
            className={`nav-icon-btn ${phase === 'home' ? 'active' : ''}`}
            onClick={handleReturnHome}
            aria-label="Home"
            title="Return to Home"
          >
            {phase === 'home' ? <VenetianMask size={17} strokeWidth={2.2} /> : <Home size={17} />}
          </button>
          <button
            className="nav-icon-btn"
            onClick={() => setShowRules(true)}
            aria-label="Manual & Rules"
            title="How to play"
          >
            <BookOpen size={16} />
          </button>
          <button
            className="nav-icon-btn"
            onClick={toggleMute}
            aria-label="Toggle Sound"
            title={muted ? 'Unmute' : 'Mute'}
          >
            {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
          {phase !== 'home' && (
            <button
              className="nav-icon-btn"
              onClick={handleReturnHome}
              aria-label="Abort Session"
              title="Exit to Main Menu"
            >
              <LogOut size={16} />
            </button>
          )}
        </div>
      </header>

      {/* Main Screen Content */}
      <main className="main-content">
        {phase === 'home' && (
          <HomeScreen
            onStartLocalGame={startLocalGame}
            onOpenRules={() => setShowRules(true)}
            authUser={authUser}
            onRequireAuth={() => {
              setAuthRequiredForOnline(true);
              setShowAuthModal(true);
            }}
            onlineRoom={onlineRoom}
            onlinePlayers={players}
            isHostingOnline={myPlayer?.isHost ?? false}
            onHostOnlineRoom={handleHostOnline}
            onJoinOnlineRoom={handleJoinOnline}
            onStartOnlineGame={handleStartOnline}
            onLeaveOnlineRoom={handleLeaveOnlineRoom}
          />
        )}

        {phase === 'reveal' && wordData && (
          <RoleRevealScreen
            key={isOnline ? (myPlayer?.id || 'online') : revealIndex}
            players={players}
            wordData={wordData}
            revealIndex={revealIndex}
            onConfirm={handleConfirmRole}
            isOnlineMode={isOnline}
            myPlayer={myPlayer}
            isHost={myPlayer?.isHost ?? false}
          />
        )}

        {phase === 'clue' && wordData && (
          <ClueScreen
            players={players}
            wordData={wordData}
            clues={clues}
            currentRound={currentRound}
            totalRounds={settings.roundCount}
            currentTurnIndex={currentTurnIndex}
            onSubmitClue={handleAddClue}
            onCallVote={handleCallVote}
            isOnlineMode={isOnline}
            myPlayerId={myPlayer?.id}
            myPlayer={myPlayer}
            isHost={myPlayer?.isHost ?? false}
          />
        )}

        {phase === 'vote' && wordData && (
          <VoteScreen
            key={isOnline ? (myPlayer?.id || 'online_vote') : voterIndex}
            players={players}
            voterIndex={voterIndex}
            onCastVote={handleCastVote}
            isOnlineMode={isOnline}
            myPlayer={myPlayer}
            isHost={myPlayer?.isHost ?? false}
            onHostReturnToLobby={handleHostReturnToLobby}
            onHostForceTally={handleHostForceTally}
          />
        )}

        {phase === 'results' && wordData && voteResult && (
          <ResultsScreen
            players={players}
            wordData={wordData}
            voteResult={voteResult}
            winner={winner}
            reason={winReason}
            onRematch={handleRematch}
            onHome={handleReturnHome}
          />
        )}
      </main>

      {/* Minimalist Footer */}
      <footer className="app-footer">
        {isOnline
          ? `GUESS THE IMPOSTER · ONLINE MULTIPLAYER (ROOM: ${onlineRoom?.code || 'CONNECTED'})`
          : 'GUESS THE IMPOSTER · PASS & PLAY DEDUCTION · 1 DEVICE LOCAL'}
      </footer>

      {showRules && <HowToPlayModal onClose={() => setShowRules(false)} />}

      {/* Authentication Dossier Modal */}
      {showAuthModal && (
        <AuthModal
          requiredForOnline={authRequiredForOnline}
          onClose={() => setShowAuthModal(false)}
          onSuccess={() => setShowAuthModal(false)}
        />
      )}
    </div>
  );
}

export default App;
