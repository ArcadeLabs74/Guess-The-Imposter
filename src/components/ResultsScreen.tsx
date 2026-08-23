import { useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import { ShieldCheck, EyeOff, Trophy, RotateCcw, Home } from 'lucide-react';
import type { Player, VoteResult, WordData } from '../types/game';
import { animateScreenIn, popIn, shakeEl } from '../lib/animations';
import { soundManager } from '../services/soundService';

interface ResultsScreenProps {
  players: Player[];
  wordData: WordData;
  voteResult: VoteResult;
  winner: 'crew' | 'imposter';
  reason: string;
  onRematch: () => void;
  onHome: () => void;
}

export function ResultsScreen({
  players,
  wordData,
  voteResult,
  winner,
  reason,
  onRematch,
  onHome,
}: ResultsScreenProps) {
  const [stage, setStage] = useState<'tally' | 'reveal'>('tally');
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      setStage('reveal');
      if (winner === 'crew') soundManager.playVictory();
      else soundManager.playImposterSting();

      setTimeout(() => {
        if (heroRef.current && winner === 'imposter') shakeEl(heroRef.current);
        if (heroRef.current) popIn(heroRef.current);
      }, 30);

      if (winner === 'crew') {
        confetti({
          particleCount: 180,
          spread: 100,
          origin: { y: 0.35 },
          colors: ['#5a8a72', '#7da58f', '#0b1713', '#dfe9e1'],
        });
      }
    }, 1400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    animateScreenIn(heroRef.current);
  }, []);

  if (stage === 'tally') {
    return (
      <div className="screen screen-narrow" style={{ display: 'grid', placeItems: 'center', minHeight: '400px' }}>
        <div className="pass-card">
          <span className="lock-ring" style={{ width: 84, height: 84, margin: '0 auto 16px' }}>
            <Trophy size={34} />
          </span>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 32, textTransform: 'uppercase', color: 'var(--ink)' }}>
            DECRYPTING BALLOTS…
          </h2>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginTop: 8 }}>
            {voteResult.skippedCount} ABSTAINED · {players.length - voteResult.skippedCount} BALLOTS COUNTED
          </p>
        </div>
      </div>
    );
  }

  const crewWon = winner === 'crew';
  const imposters = players.filter((p) => p.role === 'imposter');

  return (
    <div className="screen screen-narrow">
      <section
        className={`corner-notch-card ${crewWon ? 'theme-sage' : ''}`}
        style={{
          '--card-bg': crewWon ? 'var(--sage-deep)' : 'var(--danger)',
          '--parent-bg': 'var(--bg)',
          minHeight: '260px',
        } as React.CSSProperties}
        ref={heroRef}
      >
        {/* Signature Inverted Corner Notch Dock */}
        <div className="notch-dock">
          <button
            className="notch-arrow-btn"
            onClick={onRematch}
            aria-label="Rematch"
            title="Launch Rematch"
          >
            <RotateCcw size={22} />
          </button>
        </div>

        {/* Top-Left Inverted Concave Fillet */}
        <div className="notch-fillet-tl" aria-hidden="true">
          <svg viewBox="0 0 28 28" fill="none" className="fillet-svg">
            <path d="M 0 0 C 15.464 0 28 12.536 28 28 V 0 H 0 Z" fill="var(--parent-bg)" />
          </svg>
        </div>

        {/* Bottom-Right Inverted Concave Fillet */}
        <div className="notch-fillet-br" aria-hidden="true">
          <svg viewBox="0 0 28 28" fill="none" className="fillet-svg">
            <path d="M 0 0 C 15.464 0 28 12.536 28 28 V 0 H 0 Z" fill="var(--parent-bg)" />
          </svg>
        </div>

        <div className="notch-card-content" style={{ textAlign: 'left' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 14px',
                borderRadius: '999px',
                background: 'rgba(255, 255, 255, 0.15)',
                fontFamily: 'var(--font-mono)',
                fontSize: 10.5,
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: '#fff',
              }}
            >
              {crewWon ? <ShieldCheck size={14} /> : <EyeOff size={14} />}
              MISSION OUTCOME
            </span>
          </div>

          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(38px, 5.5vw, 56px)',
              lineHeight: 0.95,
              textTransform: 'uppercase',
              color: '#fff',
              marginBottom: 14,
            }}
          >
            {crewWon ? 'CREW VICTORY' : 'IMPOSTER ESCAPED'}
          </h2>

          <p style={{ fontSize: 15, lineHeight: 1.6, color: 'rgba(255, 255, 255, 0.85)', maxWidth: 480 }}>
            {reason}
          </p>

          <div style={{ marginTop: 22, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 14px',
                borderRadius: '999px',
                background: 'rgba(0, 0, 0, 0.25)',
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                fontWeight: 600,
                color: '#fff',
              }}
            >
              SECRET WORD: <strong>{wordData.secretWord}</strong>
            </span>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 14px',
                borderRadius: '999px',
                background: 'rgba(0, 0, 0, 0.25)',
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                fontWeight: 600,
                color: '#fff',
              }}
            >
              IMPOSTER{imposters.length > 1 ? 'S' : ''}: <strong>{imposters.map((i) => i.name).join(', ')}</strong>
            </span>
          </div>
        </div>
      </section>

      <div style={{ marginTop: 24 }}>
        <div className="section-label" style={{ marginBottom: 12 }}>
          FULL OPERATIVE DOSSIER
        </div>
        <div className="roster-grid">
          {players.map((p) => (
            <div key={p.id} className="roster-card">
              <span className="mini-dot" style={{ background: p.color }}>
                {p.name.charAt(0).toUpperCase()}
              </span>
              <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--ink)' }}>{p.name}</span>
              <span className={`role-tag ${p.role}`}>{p.role === 'imposter' ? 'IMPOSTER' : 'CREW'}</span>
            </div>
          ))}
        </div>
      </div>

      {voteResult.ejectedPlayerName && (
        <div style={{ marginTop: 18, padding: '14px 18px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
          <div className="section-label" style={{ marginBottom: 4 }}>
            BALLOT SUMMARY
          </div>
          <p style={{ fontSize: 13.5, color: 'var(--text-secondary)' }}>
            <strong style={{ color: 'var(--text-primary)' }}>{voteResult.ejectedPlayerName}</strong> received the most votes ({voteResult.voteCounts[voteResult.ejectedPlayerId!] || 0} ballots) —{' '}
            {voteResult.ejectedRole === 'imposter' ? 'confirmed imposter.' : 'innocent crewmate.'}{' '}
            {voteResult.skippedCount > 0 && `${voteResult.skippedCount} abstained.`}
          </p>
        </div>
      )}

      <div style={{ display: 'flex', gap: 12, marginTop: 24, flexWrap: 'wrap' }}>
        <button className="btn btn-primary btn-lg" style={{ flex: 1 }} onClick={onRematch}>
          <RotateCcw size={16} />
          REMATCH — NEW WORD ↗
        </button>
        <button className="btn btn-secondary btn-lg" style={{ flex: 1 }} onClick={onHome}>
          <Home size={16} />
          RETURN TO HOME
        </button>
      </div>
    </div>
  );
}
