import React, { useState, useEffect } from 'react';
import type { Player, ClueItem, WordData } from '../types/game';
import { AlertOctagon, Vote, Clock, CheckCircle2, SkipForward } from 'lucide-react';
import { soundManager } from '../services/soundService';

interface VotingScreenProps {
  players: Player[];
  currentPlayerId: string;
  clues: ClueItem[];
  wordData: WordData;
  onCastVote: (targetPlayerId: string | 'skip') => void;
  onVotesComplete: () => void;
}

export const VotingScreen: React.FC<VotingScreenProps> = ({
  players,
  currentPlayerId,
  clues,
  onCastVote,
  onVotesComplete,
}) => {
  const [selectedTargetId, setSelectedTargetId] = useState<string | 'skip' | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [voteTimer, setVoteTimer] = useState(35);

  // Play siren sound on mount
  useEffect(() => {
    soundManager.playEmergency();
  }, []);

  // Timer countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setVoteTimer((prev) => {
        if (prev <= 5 && prev > 1) {
          soundManager.playTick();
        }
        if (prev <= 1) {
          clearInterval(timer);
          onVotesComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onVotesComplete]);

  // Handle bot voting simulation
  useEffect(() => {
    const botVoteTimer = setTimeout(() => {
      players.forEach((p) => {
        if (p.isBot && !p.votedFor) {
          const eligibleTargets = players.filter((target) => target.id !== p.id);
          const randomTarget = eligibleTargets[Math.floor(Math.random() * eligibleTargets.length)];
          p.votedFor = randomTarget ? randomTarget.id : 'skip';
        }
      });
    }, 2500);

    return () => clearTimeout(botVoteTimer);
  }, [players]);

  const handleSelect = (targetId: string | 'skip') => {
    if (hasVoted) return;
    soundManager.playClick();
    setSelectedTargetId(targetId);
  };

  const handleConfirmVote = () => {
    if (!selectedTargetId || hasVoted) return;
    soundManager.playVoteCast();
    setHasVoted(true);
    onCastVote(selectedTargetId);
  };

  return (
    <div style={{
      maxWidth: '1050px',
      margin: '0 auto',
      padding: '24px 20px 60px',
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
    }} className="animate-scale-up">
      {/* Emergency Siren Header */}
      <div className="glass-panel animate-siren" style={{
        padding: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        borderRadius: 'var(--radius-lg)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '54px',
            height: '54px',
            borderRadius: '50%',
            background: 'rgba(239, 68, 68, 0.25)',
            border: '2px solid var(--crimson-imposter)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--crimson-imposter)',
          }}>
            <AlertOctagon size={32} />
          </div>

          <div>
            <div style={{
              fontSize: '12px',
              color: 'var(--rose-accent)',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
            }}>
              🚨 EMERGENCY COUNCIL IN SESSION
            </div>
            <h2 style={{ fontSize: '28px', color: '#fff', margin: '2px 0' }}>
              Vote to Eject the Imposter
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
              Analyze all clues given in discussion. Vote for who you believe is faking!
            </p>
          </div>
        </div>

        {/* Voting Countdown */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          background: 'rgba(0, 0, 0, 0.6)',
          border: '1px solid var(--rose-accent)',
          padding: '10px 20px',
          borderRadius: 'var(--radius-full)',
        }}>
          <Clock size={20} color="var(--rose-accent)" />
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '22px',
            fontWeight: 800,
            color: 'var(--rose-accent)',
          }}>
            {voteTimer}s
          </span>
        </div>
      </div>

      {/* Suspect Dossier Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '18px',
      }}>
        {players.map((p) => {
          const isMe = p.id === currentPlayerId;
          const isSelected = selectedTargetId === p.id;
          const playerClues = clues.filter((c) => c.playerId === p.id);

          return (
            <div
              key={p.id}
              onClick={() => !isMe && handleSelect(p.id)}
              style={{
                background: isSelected
                  ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.22) 0%, rgba(15, 23, 42, 0.95) 100%)'
                  : 'rgba(15, 23, 42, 0.8)',
                border: isSelected
                  ? '2px solid var(--rose-accent)'
                  : isMe
                  ? '1px solid rgba(255, 255, 255, 0.1)'
                  : '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
                cursor: isMe || hasVoted ? 'default' : 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: isSelected ? '0 0 25px rgba(239, 68, 68, 0.35)' : 'none',
                opacity: isMe ? 0.75 : 1,
              }}
            >
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    background: 'rgba(0,0,0,0.5)',
                    border: `2px solid ${p.color}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '22px',
                  }}>
                    {p.avatar}
                  </div>

                  <div>
                    <div style={{ fontWeight: 800, color: '#fff', fontSize: '16px' }}>
                      {p.name} {isMe && '(You)'}
                    </div>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      {p.isBot ? '🤖 AI Operative' : '👤 Human Player'}
                    </span>
                  </div>
                </div>

                {isSelected && (
                  <div style={{
                    background: 'var(--rose-accent)',
                    color: '#fff',
                    borderRadius: '50%',
                    padding: '4px',
                    display: 'flex',
                  }}>
                    <CheckCircle2 size={18} />
                  </div>
                )}
              </div>

              {/* Player's Transmitted Clues History */}
              <div style={{
                background: 'rgba(0, 0, 0, 0.4)',
                borderRadius: 'var(--radius-sm)',
                padding: '12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                minHeight: '80px',
              }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                  Submitted Clues:
                </div>
                {playerClues.length === 0 ? (
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                    No clues transmitted.
                  </span>
                ) : (
                  playerClues.map((c) => (
                    <div key={c.id} style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                      • "{c.clue}"
                    </div>
                  ))
                )}
              </div>

              {/* Action Button */}
              {!isMe && (
                <button
                  type="button"
                  disabled={hasVoted}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: 'var(--radius-sm)',
                    border: isSelected ? 'none' : '1px solid rgba(239, 68, 68, 0.4)',
                    background: isSelected ? 'var(--rose-accent)' : 'rgba(239, 68, 68, 0.1)',
                    color: isSelected ? '#fff' : 'var(--rose-accent)',
                    fontFamily: 'var(--font-heading)',
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: hasVoted ? 'default' : 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {isSelected ? 'TARGET SELECTED' : 'VOTE AS IMPOSTER'}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Skip Vote Option & Lock In Action */}
      <div className="glass-panel" style={{
        padding: '20px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        background: 'rgba(15, 23, 42, 0.9)',
      }}>
        {/* Skip option */}
        <button
          type="button"
          disabled={hasVoted}
          onClick={() => handleSelect('skip')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 20px',
            borderRadius: 'var(--radius-md)',
            background: selectedTargetId === 'skip' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.05)',
            border: selectedTargetId === 'skip' ? '2px solid #fff' : '1px solid var(--border-subtle)',
            color: '#fff',
            fontFamily: 'var(--font-heading)',
            fontWeight: 700,
            cursor: hasVoted ? 'default' : 'pointer',
          }}
        >
          <SkipForward size={16} />
          <span>Skip Vote (Inconclusive)</span>
        </button>

        {/* Lock in vote */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {hasVoted ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: 'var(--emerald-accent)',
              fontWeight: 700,
              fontSize: '15px',
            }}>
              <CheckCircle2 size={20} />
              <span>Vote Locked In! Awaiting council...</span>
            </div>
          ) : (
            <button
              type="button"
              disabled={!selectedTargetId}
              onClick={handleConfirmVote}
              className="btn-danger"
              style={{
                padding: '14px 32px',
                fontSize: '16px',
                opacity: selectedTargetId ? 1 : 0.5,
                cursor: selectedTargetId ? 'pointer' : 'not-allowed',
              }}
            >
              <Vote size={18} />
              <span>Confirm & Cast Vote</span>
            </button>
          )}

          {/* Quick skip button to proceed */}
          <button
            type="button"
            onClick={onVotesComplete}
            className="btn-secondary"
            style={{ padding: '14px 20px', fontSize: '14px' }}
          >
            <span>Tally Votes Now</span>
          </button>
        </div>
      </div>
    </div>
  );
};
