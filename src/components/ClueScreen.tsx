import { useEffect, useRef, useState } from 'react';
import { SendHorizontal, EyeOff, Gavel, Radio } from 'lucide-react';
import type { ClueItem, Player, WordData } from '../types/game';
import { animateScreenIn, popIn } from '../lib/animations';
import { soundManager } from '../services/soundService';

interface ClueScreenProps {
  players: Player[];
  wordData: WordData;
  clues: ClueItem[];
  currentRound: number;
  totalRounds: number;
  currentTurnIndex: number;
  onSubmitClue: (text: string) => void;
  onCallVote: () => void;
}

export function ClueScreen({
  players,
  wordData,
  clues,
  currentRound,
  totalRounds,
  currentTurnIndex,
  onSubmitClue,
  onCallVote,
}: ClueScreenProps) {
  const [draft, setDraft] = useState('');
  const feedRef = useRef<HTMLDivElement>(null);
  const activePlayer = players[currentTurnIndex];

  useEffect(() => {
    animateScreenIn(feedRef.current);
  }, []);

  const lastClueRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (lastClueRef.current) popIn(lastClueRef.current);
    if (clues.length > 0) soundManager.playPop();
  }, [clues.length]);

  const submit = () => {
    if (!draft.trim()) return;
    soundManager.playClick();
    const text = draft.trim();
    setDraft('');
    onSubmitClue(text);
  };

  return (
    <div className="screen">
      <div className="phase-header">
        <div>
          <h2 className="phase-title">CLUE TRANSMISSION</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13.5 }}>
            One concise clue per operative. Avoid naming the secret word directly.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <span className="round-pill">
            <Radio size={13} className="status-dot-live" />
            ROUND {currentRound} / {totalRounds}
          </span>
          <span className="word-chip">
            <EyeOff size={13} />
            DECK: {wordData.category}
          </span>
        </div>
      </div>

      {/* Active Turn Card with Inverted Corner Notch for Vote Action */}
      <div className="card turn-card">
        <span
          className="player-dot"
          style={{
            width: 48,
            height: 48,
            fontSize: 18,
            background: `linear-gradient(135deg, ${activePlayer.color}, ${activePlayer.color}cc)`,
          }}
        >
          {activePlayer.name.charAt(0).toUpperCase()}
        </span>
        <div>
          <div className="chip-label">ACTIVE TRANSMITTER</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, textTransform: 'uppercase', color: 'var(--ink)' }}>
            {activePlayer.name}
          </div>
        </div>

        <button
          className="btn btn-danger btn-sm"
          style={{ marginLeft: 'auto' }}
          onClick={() => {
            soundManager.playEmergency();
            onCallVote();
          }}
        >
          <Gavel size={14} />
          CALL EMERGENCY VOTE ↗
        </button>
      </div>

      {/* Live Clue Stream */}
      <div className="clue-feed" ref={feedRef}>
        {clues.map((clue, i) => (
          <div
            key={clue.id}
            className="clue-item"
            ref={i === clues.length - 1 ? lastClueRef : undefined}
          >
            <span className="mini-dot" style={{ background: clue.playerColor }}>
              {clue.playerName.charAt(0).toUpperCase()}
            </span>
            <div style={{ flex: 1 }}>
              <div className="clue-meta">
                <span className="clue-author">{clue.playerName}</span>
                <span className="clue-round">LOG // R{clue.round}</span>
              </div>
              <p className="clue-text">“{clue.text}”</p>
            </div>
          </div>
        ))}
        {clues.length === 0 && (
          <div
            style={{
              textAlign: 'center',
              color: 'var(--text-muted)',
              padding: '36px 0',
              fontFamily: 'var(--font-mono)',
              fontSize: 12.5,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            AWAITING FIRST TRANSMISSION — {players[0].name} TRANSMITS FIRST
          </div>
        )}
      </div>

      <form
        className="clue-form"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <input
          className="input"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={`${activePlayer.name}, input clue phrase…`}
          maxLength={80}
          autoFocus
          key={currentTurnIndex}
        />
        <button type="submit" className="btn btn-primary" disabled={!draft.trim()}>
          <SendHorizontal size={16} />
          TRANSMIT
        </button>
      </form>
    </div>
  );
}
