import React, { useState } from 'react';
import type { Player, WordData } from '../types/game';
import { Eye, EyeOff, ShieldCheck, ShieldAlert, ArrowRight, Lock } from 'lucide-react';
import { soundManager } from '../services/soundService';

interface RoleRevealScreenProps {
  player: Player;
  wordData: WordData;
  onConfirmReady: () => void;
}

export const RoleRevealScreen: React.FC<RoleRevealScreenProps> = ({
  player,
  wordData,
  onConfirmReady,
}) => {
  const [isRevealed, setIsRevealed] = useState(false);
  const isImposter = player.role === 'imposter';

  const toggleReveal = () => {
    soundManager.playCardFlip();
    setIsRevealed(!isRevealed);
  };

  return (
    <div style={{
      maxWidth: '720px',
      margin: '0 auto',
      padding: '30px 20px 60px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '28px',
    }} className="animate-scale-up">
      {/* Top Header */}
      <div style={{ textAlign: 'center' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 16px',
          background: 'rgba(239, 68, 68, 0.12)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: 'var(--radius-full)',
          color: 'var(--rose-accent)',
          fontSize: '12px',
          fontWeight: 700,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          marginBottom: '12px',
        }}>
          <Lock size={14} />
          <span>Classified Dossier • Eyes Only</span>
        </div>
        <h2 style={{ fontSize: '32px', color: '#fff', marginBottom: '6px' }}>
          Identity Assignment
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
          Hold or toggle to reveal your confidential mission role and intelligence.
        </p>
      </div>

      {/* Holographic Role Dossier Card */}
      <div
        onClick={toggleReveal}
        style={{
          width: '100%',
          minHeight: '360px',
          borderRadius: 'var(--radius-lg)',
          background: isRevealed
            ? isImposter
              ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.18) 0%, rgba(15, 23, 42, 0.95) 100%)'
              : 'linear-gradient(135deg, rgba(6, 182, 212, 0.18) 0%, rgba(15, 23, 42, 0.95) 100%)'
            : 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.95) 100%)',
          border: isRevealed
            ? isImposter
              ? '2px solid rgba(239, 68, 68, 0.7)'
              : '2px solid rgba(6, 182, 212, 0.7)'
            : '2px dashed rgba(255, 255, 255, 0.2)',
          boxShadow: isRevealed
            ? isImposter
              ? '0 0 40px rgba(239, 68, 68, 0.35)'
              : '0 0 40px rgba(6, 182, 212, 0.35)'
            : '0 15px 35px rgba(0, 0, 0, 0.5)',
          padding: '36px 28px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          position: 'relative',
          userSelect: 'none',
          textAlign: 'center',
        }}
      >
        {!isRevealed ? (
          /* Card Back / Concealed state */
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '24px',
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid var(--border-bright)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '36px',
            }} className="animate-float">
              🔒
            </div>

            <div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: '#fff', marginBottom: '4px' }}>
                CLICK TO REVEAL ROLE
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                Keep your screen hidden from surrounding players!
              </div>
            </div>

            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(255, 255, 255, 0.08)',
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              fontSize: '12px',
              color: 'var(--cyan-accent)',
              fontWeight: 600,
              marginTop: '10px',
            }}>
              <Eye size={14} />
              <span>Tap anywhere to inspect</span>
            </div>
          </div>
        ) : (
          /* Card Front / Revealed state */
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
            {/* Role Header */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 20px',
              borderRadius: 'var(--radius-full)',
              background: isImposter ? 'rgba(239, 68, 68, 0.25)' : 'rgba(6, 182, 212, 0.25)',
              border: isImposter ? '1px solid var(--rose-accent)' : '1px solid var(--cyan-accent)',
            }}>
              {isImposter ? <ShieldAlert size={20} color="#f43f5e" /> : <ShieldCheck size={20} color="#06b6d4" />}
              <span style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '18px',
                fontWeight: 800,
                letterSpacing: '0.06em',
                color: isImposter ? '#f43f5e' : '#38bdf8',
                textTransform: 'uppercase',
              }}>
                {isImposter ? 'YOU ARE THE IMPOSTER 🎭' : 'YOU ARE A CREWMATE 🛡️'}
              </span>
            </div>

            {/* Category */}
            <div style={{
              background: 'rgba(0,0,0,0.4)',
              padding: '8px 18px',
              borderRadius: 'var(--radius-full)',
              fontSize: '14px',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border-subtle)',
            }}>
              Category: <strong style={{ color: '#fff' }}>{wordData.category}</strong>
            </div>

            {/* Main Secret Content */}
            {!isImposter ? (
              /* Crew View: The Secret Word */
              <div style={{
                background: 'rgba(6, 182, 212, 0.12)',
                border: '1px solid rgba(6, 182, 212, 0.4)',
                borderRadius: 'var(--radius-md)',
                padding: '24px 32px',
                width: '100%',
                maxWidth: '480px',
              }}>
                <div style={{ fontSize: '12px', color: 'var(--cyan-accent)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '6px' }}>
                  Secret Word
                </div>
                <div style={{
                  fontSize: '32px',
                  fontWeight: 900,
                  color: '#ffffff',
                  fontFamily: 'var(--font-heading)',
                  letterSpacing: '0.04em',
                  textShadow: '0 0 20px rgba(6, 182, 212, 0.6)',
                }}>
                  {wordData.secretWord}
                </div>
              </div>
            ) : (
              /* Imposter View: Only single cryptic clue */
              <div style={{
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                borderRadius: 'var(--radius-md)',
                padding: '20px 24px',
                width: '100%',
                maxWidth: '480px',
              }}>
                <div style={{ fontSize: '12px', color: 'var(--rose-accent)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '6px' }}>
                  Single Covert Clue (Secret word is hidden from you!)
                </div>
                <div style={{
                  fontSize: '16px',
                  fontWeight: 600,
                  color: '#ffffff',
                  lineHeight: '1.5',
                  fontStyle: 'italic',
                }}>
                  "{wordData.imposterHint}"
                </div>
              </div>
            )}

            {/* Tactical Strategy Advice */}
            <p style={{
              fontSize: '14px',
              color: 'var(--text-secondary)',
              maxWidth: '460px',
              lineHeight: '1.5',
            }}>
              {isImposter
                ? 'Your objective: You do not know the exact word. Use this single clue to sound credible, listen to crew clues, and deflect suspicion!'
                : 'Your objective: Provide a subtle clue showing you know the secret word, without making it so obvious that the imposter learns it!'}
            </p>

            <div style={{
              fontSize: '11px',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}>
              <EyeOff size={13} />
              <span>Tap card again to conceal before others look</span>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Action */}
      <button
        type="button"
        onClick={() => {
          soundManager.playClick();
          onConfirmReady();
        }}
        className="btn-primary"
        style={{
          padding: '16px 40px',
          fontSize: '17px',
          width: '100%',
          maxWidth: '480px',
        }}
      >
        <span>I Understand My Mission • Enter Discussion</span>
        <ArrowRight size={18} />
      </button>
    </div>
  );
};
