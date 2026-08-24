import { useEffect, useRef, useState } from 'react';
import { Lock, ShieldCheck, Eye, ArrowRight } from 'lucide-react';
import type { Player, WordData } from '../types/game';
import { flipRevealCard, popIn } from '../lib/animations';
import { soundManager } from '../services/soundService';

interface RoleRevealScreenProps {
  players: Player[];
  wordData: WordData;
  revealIndex: number;
  onConfirm: () => void;
  isOnlineMode?: boolean;
  myPlayer?: Player | null;
  isHost?: boolean;
}

export function RoleRevealScreen({
  players,
  wordData,
  revealIndex,
  onConfirm,
  isOnlineMode = false,
  myPlayer,
  isHost = false,
}: RoleRevealScreenProps) {
  const activePlayer = isOnlineMode ? (myPlayer || players[0]) : players[revealIndex];
  const [revealed, setRevealed] = useState(false);
  const flipRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const busyRef = useRef(false);

  useEffect(() => {
    if (stageRef.current) {
      popIn(stageRef.current);
    }
  }, []);

  const handleFlip = () => {
    if (revealed || busyRef.current || !flipRef.current) return;
    busyRef.current = true;
    soundManager.playCardFlip();
    flipRevealCard(flipRef.current);
    setTimeout(() => {
      setRevealed(true);
      busyRef.current = false;
    }, 620);
  };

  const isLast = isOnlineMode ? true : revealIndex === players.length - 1;

  return (
    <div className="screen screen-narrow">
      <div className="pass-banner">
        <span className="chip-label">
          {isOnlineMode
            ? 'ONLINE CONFIDENTIAL IDENTITY'
            : `CONFIDENTIAL ROLE ${revealIndex + 1} OF ${players.length} · PASS DEVICE TO`}
        </span>
        <strong style={{ fontFamily: 'var(--font-display)', fontSize: 17, color: 'var(--ink)' }}>
          {activePlayer.name}
        </strong>
      </div>

      <div className="card panel-pad pass-card" ref={stageRef}>
        <span
          className="reveal-avatar"
          style={{ background: `linear-gradient(135deg, ${activePlayer.color}, ${activePlayer.color}cc)` }}
        >
          {activePlayer.name.charAt(0).toUpperCase()}
        </span>

        {!revealed ? (
          <>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, textTransform: 'uppercase' }}>
              IDENTITY VERIFICATION
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginTop: 6, maxWidth: 420, marginInline: 'auto', fontSize: 14 }}>
              Ensure your screen is private. Tap the security capsule to decrypt your classified role.
            </p>
          </>
        ) : (
          <>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, textTransform: 'uppercase' }}>
              ROLE ACKNOWLEDGED
            </h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: 420, marginInline: 'auto', fontSize: 13.5 }}>
              Memorize your objective, then proceed to the clue discussion when ready.
            </p>
          </>
        )}

        <div
          className="flip-stage"
          onClick={handleFlip}
          style={{ cursor: revealed ? 'default' : 'pointer' }}
          role={revealed ? undefined : 'button'}
          aria-label={revealed ? undefined : 'Reveal role'}
        >
          <div className="flip-inner" ref={flipRef}>
            <div className="flip-face front">
              {!revealed && (
                <>
                  <span className="lock-ring">
                    <Lock size={26} strokeWidth={2.2} />
                  </span>
                  <h3 style={{ fontSize: 20, fontWeight: 700 }}>TAP TO DECRYPT ROLE</h3>
                  <p className="chip-label">CLASSIFIED INFORMATION · PRIVATE</p>
                </>
              )}
            </div>
            <div className="flip-face back">
              {activePlayer.role === 'imposter' ? (
                <>
                  <span className="flip-role-banner imposter">
                    <Eye size={15} />
                    UNDERCOVER IMPOSTER
                  </span>
                  <span className="chip-label">YOUR INTERCEPTED HINT</span>
                  <p className="hint-text">“{wordData.imposterHint}”</p>
                  <p className="setting-desc" style={{ maxWidth: 320, color: 'rgba(255, 255, 255, 0.75)' }}>
                    Blend in with the crew. Give clues that sound authentic without giving away that you don't know the word.
                  </p>
                </>
              ) : (
                <>
                  <span className="flip-role-banner crew">
                    <ShieldCheck size={15} />
                    CREWMATE
                  </span>
                  <span className="chip-label">THE SECRET COORDINATE / WORD</span>
                  <span className="secret-word">{wordData.secretWord}</span>
                  <p className="setting-desc" style={{ color: 'rgba(255, 255, 255, 0.75)' }}>
                    Hint at it cleverly without giving it directly to the imposter.
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        {revealed && (
          <button className="btn btn-primary btn-lg" style={{ marginTop: 24 }} onClick={onConfirm}>
            {isOnlineMode
              ? isHost
                ? 'START CLUE TRANSMISSION FOR ALL ↗'
                : 'READY FOR CLUE TRANSMISSION ↗'
              : isLast
              ? 'BEGIN CLUE TRANSMISSION ↗'
              : `PASS TO ${players[revealIndex + 1].name} ↗`}
            <ArrowRight size={17} />
          </button>
        )}
      </div>
    </div>
  );
}
