import { useEffect, useState } from 'react';
import {
  VenetianMask,
  Home,
  BookOpen,
  Volume2,
  VolumeX,
  LogOut,
} from 'lucide-react';
import type { GamePhase, Player, GameSettings, WordData, ClueItem, VoteResult } from './types/game';
import { getWord, PLAYER_COLORS } from './data/presetWords';
import { initButtonFx } from './lib/animations';
import { soundManager } from './services/soundService';

import { HomeScreen } from './components/HomeScreen';
import { RoleRevealScreen } from './components/RoleRevealScreen';
import { ClueScreen } from './components/ClueScreen';
import { VoteScreen } from './components/VoteScreen';
import { ResultsScreen } from './components/ResultsScreen';
import { HowToPlayModal } from './components/HowToPlayModal';

const DEFAULT_SETTINGS: GameSettings = {
  imposterCount: 1,
  roundCount: 2,
  category: 'random',
};

export function App() {
  const [phase, setPhase] = useState<GamePhase>('home');
  const [showRules, setShowRules] = useState(false);
  const [muted, setMuted] = useState(() => {
    const saved = localStorage.getItem('imposter_muted') === '1';
    soundManager.setMuted(saved);
    return saved;
  });

  useEffect(() => {
    initButtonFx();
  }, []);

  const toggleMute = () => {
    const next = soundManager.toggleMute();
    setMuted(next);
    localStorage.setItem('imposter_muted', next ? '1' : '0');
  };

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

  // --- Setup ---------------------------------------------------------------

  const startGame = (names: string[], gameSettings: GameSettings) => {
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
    setWordData(getWord(gameSettings.category));
    setRevealIndex(0);
    setVotes({});
    setPhase('reveal');
  };

  // --- Clue phase ----------------------------------------------------------

  const handleConfirmRole = () => {
    if (revealIndex < players.length - 1) {
      setRevealIndex(revealIndex + 1);
    } else {
      setClues([]);
      setCurrentRound(1);
      setCurrentTurnIndex(0);
      setPhase('clue');
    }
  };

  const handleAddClue = (text: string) => {
    const activePlayer = players[currentTurnIndex];
    const newClue: ClueItem = {
      id: `clue_${Date.now()}`,
      playerId: activePlayer.id,
      playerName: activePlayer.name,
      playerColor: activePlayer.color,
      round: currentRound,
      text,
    };
    const nextClues = [...clues, newClue];
    setClues(nextClues);

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
  };

  // --- Voting --------------------------------------------------------------

  const handleCastVote = (targetId: string | 'skip') => {
    const voter = players[voterIndex];
    const updatedVotes = { ...votes, [voter.id]: targetId };
    setVotes(updatedVotes);

    if (voterIndex < players.length - 1) {
      setVoterIndex(voterIndex + 1);
    } else {
      tallyAndFinish(updatedVotes);
    }
  };

  const tallyAndFinish = (allVotes: Record<string, string | 'skip'>) => {
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

  // --- Post-game -----------------------------------------------------------

  const handleRematch = () => {
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
    setWordData(getWord(settings.category));
    setClues([]);
    setVoteResult(null);
    setVotes({});
    setRevealIndex(0);
    setCurrentRound(1);
    setCurrentTurnIndex(0);
    setPhase('reveal');
  };

  const handleReturnHome = () => {
    if (phase !== 'home' && !window.confirm('Leave current session and return to home?')) return;
    setPhase('home');
    setPlayers([]);
    setClues([]);
    setVoteResult(null);
    setVotes({});
  };

  return (
    <div className="app-shell">
      {/* Clean Top Navigation Bar */}
      <header className="app-top-nav">
        <div className="nav-brand">
          <span className="status-dot-live" />
          <span className="nav-brand-text">GTI // SOCIAL DEDUCTION</span>
        </div>

        <div className="nav-actions">
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
          <HomeScreen onStartGame={startGame} onOpenRules={() => setShowRules(true)} />
        )}

        {phase === 'reveal' && wordData && (
          <RoleRevealScreen
            key={revealIndex}
            players={players}
            wordData={wordData}
            revealIndex={revealIndex}
            onConfirm={handleConfirmRole}
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
            onCallVote={() => {
              setVoterIndex(0);
              setPhase('vote');
            }}
          />
        )}

        {phase === 'vote' && wordData && (
          <VoteScreen
            key={voterIndex}
            players={players}
            voterIndex={voterIndex}
            onCastVote={handleCastVote}
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
        GUESS THE IMPOSTER · PASS & PLAY DEDUCTION · 1 DEVICE LOCAL
      </footer>

      {showRules && <HowToPlayModal onClose={() => setShowRules(false)} />}
    </div>
  );
}

export default App;
