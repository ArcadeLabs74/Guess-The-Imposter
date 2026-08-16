import React, { useState, useEffect } from 'react';
import type { Player, ClueItem, WordData, GameSettings } from '../types/game';
import { Send, Sparkles, Clock, AlertTriangle, Eye, EyeOff, Bot } from 'lucide-react';
import { soundManager } from '../services/soundService';
import { GeminiService } from '../services/geminiService';

interface ClueDiscussionScreenProps {
  players: Player[];
  currentPlayerId: string;
  wordData: WordData;
  settings: GameSettings;
  clues: ClueItem[];
  currentRound: number;
  currentTurnIndex: number;
  onAddClue: (clueText: string) => void;
  onAddReaction: (clueId: string, emoji: string) => void;
  onProceedToVoting: () => void;
}

const REACTION_EMOJIS = ['🤔', '🎯', '🤯', '🕵️', '🤫', '🔥'];

export const ClueDiscussionScreen: React.FC<ClueDiscussionScreenProps> = ({
  players,
  currentPlayerId,
  wordData,
  settings,
  clues,
  currentRound,
  currentTurnIndex,
  onAddClue,
  onAddReaction,
  onProceedToVoting,
}) => {
  const [inputClue, setInputClue] = useState('');
  const [showSecretDrawer, setShowSecretDrawer] = useState(false);
  const [isAiSuggesting, setIsAiSuggesting] = useState(false);
  const [timerRemaining, setTimerRemaining] = useState(settings.turnTimerSeconds || 45);

  const currentPlayer = players.find((p) => p.id === currentPlayerId);
  const isImposter = currentPlayer?.role === 'imposter';
  const activePlayer = players[currentTurnIndex] || players[0];
  const isMyTurn = activePlayer?.id === currentPlayerId;
  const isHost = currentPlayer?.isHost ?? false;

  // Turn Timer countdown
  useEffect(() => {
    if (settings.turnTimerSeconds <= 0) return;
    setTimerRemaining(settings.turnTimerSeconds);

    const interval = setInterval(() => {
      setTimerRemaining((prev) => {
        if (prev <= 5 && prev > 1) {
          soundManager.playTick();
        }
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [currentTurnIndex, currentRound, settings.turnTimerSeconds]);

  // Handle AI Bot Turn Auto-submission
  useEffect(() => {
    if (activePlayer?.isBot && !activePlayer.hasSubmittedClue) {
      const botTimer = setTimeout(async () => {
        const previousTexts = clues.map((c) => c.clue);
        const botClue = await GeminiService.generateBotClue(
          activePlayer.name,
          activePlayer.role,
          wordData.secretWord,
          wordData.category,
          wordData.imposterHint,
          previousTexts,
          settings.geminiApiKey
        );
        onAddClue(botClue);
        soundManager.playPop();
      }, 2200); // realistic delay for typing feeling

      return () => clearTimeout(botTimer);
    }
  }, [activePlayer, clues, wordData, settings.geminiApiKey, onAddClue]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputClue.trim() || !isMyTurn) return;
    soundManager.playPop();
    onAddClue(inputClue.trim());
    setInputClue('');
  };

  const handleAiSuggest = async () => {
    setIsAiSuggesting(true);
    soundManager.playClick();
    const prev = clues.map((c) => c.clue);
    const suggestion = await GeminiService.generateBotClue(
      currentPlayer?.name || 'Player',
      currentPlayer?.role || 'crew',
      wordData.secretWord,
      wordData.category,
      wordData.imposterHint,
      prev,
      settings.geminiApiKey
    );
    setInputClue(suggestion);
    setIsAiSuggesting(false);
  };

  return (
    <div style={{
      maxWidth: '1000px',
      margin: '0 auto',
      padding: '20px 20px 60px',
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
    }} className="animate-scale-up">
      {/* Top Status & Controls Bar */}
      <div className="glass-panel" style={{
        padding: '18px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        background: 'rgba(15, 23, 42, 0.85)',
      }}>
        {/* Round info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            background: 'rgba(6, 182, 212, 0.15)',
            border: '1px solid var(--cyan-accent)',
            borderRadius: 'var(--radius-md)',
            padding: '8px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <span style={{ fontSize: '12px', color: 'var(--cyan-accent)', fontWeight: 800, textTransform: 'uppercase' }}>
              Round
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '18px', fontWeight: 800, color: '#fff' }}>
              {currentRound} / {settings.roundCount}
            </span>
          </div>

          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
              Category
            </div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: '#fff' }}>
              {wordData.category}
            </div>
          </div>
        </div>

        {/* Turn Timer */}
        {settings.turnTimerSeconds > 0 && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: timerRemaining <= 10 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(0, 0, 0, 0.4)',
            border: timerRemaining <= 10 ? '1px solid var(--rose-accent)' : '1px solid var(--border-subtle)',
            padding: '8px 16px',
            borderRadius: 'var(--radius-full)',
          }}>
            <Clock size={16} color={timerRemaining <= 10 ? '#f43f5e' : '#38bdf8'} />
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '16px',
              fontWeight: 700,
              color: timerRemaining <= 10 ? '#f43f5e' : '#fff',
            }}>
              {timerRemaining}s
            </span>
          </div>
        )}

        {/* Secret Word Quick Peek Drawer Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => {
              soundManager.playClick();
              setShowSecretDrawer(!showSecretDrawer);
            }}
            className="btn-secondary"
            style={{ padding: '8px 14px', fontSize: '13px', borderColor: isImposter ? 'rgba(239, 68, 68, 0.4)' : 'rgba(6, 182, 212, 0.4)' }}
          >
            {showSecretDrawer ? <EyeOff size={15} /> : <Eye size={15} />}
            <span>{showSecretDrawer ? 'Hide Secret' : 'Peek Secret Word / Role'}</span>
          </button>

          {isHost && (
            <button
              onClick={() => {
                soundManager.playEmergency();
                onProceedToVoting();
              }}
              className="btn-danger"
              style={{ padding: '8px 16px', fontSize: '13px' }}
            >
              <AlertTriangle size={15} />
              <span>Call Vote</span>
            </button>
          )}
        </div>
      </div>

      {/* Secret Peek Drawer Content */}
      {showSecretDrawer && (
        <div className="glass-panel" style={{
          padding: '16px 20px',
          background: isImposter ? 'rgba(239, 68, 68, 0.12)' : 'rgba(6, 182, 212, 0.12)',
          border: isImposter ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid rgba(6, 182, 212, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}>
          <div>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: 800, color: isImposter ? 'var(--rose-accent)' : 'var(--cyan-accent)' }}>
              {isImposter ? 'Your Imposter Single Clue' : 'Your Secret Word (Crewmate)'}
            </div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#fff', marginTop: '2px' }}>
              {isImposter ? `"${wordData.imposterHint}"` : wordData.secretWord}
            </div>
          </div>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Category: <strong>{wordData.category}</strong>
          </span>
        </div>
      )}

      {/* Turn Spotlight Banner */}
      <div className="glass-panel" style={{
        padding: '20px 24px',
        background: isMyTurn
          ? 'linear-gradient(135deg, rgba(6, 182, 212, 0.2) 0%, rgba(15, 23, 42, 0.9) 100%)'
          : 'linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.6) 100%)',
        border: isMyTurn ? '2px solid var(--cyan-accent)' : '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        boxShadow: isMyTurn ? '0 0 25px rgba(6, 182, 212, 0.25)' : 'none',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: '14px',
            background: 'rgba(0,0,0,0.5)',
            border: `2px solid ${activePlayer.color}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '26px',
          }}>
            {activePlayer.avatar}
          </div>

          <div>
            <div style={{
              fontSize: '12px',
              color: isMyTurn ? 'var(--cyan-accent)' : 'var(--text-secondary)',
              textTransform: 'uppercase',
              fontWeight: 800,
              letterSpacing: '0.06em',
            }}>
              {isMyTurn ? '⚡ IT IS YOUR TURN!' : 'ACTIVE SPEAKER'}
            </div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#fff' }}>
              {activePlayer.name} {isMyTurn && '(You)'}
            </div>
          </div>
        </div>

        <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
          {activePlayer.isBot ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Bot size={16} className="animate-float" />
              <span>AI Agent is formulating clue...</span>
            </span>
          ) : isMyTurn ? (
            <span style={{ color: 'var(--cyan-accent)', fontWeight: 600 }}>
              Submit a subtle 1-sentence clue below!
            </span>
          ) : (
            <span>Waiting for operative to speak...</span>
          )}
        </div>
      </div>

      {/* Clues Timeline Feed */}
      <div className="glass-panel" style={{
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        minHeight: '320px',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--border-subtle)',
          paddingBottom: '12px',
        }}>
          <h3 style={{ fontSize: '18px', color: '#fff' }}>
            Operative Clue Transmissions
          </h3>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            {clues.length} {clues.length === 1 ? 'Clue recorded' : 'Clues recorded'}
          </span>
        </div>

        {clues.length === 0 ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px 20px',
            color: 'var(--text-muted)',
            textAlign: 'center',
            gap: '10px',
          }}>
            <div style={{ fontSize: '32px' }}>💬</div>
            <div style={{ fontWeight: 600 }}>No clues submitted yet this round.</div>
            <div style={{ fontSize: '13px' }}>The active speaker will transmit their clue shortly!</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {clues.map((item) => (
              <div
                key={item.id}
                style={{
                  background: 'rgba(0, 0, 0, 0.45)',
                  border: `1px solid ${item.playerColor}40`,
                  borderLeft: `4px solid ${item.playerColor}`,
                  borderRadius: 'var(--radius-md)',
                  padding: '16px 20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  transition: 'all 0.2s ease',
                }}
              >
                {/* Clue Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '20px' }}>{item.playerAvatar}</span>
                    <span style={{ fontWeight: 700, color: '#fff', fontSize: '15px' }}>
                      {item.playerName}
                    </span>
                    {item.isBot && (
                      <span className="badge-tag" style={{ background: 'rgba(139, 92, 246, 0.2)', color: '#a78bfa', fontSize: '10px' }}>
                        AI Bot
                      </span>
                    )}
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginLeft: '4px' }}>
                      Round {item.round}
                    </span>
                  </div>

                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>

                {/* Clue Text */}
                <div style={{
                  fontSize: '16px',
                  color: 'var(--text-primary)',
                  lineHeight: '1.5',
                  padding: '4px 0',
                }}>
                  "{item.clue}"
                </div>

                {/* Interactive Reaction Chips */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  flexWrap: 'wrap',
                  paddingTop: '6px',
                  borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                }}>
                  {REACTION_EMOJIS.map((emoji) => {
                    const count = item.reactions[emoji] || 0;
                    return (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => {
                          soundManager.playPop();
                          onAddReaction(item.id, emoji);
                        }}
                        style={{
                          background: count > 0 ? 'rgba(6, 182, 212, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                          border: count > 0 ? '1px solid rgba(6, 182, 212, 0.4)' : '1px solid var(--border-subtle)',
                          borderRadius: 'var(--radius-full)',
                          padding: '4px 10px',
                          fontSize: '13px',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          color: '#fff',
                          transition: 'transform 0.1s ease',
                        }}
                        title={`React with ${emoji}`}
                      >
                        <span>{emoji}</span>
                        {count > 0 && (
                          <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--cyan-accent)' }}>
                            {count}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Input Clue Bar */}
      <form onSubmit={handleSubmit} className="glass-panel" style={{
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        background: isMyTurn ? 'rgba(15, 23, 42, 0.95)' : 'rgba(15, 23, 42, 0.5)',
        opacity: isMyTurn ? 1 : 0.6,
      }}>
        <input
          type="text"
          placeholder={
            isMyTurn
              ? isImposter
                ? 'Type your bluff clue based on your hint...'
                : 'Type a subtle clue without saying the secret word...'
              : 'Wait for your turn to transmit clue...'
          }
          value={inputClue}
          onChange={(e) => setInputClue(e.target.value)}
          disabled={!isMyTurn}
          maxLength={120}
          style={{
            flex: 1,
            padding: '12px 18px',
            background: 'rgba(0, 0, 0, 0.5)',
            border: '1px solid var(--border-bright)',
            borderRadius: 'var(--radius-md)',
            color: '#fff',
            fontSize: '15px',
            outline: 'none',
          }}
        />

        {/* AI Clue Idea Helper */}
        {isMyTurn && (
          <button
            type="button"
            onClick={handleAiSuggest}
            disabled={isAiSuggesting}
            className="btn-secondary"
            style={{ padding: '12px 16px', fontSize: '13px' }}
            title="Ask Gemini for a clue idea"
          >
            <Sparkles size={16} color="var(--cyan-accent)" />
            <span>{isAiSuggesting ? 'Thinking...' : 'AI Idea'}</span>
          </button>
        )}

        <button
          type="submit"
          disabled={!isMyTurn || !inputClue.trim()}
          className="btn-primary"
          style={{
            padding: '12px 24px',
            opacity: isMyTurn && inputClue.trim() ? 1 : 0.5,
            cursor: isMyTurn && inputClue.trim() ? 'pointer' : 'not-allowed',
          }}
        >
          <Send size={16} />
          <span>Transmit</span>
        </button>
      </form>
    </div>
  );
};
