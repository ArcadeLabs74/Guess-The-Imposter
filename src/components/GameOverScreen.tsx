import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import type { Player, WordData, GameStats } from '../types/game';
import { RefreshCw, Home, Sparkles } from 'lucide-react';
import { soundManager } from '../services/soundService';
import { GeminiService } from '../services/geminiService';

interface GameOverScreenProps {
  stats: GameStats;
  wordData: WordData;
  players: Player[];
  imposters: Player[];
  onPlayAgain: () => void;
  onReturnHome: () => void;
  geminiApiKey: string;
}

export const GameOverScreen: React.FC<GameOverScreenProps> = ({
  stats,
  wordData,
  players,
  imposters,
  onPlayAgain,
  onReturnHome,
  geminiApiKey,
}) => {
  const isCrewWinner = stats.winner === 'crew';
  const [aiDebrief, setAiDebrief] = useState<string>(stats.aiDebrief || '');
  const [isLoadingDebrief, setIsLoadingDebrief] = useState(!stats.aiDebrief);

  useEffect(() => {
    if (isCrewWinner) {
      soundManager.playVictory();
    } else {
      soundManager.playImposterSting();
    }

    // Launch confetti celebration
    try {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: isCrewWinner ? ['#06b6d4', '#3b82f6', '#10b981'] : ['#ef4444', '#f59e0b', '#ec4899'],
      });
    } catch (e) {
      // ignore
    }

    // Fetch Gemini debrief if not ready
    if (!stats.aiDebrief) {
      GeminiService.generateDebrief(
        stats.winner,
        wordData.secretWord,
        imposters.map((i) => i.name),
        isCrewWinner,
        geminiApiKey
      ).then((commentary) => {
        setAiDebrief(commentary);
        setIsLoadingDebrief(false);
      });
    }
  }, [isCrewWinner, stats, wordData, imposters, geminiApiKey]);

  return (
    <div style={{
      maxWidth: '920px',
      margin: '0 auto',
      padding: '30px 20px 70px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '28px',
      textAlign: 'center',
    }} className="animate-scale-up">
      {/* Big Victory Card */}
      <div className="glass-panel" style={{
        width: '100%',
        padding: '40px 30px',
        borderRadius: 'var(--radius-lg)',
        background: isCrewWinner
          ? 'linear-gradient(135deg, rgba(6, 182, 212, 0.2) 0%, rgba(15, 23, 42, 0.95) 100%)'
          : 'linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(15, 23, 42, 0.95) 100%)',
        border: isCrewWinner ? '2px solid var(--cyan-accent)' : '2px solid var(--rose-accent)',
        boxShadow: isCrewWinner ? '0 0 50px rgba(6, 182, 212, 0.35)' : '0 0 50px rgba(239, 68, 68, 0.35)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px',
      }}>
        <div style={{
          width: '84px',
          height: '84px',
          borderRadius: '50%',
          background: isCrewWinner ? 'rgba(6, 182, 212, 0.2)' : 'rgba(239, 68, 68, 0.2)',
          border: isCrewWinner ? '2px solid var(--cyan-accent)' : '2px solid var(--rose-accent)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '44px',
        }} className="animate-float">
          {isCrewWinner ? '🏆' : '🎭'}
        </div>

        <h1 style={{
          fontSize: 'clamp(32px, 5vw, 54px)',
          fontWeight: 900,
          color: '#ffffff',
          textTransform: 'uppercase',
          letterSpacing: '-0.02em',
          margin: 0,
        }}>
          {isCrewWinner ? 'Crew Victory!' : 'Imposter Triumph!'}
        </h1>

        <p style={{
          fontSize: '18px',
          color: 'var(--text-secondary)',
          maxWidth: '580px',
          lineHeight: '1.5',
        }}>
          {stats.reason}
        </p>

        {/* AI Debrief Commentary Box */}
        <div style={{
          marginTop: '12px',
          background: 'rgba(0, 0, 0, 0.4)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: 'var(--radius-md)',
          padding: '16px 24px',
          maxWidth: '620px',
          width: '100%',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            fontSize: '12px',
            color: 'var(--cyan-accent)',
            textTransform: 'uppercase',
            fontWeight: 800,
            marginBottom: '6px',
          }}>
            <Sparkles size={14} />
            <span>Gemini AI Match Debrief</span>
          </div>
          <div style={{ fontSize: '15px', color: '#fff', fontStyle: 'italic', lineHeight: '1.5' }}>
            {isLoadingDebrief ? 'Generating witty post-game debrief...' : `"${aiDebrief}"`}
          </div>
        </div>
      </div>

      {/* Secret Word & Clue Reveal Details */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '16px',
        width: '100%',
      }}>
        {/* The Secret Word */}
        <div className="glass-panel" style={{ padding: '24px', textAlign: 'left' }}>
          <div style={{ fontSize: '11px', color: 'var(--cyan-accent)', textTransform: 'uppercase', fontWeight: 800, marginBottom: '4px' }}>
            The Secret Word (Category: {wordData.category})
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#fff', marginBottom: '8px' }}>
            {wordData.secretWord}
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Known only to the honest Crewmates during the match.
          </div>
        </div>

        {/* Imposter Hint */}
        <div className="glass-panel" style={{ padding: '24px', textAlign: 'left' }}>
          <div style={{ fontSize: '11px', color: 'var(--rose-accent)', textTransform: 'uppercase', fontWeight: 800, marginBottom: '4px' }}>
            Imposter's Covert Hint
          </div>
          <div style={{ fontSize: '15px', fontWeight: 600, color: '#fff', fontStyle: 'italic', marginBottom: '8px' }}>
            "{wordData.imposterHint}"
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            The sole intelligence provided to the imposter to bluff.
          </div>
        </div>
      </div>

      {/* Complete Operative Roster & Roles Breakdown */}
      <div className="glass-panel" style={{ padding: '28px', width: '100%' }}>
        <h3 style={{ fontSize: '20px', color: '#fff', marginBottom: '20px', textAlign: 'left' }}>
          All Operatives Revealed
        </h3>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '14px',
        }}>
          {players.map((p) => {
            const isImp = p.role === 'imposter';
            return (
              <div
                key={p.id}
                style={{
                  background: 'rgba(0, 0, 0, 0.4)',
                  border: isImp ? '1px solid rgba(239, 68, 68, 0.5)' : '1px solid rgba(6, 182, 212, 0.3)',
                  borderRadius: 'var(--radius-md)',
                  padding: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  textAlign: 'left',
                }}
              >
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  background: 'rgba(0,0,0,0.5)',
                  border: `2px solid ${p.color}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                }}>
                  {p.avatar}
                </div>

                <div style={{ overflow: 'hidden' }}>
                  <div style={{ fontWeight: 700, color: '#fff', fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {p.name}
                  </div>
                  <div style={{
                    fontSize: '11px',
                    fontWeight: 800,
                    color: isImp ? 'var(--rose-accent)' : 'var(--cyan-accent)',
                    textTransform: 'uppercase',
                    marginTop: '2px',
                  }}>
                    {isImp ? '🎭 Imposter' : '🛡️ Crewmate'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Rematch Actions */}
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '10px' }}>
        <button
          type="button"
          onClick={() => {
            soundManager.playClick();
            onPlayAgain();
          }}
          className="btn-primary"
          style={{ padding: '16px 36px', fontSize: '17px' }}
        >
          <RefreshCw size={20} />
          <span>Play Rematch (New Secret Word)</span>
        </button>

        <button
          type="button"
          onClick={() => {
            soundManager.playClick();
            onReturnHome();
          }}
          className="btn-secondary"
          style={{ padding: '16px 28px', fontSize: '17px' }}
        >
          <Home size={18} />
          <span>Main Menu</span>
        </button>
      </div>
    </div>
  );
};
