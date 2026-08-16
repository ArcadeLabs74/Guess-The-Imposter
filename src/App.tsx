import { useState, useEffect } from 'react';
import type { GamePhase, Player, GameSettings, WordData, ClueItem, VoteResult, GameStats } from './types/game';
import { BOT_NAMES } from './data/presetWords';
import { GeminiService } from './services/geminiService';
import { soundManager } from './services/soundService';

import { Navbar } from './components/Navbar';
import { HomeScreen } from './components/HomeScreen';
import { LobbyScreen } from './components/LobbyScreen';
import { RoleRevealScreen } from './components/RoleRevealScreen';
import { ClueDiscussionScreen } from './components/ClueDiscussionScreen';
import { VotingScreen } from './components/VotingScreen';
import { VoteRevealScreen } from './components/VoteRevealScreen';
import { GameOverScreen } from './components/GameOverScreen';
import { HowToPlayModal } from './components/HowToPlayModal';
import { GeminiSettingsModal } from './components/GeminiSettingsModal';

export function App() {
  // Game Flow State
  const [phase, setPhase] = useState<GamePhase>('home');
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [currentPlayerId, setCurrentPlayerId] = useState<string>('p1');
  const [players, setPlayers] = useState<Player[]>([]);
  const [settings, setSettings] = useState<GameSettings>({
    imposterCount: 1,
    roundCount: 2,
    turnTimerSeconds: 45,
    category: 'random',
    customCategoryPrompt: '',
    geminiApiKey: '',
    useGeminiApi: false,
    botCount: 3,
  });

  // Active Game Data
  const [wordData, setWordData] = useState<WordData>({
    category: 'Sci-Fi & Cyberpunk',
    secretWord: 'Cybernetic Arm',
    imposterHint: 'An artificial prosthetic upgrade featuring high-tech titanium and neural links.',
  });
  const [clues, setClues] = useState<ClueItem[]>([]);
  const [currentRound, setCurrentRound] = useState(1);
  const [currentTurnIndex, setCurrentTurnIndex] = useState(0);
  const [voteResult, setVoteResult] = useState<VoteResult>({
    votedOutPlayerId: null,
    votedOutPlayerName: null,
    votedOutRole: null,
    isImposterCaught: false,
    isTie: false,
    voteCounts: {},
    skippedCount: 0,
  });
  const [gameStats, setGameStats] = useState<GameStats>({
    winner: 'crew',
    reason: '',
    totalRounds: 2,
  });

  // Modals state
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [showGeminiSettings, setShowGeminiSettings] = useState(false);
  const [geminiApiKey, setGeminiApiKey] = useState('');

  // Load API key from storage
  useEffect(() => {
    const savedKey = localStorage.getItem('gemini_api_key');
    if (savedKey) {
      setGeminiApiKey(savedKey);
      GeminiService.setApiKey(savedKey);
    }
  }, []);

  const handleSaveApiKey = (key: string) => {
    setGeminiApiKey(key);
    localStorage.setItem('gemini_api_key', key);
    setSettings((s) => ({ ...s, geminiApiKey: key, useGeminiApi: !!key }));
  };

  // Helper to generate room code
  const generateRoomCode = () => {
    const prefixes = ['NEON', 'CYBER', 'SHADOW', 'QUANTUM', 'VORTEX', 'GHOST'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const num = Math.floor(100 + Math.random() * 900);
    return `${prefix}-${num}`;
  };

  // Helper to create bot player
  const createBotPlayer = (index: number): Player => {
    const profile = BOT_NAMES[index % BOT_NAMES.length];
    return {
      id: `bot_${index}_${Date.now()}`,
      name: profile.name,
      avatar: profile.avatar,
      color: profile.color,
      isHost: false,
      isBot: true,
      role: 'crew',
      isReady: true,
    };
  };

  // 1. Create Room
  const handleCreateRoom = (
    playerName: string,
    avatar: string,
    color: string,
    newSettings: GameSettings
  ) => {
    const newCode = generateRoomCode();
    const hostPlayer: Player = {
      id: 'player_host',
      name: playerName,
      avatar,
      color,
      isHost: true,
      isBot: false,
      role: 'crew',
      isReady: true,
    };

    const initialPlayers: Player[] = [hostPlayer];
    for (let i = 0; i < newSettings.botCount; i++) {
      initialPlayers.push(createBotPlayer(i));
    }

    setRoomCode(newCode);
    setCurrentPlayerId(hostPlayer.id);
    setPlayers(initialPlayers);
    setSettings({ ...newSettings, geminiApiKey });
    setPhase('lobby');
  };

  // 2. Join Room
  const handleJoinRoom = (
    code: string,
    playerName: string,
    avatar: string,
    color: string
  ) => {
    const userPlayer: Player = {
      id: `player_${Date.now()}`,
      name: playerName,
      avatar,
      color,
      isHost: false,
      isBot: false,
      role: 'crew',
      isReady: true,
    };

    const hostBot = createBotPlayer(0);
    hostBot.isHost = true;
    hostBot.name = 'HostMaster';

    const initialPlayers: Player[] = [hostBot, userPlayer, createBotPlayer(1), createBotPlayer(2)];

    setRoomCode(code);
    setCurrentPlayerId(userPlayer.id);
    setPlayers(initialPlayers);
    setPhase('lobby');
  };

  // 3. Quick Solo Play (Instant Launch)
  const handleQuickPlay = async (playerName: string, avatar: string, color: string) => {
    const userPlayer: Player = {
      id: 'player_user',
      name: playerName,
      avatar,
      color,
      isHost: true,
      isBot: false,
      role: 'crew',
      isReady: true,
    };

    const initialPlayers: Player[] = [
      userPlayer,
      createBotPlayer(0),
      createBotPlayer(1),
      createBotPlayer(2),
      createBotPlayer(3),
    ];

    // Assign 1 imposter randomly
    const imposterIndex = Math.floor(Math.random() * initialPlayers.length);
    initialPlayers.forEach((p, idx) => {
      p.role = idx === imposterIndex ? 'imposter' : 'crew';
    });

    const generatedWord = await GeminiService.generateWordAndClue('random', undefined, geminiApiKey);

    setRoomCode(generateRoomCode());
    setCurrentPlayerId(userPlayer.id);
    setPlayers(initialPlayers);
    setWordData(generatedWord);
    setClues([]);
    setCurrentRound(1);
    setCurrentTurnIndex(0);
    setPhase('role_reveal');
  };

  // 4. Start Game from Lobby
  const handleStartGame = async () => {
    const generatedWord = await GeminiService.generateWordAndClue(
      settings.category,
      settings.customCategoryPrompt,
      geminiApiKey
    );

    const shuffled = [...players];
    const imposterIndices = new Set<number>();
    const countToAssign = Math.min(settings.imposterCount, players.length - 1);

    while (imposterIndices.size < countToAssign) {
      const randIdx = Math.floor(Math.random() * shuffled.length);
      imposterIndices.add(randIdx);
    }

    const updatedPlayers = shuffled.map((p, idx) => ({
      ...p,
      role: imposterIndices.has(idx) ? ('imposter' as const) : ('crew' as const),
      votedFor: null,
      hasSubmittedClue: false,
    }));

    setWordData(generatedWord);
    setPlayers(updatedPlayers);
    setClues([]);
    setCurrentRound(1);
    setCurrentTurnIndex(0);
    setPhase('role_reveal');
  };

  // 5. Add AI Bot to Lobby
  const handleAddBot = () => {
    if (players.length >= 8) return;
    const newBot = createBotPlayer(players.length);
    setPlayers([...players, newBot]);
  };

  // 6. Remove Player/Bot from Lobby
  const handleRemovePlayer = (id: string) => {
    setPlayers(players.filter((p) => p.id !== id));
  };

  // 7. Proceed from Role Reveal to Clue Phase
  const handleConfirmReady = () => {
    setPhase('clue_phase');
  };

  // 8. Add Clue during Discussion
  const handleAddClue = (clueText: string) => {
    const activePlayer = players[currentTurnIndex] || players[0];
    const newClue: ClueItem = {
      id: `clue_${Date.now()}_${Math.random()}`,
      playerId: activePlayer.id,
      playerName: activePlayer.name,
      playerAvatar: activePlayer.avatar,
      playerColor: activePlayer.color,
      isBot: activePlayer.isBot,
      round: currentRound,
      clue: clueText,
      timestamp: Date.now(),
      reactions: {},
    };

    setClues((prev) => [...prev, newClue]);

    // Advance turn
    const nextTurn = currentTurnIndex + 1;
    if (nextTurn < players.length) {
      setCurrentTurnIndex(nextTurn);
    } else {
      if (currentRound < settings.roundCount) {
        setCurrentRound((r) => r + 1);
        setCurrentTurnIndex(0);
      } else {
        soundManager.playEmergency();
        setPhase('voting_phase');
      }
    }
  };

  // 9. Add Reaction to a Clue
  const handleAddReaction = (clueId: string, emoji: string) => {
    setClues((prev) =>
      prev.map((c) => {
        if (c.id === clueId) {
          const current = c.reactions[emoji] || 0;
          return {
            ...c,
            reactions: { ...c.reactions, [emoji]: current + 1 },
          };
        }
        return c;
      })
    );
  };

  // 10. Proceed to Voting
  const handleProceedToVoting = () => {
    setPhase('voting_phase');
  };

  // 11. Cast Vote
  const handleCastVote = (targetId: string | 'skip') => {
    setPlayers((prev) =>
      prev.map((p) => (p.id === currentPlayerId ? { ...p, votedFor: targetId } : p))
    );
  };

  // 12. Votes Complete & Calculation
  const handleVotesComplete = () => {
    const voteCounts: Record<string, number> = {};
    let skippedCount = 0;

    players.forEach((p) => {
      let voteTarget = p.votedFor;
      if (!voteTarget) {
        const others = players.filter((target) => target.id !== p.id);
        voteTarget = others[Math.floor(Math.random() * others.length)]?.id || 'skip';
      }

      if (voteTarget === 'skip') {
        skippedCount++;
      } else {
        voteCounts[voteTarget] = (voteCounts[voteTarget] || 0) + 1;
      }
    });

    let highestCount = 0;
    let highestPlayerId: string | null = null;
    let isTie = false;

    Object.entries(voteCounts).forEach(([playerId, count]) => {
      if (count > highestCount) {
        highestCount = count;
        highestPlayerId = playerId;
        isTie = false;
      } else if (count === highestCount && highestCount > 0) {
        isTie = true;
      }
    });

    if (skippedCount > highestCount || isTie || !highestPlayerId) {
      const imposterNames = players.filter((p) => p.role === 'imposter').map((p) => p.name);
      setVoteResult({
        votedOutPlayerId: null,
        votedOutPlayerName: null,
        votedOutRole: null,
        isImposterCaught: false,
        isTie: true,
        voteCounts,
        skippedCount,
      });
      setGameStats({
        winner: 'imposter',
        reason: `The council tied or skipped voting! Imposter (${imposterNames.join(', ')}) survived undetected!`,
        totalRounds: currentRound,
      });
    } else {
      const votedPlayer = players.find((p) => p.id === highestPlayerId);
      const isImpCaught = votedPlayer?.role === 'imposter';

      setVoteResult({
        votedOutPlayerId: highestPlayerId,
        votedOutPlayerName: votedPlayer?.name || 'Unknown',
        votedOutRole: votedPlayer?.role || null,
        isImposterCaught: isImpCaught,
        isTie: false,
        voteCounts,
        skippedCount,
      });

      if (isImpCaught) {
        setGameStats({
          winner: 'crew',
          reason: `The Crew successfully unmasked and ejected ${votedPlayer?.name} (The Imposter)!`,
          totalRounds: currentRound,
        });
      } else {
        const imposterList = players.filter((p) => p.role === 'imposter').map((p) => p.name);
        setGameStats({
          winner: 'imposter',
          reason: `An innocent Crewmate (${votedPlayer?.name}) was falsely ejected! Imposter (${imposterList.join(', ')}) wins!`,
          totalRounds: currentRound,
        });
      }
    }

    setPhase('vote_reveal');
  };

  // 13. Proceed from Vote Reveal to Game Over
  const handleProceedToGameOver = (_imposterGuess?: string, isCorrectGuess?: boolean) => {
    if (isCorrectGuess) {
      setGameStats({
        winner: 'imposter',
        reason: `The Imposter correctly guessed the secret word "${wordData.secretWord}" on the final stand! Imposter steals the win!`,
        totalRounds: currentRound,
      });
    }
    setPhase('game_over');
  };

  // 14. Rematch (New Word, same lobby)
  const handlePlayAgain = async () => {
    const newWord = await GeminiService.generateWordAndClue(
      settings.category,
      settings.customCategoryPrompt,
      geminiApiKey
    );

    const shuffled = [...players];
    const imposterIndices = new Set<number>();
    const countToAssign = Math.min(settings.imposterCount, players.length - 1);

    while (imposterIndices.size < countToAssign) {
      const randIdx = Math.floor(Math.random() * shuffled.length);
      imposterIndices.add(randIdx);
    }

    const updatedPlayers = shuffled.map((p, idx) => ({
      ...p,
      role: imposterIndices.has(idx) ? ('imposter' as const) : ('crew' as const),
      votedFor: null,
      hasSubmittedClue: false,
    }));

    setWordData(newWord);
    setPlayers(updatedPlayers);
    setClues([]);
    setCurrentRound(1);
    setCurrentTurnIndex(0);
    setPhase('role_reveal');
  };

  // 15. Leave Room
  const handleLeaveRoom = () => {
    setPhase('home');
    setRoomCode(null);
    setClues([]);
  };

  const currentPlayer = players.find((p) => p.id === currentPlayerId) || players[0];
  const imposters = players.filter((p) => p.role === 'imposter');

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Navbar */}
      <Navbar
        currentPhase={phase}
        roomCode={roomCode}
        onOpenHowToPlay={() => setShowHowToPlay(false)}
        onOpenGeminiSettings={() => setShowGeminiSettings(true)}
        onLeaveRoom={handleLeaveRoom}
        hasGeminiKey={!!geminiApiKey}
      />

      {/* Screen Render based on active Phase */}
      <main style={{ flex: 1 }}>
        {phase === 'home' && (
          <HomeScreen
            onCreateRoom={handleCreateRoom}
            onJoinRoom={handleJoinRoom}
            onQuickPlay={handleQuickPlay}
            onOpenHowToPlay={() => setShowHowToPlay(true)}
            onOpenGeminiSettings={() => setShowGeminiSettings(true)}
            hasGeminiKey={!!geminiApiKey}
          />
        )}

        {phase === 'lobby' && (
          <LobbyScreen
            roomCode={roomCode || 'UNKNOWN'}
            players={players}
            currentPlayerId={currentPlayerId}
            settings={settings}
            onStartGame={handleStartGame}
            onAddBot={handleAddBot}
            onRemovePlayer={handleRemovePlayer}
            onToggleReady={() => {}}
            onLeaveRoom={handleLeaveRoom}
          />
        )}

        {phase === 'role_reveal' && currentPlayer && (
          <RoleRevealScreen
            player={currentPlayer}
            wordData={wordData}
            onConfirmReady={handleConfirmReady}
          />
        )}

        {phase === 'clue_phase' && (
          <ClueDiscussionScreen
            players={players}
            currentPlayerId={currentPlayerId}
            wordData={wordData}
            settings={settings}
            clues={clues}
            currentRound={currentRound}
            currentTurnIndex={currentTurnIndex}
            onAddClue={handleAddClue}
            onAddReaction={handleAddReaction}
            onProceedToVoting={handleProceedToVoting}
          />
        )}

        {phase === 'voting_phase' && (
          <VotingScreen
            players={players}
            currentPlayerId={currentPlayerId}
            clues={clues}
            wordData={wordData}
            onCastVote={handleCastVote}
            onVotesComplete={handleVotesComplete}
          />
        )}

        {phase === 'vote_reveal' && (
          <VoteRevealScreen
            voteResult={voteResult}
            wordData={wordData}
            players={players}
            currentPlayerId={currentPlayerId}
            onProceedToGameOver={handleProceedToGameOver}
          />
        )}

        {phase === 'game_over' && (
          <GameOverScreen
            stats={gameStats}
            wordData={wordData}
            players={players}
            imposters={imposters}
            onPlayAgain={handlePlayAgain}
            onReturnHome={handleLeaveRoom}
            geminiApiKey={geminiApiKey}
          />
        )}
      </main>

      {/* Interactive UI Phase Quick-Switcher Bar (Footer) */}
      <footer style={{
        background: 'rgba(5, 8, 16, 0.9)',
        borderTop: '1px solid var(--border-subtle)',
        padding: '10px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        fontSize: '12px',
        color: 'var(--text-muted)',
      }}>
        <div>
          <span>UI Prototype Navigation:</span>
        </div>

        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {(['home', 'lobby', 'role_reveal', 'clue_phase', 'voting_phase', 'vote_reveal', 'game_over'] as GamePhase[]).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => {
                soundManager.playClick();
                if (players.length === 0 && p !== 'home') {
                  handleQuickPlay('Agent Alpha', '🕵️', '#06b6d4');
                }
                setPhase(p);
              }}
              style={{
                padding: '4px 10px',
                borderRadius: 'var(--radius-sm)',
                border: phase === p ? '1px solid var(--cyan-accent)' : '1px solid var(--border-subtle)',
                background: phase === p ? 'rgba(6, 182, 212, 0.2)' : 'rgba(255,255,255,0.04)',
                color: phase === p ? 'var(--cyan-accent)' : 'var(--text-secondary)',
                cursor: 'pointer',
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                textTransform: 'uppercase',
              }}
            >
              {p.replace('_', ' ')}
            </button>
          ))}
        </div>

        <div>
          <span>Guess The Imposter • React + Gemini AI</span>
        </div>
      </footer>

      {/* Modals */}
      {showHowToPlay && <HowToPlayModal onClose={() => setShowHowToPlay(false)} />}
      {showGeminiSettings && (
        <GeminiSettingsModal
          currentApiKey={geminiApiKey}
          onSaveApiKey={handleSaveApiKey}
          onClose={() => setShowGeminiSettings(false)}
        />
      )}
    </div>
  );
}

export default App;
