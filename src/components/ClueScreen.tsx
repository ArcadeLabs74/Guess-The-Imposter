import { useEffect, useRef, useState } from 'react';
import { SendHorizontal, Eye, EyeOff, Gavel, Radio, Lock } from 'lucide-react';
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
  isOnlineMode?: boolean;
  myPlayerId?: string;
  myPlayer?: Player | null;
  isHost?: boolean;
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
  isOnlineMode = false,
  myPlayerId,
  myPlayer,
  isHost = false,
}: ClueScreenProps) {
  const [draft, setDraft] = useState('');
  const [showSecret, setShowSecret] = useState(false);
  const feedRef = useRef<HTMLDivElement>(null);
  const activePlayer = players[currentTurnIndex] || players[0];
  const isMyTurn = isOnlineMode ? (myPlayerId ? activePlayer.id === myPlayerId : true) : true;
  const currentPlayer = myPlayer || players.find((p) => p.id === myPlayerId) || players[0];

  useEffect(() => {
    animateScreenIn(feedRef.current);
  }, []);

  const lastClueRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (lastClueRef.current) popIn(lastClueRef.current);
    if (clues.length > 0) soundManager.playPop();
  }, [clues.length]);

  const submit = () => {
    if (!draft.trim() || !isMyTurn) return;
    soundManager.playClick();
    const text = draft.trim();
    setDraft('');
    onSubmitClue(text);
  };

  const toggleSecret = () => {
    soundManager.playClick();
    setShowSecret((prev) => !prev);
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
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
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

      {/* Online Mode: Confidential Secret Word/Hint Peek Capsule (Neutral Header, No Role Icons) */}
      {isOnlineMode && (
        <div
          style={{
            marginBottom: 16,
            padding: '12px 18px',
            background: showSecret ? 'var(--surface)' : 'var(--bg-elevated)',
            border: showSecret ? '1.5px solid var(--border-strong)' : '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            transition: 'all 0.2s ease',
            boxShadow: showSecret ? 'var(--shadow-md)' : 'none',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Lock size={16} color="var(--ink)" />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink)' }}>
                CONFIDENTIAL DOSSIER
              </span>
            </div>

            <button
              type="button"
              className="btn btn-secondary btn-sm"
              style={{ height: 32, padding: '0 12px', fontSize: 11 }}
              onClick={toggleSecret}
            >
              {showSecret ? <EyeOff size={13} /> : <Eye size={13} />}
              <span>{showSecret ? 'HIDE SECRET' : 'TAP TO PEEK ROLE & WORD'}</span>
            </button>
          </div>

          {showSecret ? (
            <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px dashed var(--border)' }}>
              {currentPlayer.role === 'imposter' ? (
                <div>
                  <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--danger)', fontWeight: 700, marginBottom: 2 }}>
                    YOUR ROLE: UNDERCOVER IMPOSTER
                  </div>
                  <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', fontWeight: 600, marginBottom: 4 }}>
                    INTERCEPTED HINT:
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)', fontStyle: 'italic' }}>
                    “{wordData.imposterHint}”
                  </div>
                </div>
              ) : (
                <div>
                  <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--accent-strong)', fontWeight: 700, marginBottom: 2 }}>
                    YOUR ROLE: CREWMATE
                  </div>
                  <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', fontWeight: 600, marginBottom: 4 }}>
                    SECRET WORD:
                  </div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--ink)', fontFamily: 'var(--font-display)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                    {wordData.secretWord}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 5 }}>
              <span>Tap peek to privately view your secret word or imposter hint anytime.</span>
            </div>
          )}
        </div>
      )}

      {/* Active Turn Card */}
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
          <div className="chip-label">
            {isOnlineMode && isMyTurn ? '⚡ IT IS YOUR TURN!' : 'ACTIVE TRANSMITTER'}
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, textTransform: 'uppercase', color: 'var(--ink)' }}>
            {activePlayer.name} {isOnlineMode && isMyTurn && '(YOU)'}
          </div>
        </div>

        {/* Emergency Vote Button: Available in Local mode OR Host Only in Online mode */}
        {(!isOnlineMode || isHost) && (
          <button
            className="btn btn-danger btn-sm"
            style={{ marginLeft: 'auto' }}
            onClick={() => {
              soundManager.playEmergency();
              onCallVote();
            }}
            title={isOnlineMode ? 'Host Action: Start Emergency Voting council' : 'Call Emergency Vote'}
          >
            <Gavel size={14} />
            {isOnlineMode ? 'HOST: START VOTING ↗' : 'CALL EMERGENCY VOTE ↗'}
          </button>
        )}
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
            AWAITING FIRST TRANSMISSION — {players[0]?.name} TRANSMITS FIRST
          </div>
        )}
      </div>

      {/* Input Form */}
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
          disabled={isOnlineMode && !isMyTurn}
          placeholder={
            isOnlineMode
              ? isMyTurn
                ? 'Your turn! Input subtle clue phrase…'
                : `Waiting for ${activePlayer.name} to transmit clue…`
              : `${activePlayer.name}, input clue phrase…`
          }
          maxLength={80}
          autoFocus={isMyTurn}
          key={currentTurnIndex}
        />
        <button
          type="submit"
          className="btn btn-primary"
          disabled={!draft.trim() || (isOnlineMode && !isMyTurn)}
        >
          <SendHorizontal size={16} />
          TRANSMIT
        </button>
      </form>
    </div>
  );
}
