import React, { useState, useEffect } from 'react';
import type { Player, WordData, VoteResult } from '../types/game';
import { ShieldCheck, ShieldAlert, Sparkles, ArrowRight } from 'lucide-react';
import { soundManager } from '../services/soundService';

interface VoteRevealScreenProps {
  voteResult: VoteResult;
  wordData: WordData;
  players: Player[];
  currentPlayerId: string;
  onProceedToGameOver: (imposterGuess?: string, isCorrectGuess?: boolean) => void;
}

export const VoteRevealScreen: React.FC<VoteRevealScreenProps> = ({
  voteResult,
  wordData,
  players,
  onProceedToGameOver,
}) => {
  const [step, setStep] = useState<'suspense' | 'revealed' | 'imposter_guess'>('suspense');
  const [guessInput, setGuessInput] = useState('');
  const [guessResult, setGuessResult] = useState<boolean | null>(null);

  const votedPlayer = players.find((p) => p.id === voteResult.votedOutPlayerId);
  const isVotedImposter = voteResult.isImposterCaught;

  useEffect(() => {
    soundManager.playTick();
    const timer = setTimeout(() => {
      setStep('revealed');
      if (isVotedImposter) {
        soundManager.playVictory();
      } else {
        soundManager.playImposterSting();
      }
    }, 2800);

    return () => clearTimeout(timer);
  }, [isVotedImposter]);

  const handleGuessSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guessInput.trim()) return;

    const normalizedGuess = guessInput.trim().toLowerCase();
    const normalizedWord = wordData.secretWord.trim().toLowerCase();
    const isCorrect = normalizedGuess === normalizedWord || normalizedWord.includes(normalizedGuess);

    setGuessResult(isCorrect);
    if (isCorrect) {
      soundManager.playVictory();
    } else {
      soundManager.playImposterSting();
    }

    setTimeout(() => {
      onProceedToGameOver(guessInput.trim(), isCorrect);
    }, 2000);
  };

  return (
    <div style={{
      maxWidth: '820px',
      margin: '0 auto',
      padding: '40px 20px 60px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '32px',
      textAlign: 'center',
    }} className="animate-scale-up">
      {/* Suspense Phase */}
      {step === 'suspense' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
          <div style={{
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            background: 'rgba(239, 68, 68, 0.2)',
            border: '3px solid var(--rose-accent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '44px',
          }} className="animate-float">
            ⏳
          </div>

          <div>
            <h2 style={{ fontSize: '36px', color: '#fff', marginBottom: '8px' }}>
              Tallying Council Votes...
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '16px' }}>
              The airlock chambers are pressurizing. Unmasking suspect...
            </p>
          </div>
        </div>
      )}

      {/* Revealed Phase */}
      {step === 'revealed' && (
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '28px' }}>
          {voteResult.isTie || !votedPlayer ? (
            /* Tie or Skip */
            <div className="glass-panel" style={{
              padding: '40px 30px',
              border: '2px solid var(--border-bright)',
              borderRadius: 'var(--radius-lg)',
              maxWidth: '600px',
            }}>
              <div style={{ fontSize: '50px', marginBottom: '16px' }}>⚖️</div>
              <h2 style={{ fontSize: '32px', color: '#fff', marginBottom: '12px' }}>
                No Operative Ejected!
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '16px', lineHeight: '1.5' }}>
                The votes resulted in a tie or majority skip. The council was unable to reach a conclusive verdict.
              </p>
            </div>
          ) : (
            /* Player Ejected */
            <div className="glass-panel" style={{
              padding: '40px 30px',
              border: isVotedImposter ? '2px solid var(--emerald-accent)' : '2px solid var(--crimson-imposter)',
              boxShadow: isVotedImposter ? '0 0 40px rgba(16, 185, 129, 0.35)' : '0 0 40px rgba(239, 68, 68, 0.35)',
              borderRadius: 'var(--radius-lg)',
              maxWidth: '600px',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '20px',
            }}>
              {/* Avatar Portrait */}
              <div style={{
                width: '90px',
                height: '90px',
                borderRadius: '24px',
                background: 'rgba(0, 0, 0, 0.6)',
                border: `3px solid ${votedPlayer.color}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '48px',
                boxShadow: '0 0 25px rgba(0,0,0,0.5)',
              }}>
                {votedPlayer.avatar}
              </div>

              <div>
                <h2 style={{ fontSize: '32px', color: '#fff', marginBottom: '6px' }}>
                  {votedPlayer.name} was ejected!
                </h2>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 20px',
                  borderRadius: 'var(--radius-full)',
                  background: isVotedImposter ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                  border: isVotedImposter ? '1px solid var(--emerald-accent)' : '1px solid var(--crimson-imposter)',
                  marginTop: '10px',
                }}>
                  {isVotedImposter ? <ShieldCheck size={20} color="#10b981" /> : <ShieldAlert size={20} color="#ef4444" />}
                  <span style={{
                    fontSize: '17px',
                    fontWeight: 800,
                    color: isVotedImposter ? '#10b981' : '#f43f5e',
                    textTransform: 'uppercase',
                  }}>
                    {isVotedImposter ? 'WAS AN IMPOSTER 🎭' : 'WAS AN INNOCENT CREWMATE 🛡️'}
                  </span>
                </div>
              </div>

              {/* Imposter Caught Last Stand Option */}
              {isVotedImposter && (
                <div style={{
                  background: 'rgba(245, 158, 11, 0.12)',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  borderRadius: 'var(--radius-md)',
                  padding: '16px',
                  width: '100%',
                  marginTop: '10px',
                }}>
                  <div style={{ fontSize: '13px', color: 'var(--amber-accent)', fontWeight: 700, marginBottom: '4px' }}>
                    LAST CHANCE GUESS
                  </div>
                  <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                    Can the Imposter still guess the secret word to steal victory?
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', justifyContent: 'center' }}>
            {isVotedImposter && !voteResult.isTie ? (
              <button
                type="button"
                onClick={() => {
                  soundManager.playClick();
                  setStep('imposter_guess');
                }}
                className="btn-primary"
                style={{
                  background: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
                  padding: '16px 32px',
                  fontSize: '16px',
                }}
              >
                <span>Imposter Clutch Guess (Steal Win)</span>
                <Sparkles size={18} />
              </button>
            ) : null}

            <button
              type="button"
              onClick={() => {
                soundManager.playClick();
                onProceedToGameOver();
              }}
              className="btn-primary"
              style={{ padding: '16px 36px', fontSize: '16px' }}
            >
              <span>View Final Debrief & Results</span>
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Imposter Guess Sub-Phase */}
      {step === 'imposter_guess' && (
        <form onSubmit={handleGuessSubmit} className="glass-panel" style={{
          padding: '36px',
          maxWidth: '560px',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '20px',
          border: '2px solid var(--amber-accent)',
        }}>
          <div style={{ fontSize: '40px' }}>🎯</div>
          <div>
            <h3 style={{ fontSize: '24px', color: '#fff', marginBottom: '6px' }}>
              Final Stand: Guess the Secret Word
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
              Category: <strong style={{ color: '#fff' }}>{wordData.category}</strong>
            </p>
          </div>

          <input
            type="text"
            placeholder="Type your secret word guess..."
            value={guessInput}
            onChange={(e) => setGuessInput(e.target.value)}
            disabled={guessResult !== null}
            style={{
              width: '100%',
              padding: '14px 18px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-bright)',
              background: 'rgba(0,0,0,0.5)',
              color: '#fff',
              fontSize: '18px',
              fontFamily: 'var(--font-heading)',
              textAlign: 'center',
              outline: 'none',
            }}
          />

          {guessResult !== null && (
            <div style={{
              fontSize: '18px',
              fontWeight: 800,
              color: guessResult ? '#10b981' : '#ef4444',
            }}>
              {guessResult ? '🎉 CORRECT GUESS! IMPOSTER STEALS THE WIN!' : '❌ INCORRECT GUESS! CREW WINS!'}
            </div>
          )}

          <button
            type="submit"
            disabled={!guessInput.trim() || guessResult !== null}
            className="btn-primary"
            style={{
              width: '100%',
              padding: '14px',
              fontSize: '16px',
              background: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
            }}
          >
            Submit Final Guess
          </button>
        </form>
      )}
    </div>
  );
};
