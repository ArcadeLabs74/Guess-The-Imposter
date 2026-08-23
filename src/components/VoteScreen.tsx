import { useEffect, useRef, useState } from 'react';
import { Gavel, SkipForward, ShieldAlert } from 'lucide-react';
import type { Player } from '../types/game';
import { animateScreenIn } from '../lib/animations';
import { soundManager } from '../services/soundService';

interface VoteScreenProps {
  players: Player[];
  voterIndex: number;
  onCastVote: (targetId: string | 'skip') => void;
}

export function VoteScreen({ players, voterIndex, onCastVote }: VoteScreenProps) {
  const voter = players[voterIndex];
  const [selected, setSelected] = useState<string | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    animateScreenIn(gridRef.current);
  }, []);

  const cast = (target: string | 'skip') => {
    soundManager.playVoteCast();
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
          BALLOT {voterIndex + 1} / {players.length}
        </span>
      </div>

      <div className="pass-banner">
        <span className="chip-label">CONFIDENTIAL BALLOT · CURRENT VOTER:</span>
        <strong style={{ fontFamily: 'var(--font-display)', fontSize: 17, color: 'var(--ink)' }}>
          {voter.name}
        </strong>
      </div>

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
    </div>
  );
}
