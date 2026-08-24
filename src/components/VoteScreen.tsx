import { useEffect, useRef, useState } from 'react';
import { Gavel, SkipForward, ShieldAlert, CheckCircle2, Loader2, LogOut, RefreshCw } from 'lucide-react';
import type { Player } from '../types/game';
import { animateScreenIn } from '../lib/animations';
import { soundManager } from '../services/soundService';

interface VoteScreenProps {
  players: Player[];
  voterIndex: number;
  onCastVote: (targetId: string | 'skip') => void;
  isOnlineMode?: boolean;
  myPlayer?: Player | null;
  isHost?: boolean;
  onHostReturnToLobby?: () => void;
  onHostForceTally?: () => void;
}

export function VoteScreen({
  players,
  voterIndex,
  onCastVote,
  isOnlineMode = false,
  myPlayer,
  isHost = false,
  onHostReturnToLobby,
  onHostForceTally,
}: VoteScreenProps) {
  const voter = isOnlineMode ? (myPlayer || players[0]) : players[voterIndex];
  const [selected, setSelected] = useState<string | null>(null);
  const [hasVotedLocal, setHasVotedLocal] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    animateScreenIn(gridRef.current);
  }, []);

  const totalVoted = players.filter((p) => p.votedFor !== null).length;
  const isAlreadyVoted = isOnlineMode && (voter.votedFor !== null || hasVotedLocal);

  const cast = (target: string | 'skip') => {
    soundManager.playVoteCast();
    setHasVotedLocal(true);
    onCastVote(target);
  };

  return (
    <div className="screen screen-narrow">
      <div className="phase-header">
        <div>
          <h2 className="phase-title">EMERGENCY TALLY</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13.5 }}>
            Discussion concluded. Cast your classified ballot to identify the imposter.
          </p>
        </div>
        <span className="round-pill">
          <ShieldAlert size={14} color="var(--danger)" />
          {isOnlineMode
            ? `BALLOTS CAST: ${totalVoted} / ${players.length}`
            : `BALLOT ${voterIndex + 1} / ${players.length}`}
        </span>
      </div>

      {/* Host Emergency Panel (If player disconnects or goes AFK) */}
      {isOnlineMode && isHost && (
        <div
          style={{
            marginBottom: 16,
            padding: '14px 18px',
            background: 'var(--surface)',
            border: '1.5px solid var(--warning)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--warning)', fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>
            <ShieldAlert size={14} />
            <span>HOST EMERGENCY CONTROLS</span>
          </div>
          <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', marginBottom: 12 }}>
            If a player disconnected or went AFK, you can cancel the vote to return everyone to the room lobby, or force tally existing votes now.
          </p>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {onHostReturnToLobby && (
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                style={{ borderColor: 'var(--danger)', color: 'var(--danger)' }}
                onClick={() => {
                  if (window.confirm('Cancel voting phase and return all connected players to the lobby?')) {
                    soundManager.playClick();
                    onHostReturnToLobby();
                  }
                }}
              >
                <LogOut size={13} />
                CANCEL VOTE & RETURN TO LOBBY
              </button>
            )}

            {onHostForceTally && totalVoted > 0 && (
              <button
                type="button"
                className="btn btn-sage btn-sm"
                onClick={() => {
                  if (window.confirm(`Force tally the ${totalVoted} ballots cast so far and determine winner?`)) {
                    soundManager.playClick();
                    onHostForceTally();
                  }
                }}
              >
                <RefreshCw size={13} />
                FORCE TALLY CURRENT VOTES ({totalVoted})
              </button>
            )}
          </div>
        </div>
      )}

      <div className="pass-banner">
        <span className="chip-label">
          {isOnlineMode ? 'CONFIDENTIAL BALLOT · YOUR OPERATIVE:' : 'CONFIDENTIAL BALLOT · CURRENT VOTER:'}
        </span>
        <strong style={{ fontFamily: 'var(--font-display)', fontSize: 17, color: 'var(--ink)' }}>
          {voter.name}
        </strong>
      </div>

      {isAlreadyVoted ? (
        <div className="card panel-pad" style={{ textAlign: 'center', padding: '36px 20px', marginTop: 12 }}>
          <CheckCircle2 size={42} color="var(--accent-strong)" style={{ margin: '0 auto 14px' }} />
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--ink)', textTransform: 'uppercase' }}>
            BALLOT LOCKED & ENCRYPTED
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, maxWidth: 360, margin: '8px auto 20px' }}>
            Your vote has been transmitted. Waiting for remaining operatives to cast their ballots…
          </p>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 18px', background: 'var(--bg-elevated)', borderRadius: '999px', border: '1px solid var(--border)', fontSize: 13, fontFamily: 'var(--font-mono)' }}>
            <Loader2 size={14} className="animate-spin" />
            <span>{totalVoted} of {players.length} Ballots Recorded</span>
          </div>
        </div>
      ) : (
        <div ref={gridRef}>
          <p className="section-label" style={{ marginBottom: 12 }} data-anim>
            SELECT SUSPECT OPERATIVE
          </p>

          <div style={{ display: 'grid', gap: 10 }}>
            {players.map((p) => (
              <button
                key={p.id}
                data-anim
                className={`vote-card ${selected === p.id ? 'selected' : ''}`}
                onClick={() => {
                  soundManager.playClick();
                  setSelected(p.id);
                }}
                disabled={p.id === voter.id}
                style={{ width: '100%', opacity: p.id === voter.id ? 0.4 : 1 }}
              >
                <span className="mini-dot" style={{ background: p.color }}>
                  {p.name.charAt(0).toUpperCase()}
                </span>
                <div style={{ textAlign: 'left', flex: 1 }}>
                  <div className="vote-name">{p.name}</div>
                  {p.id === voter.id && (
                    <div className="vote-sub">Your identity — select another operative</div>
                  )}
                </div>
              </button>
            ))}

            <button
              data-anim
              className={`vote-card vote-skip ${selected === 'skip' ? 'selected' : ''}`}
              style={{ width: '100%' }}
              onClick={() => {
                soundManager.playClick();
                setSelected('skip');
              }}
            >
              <SkipForward size={18} color="var(--text-secondary)" />
              <span className="vote-name">ABSTAIN / SKIP BALLOT</span>
            </button>
          </div>

          <button
            className="btn btn-danger btn-block btn-lg"
            style={{ marginTop: 22 }}
            disabled={!selected}
            onClick={() => selected && cast(selected)}
          >
            <Gavel size={17} />
            CONFIRM & CAST BALLOT ↗
          </button>

          <p
            style={{
              textAlign: 'center',
              marginTop: 14,
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: 'var(--text-muted)',
            }}
          >
            BALLOTS ARE ENCRYPTED UNTIL ALL CREWMATES HAVE VOTED
          </p>
        </div>
      )}
    </div>
  );
}
