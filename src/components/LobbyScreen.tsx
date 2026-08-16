import React from 'react';
import type { Player, GameSettings } from '../types/game';
import { Crown, Bot, User, Play, Plus, Trash2, Clock, Sparkles, Copy, Check } from 'lucide-react';
import { soundManager } from '../services/soundService';
import { CATEGORY_OPTIONS } from '../data/presetWords';

interface LobbyScreenProps {
  roomCode: string;
  players: Player[];
  currentPlayerId: string;
  settings: GameSettings;
  onStartGame: () => void;
  onAddBot: () => void;
  onRemovePlayer: (id: string) => void;
  onToggleReady: () => void;
  onLeaveRoom: () => void;
}

export const LobbyScreen: React.FC<LobbyScreenProps> = ({
  roomCode,
  players,
  currentPlayerId,
  settings,
  onStartGame,
  onAddBot,
  onRemovePlayer,
  onLeaveRoom,
}) => {
  const [copied, setCopied] = React.useState(false);
  const currentPlayer = players.find((p) => p.id === currentPlayerId);
  const isHost = currentPlayer?.isHost ?? false;
  const canStart = players.length >= 3;

  const currentCategory = CATEGORY_OPTIONS.find((c) => c.id === settings.category) || {
    name: settings.category,
    icon: '✨',
    badgeColor: '#8b5cf6',
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    soundManager.playPop();
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{
      maxWidth: '1000px',
      margin: '0 auto',
      padding: '24px 20px 60px',
      display: 'flex',
      flexDirection: 'column',
      gap: '28px',
    }} className="animate-scale-up">
      {/* Header Banner with Room Code */}
      <div className="glass-panel" style={{
        padding: '28px',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '20px',
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.7) 100%)',
        border: '1px solid rgba(6, 182, 212, 0.3)',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
      }}>
        <div>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            color: 'var(--cyan-accent)',
            fontSize: '12px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            marginBottom: '6px',
          }}>
            <Sparkles size={14} />
            <span>Mission Briefing Chamber</span>
          </div>
          <h2 style={{ fontSize: '28px', color: '#fff', marginBottom: '4px' }}>
            Operative Lobby
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            Share room code with crewmates or add AI agents to begin.
          </p>
        </div>

        {/* Room Code Box */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          background: 'rgba(0, 0, 0, 0.5)',
          padding: '12px 20px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-bright)',
        }}>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
              Access Code
            </div>
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '24px',
              fontWeight: 800,
              color: 'var(--cyan-accent)',
              letterSpacing: '0.1em',
            }}>
              {roomCode}
            </div>
          </div>
          <button
            onClick={handleCopy}
            className="btn-secondary"
            style={{ padding: '10px 14px', fontSize: '13px' }}
          >
            {copied ? <Check size={16} color="#10b981" /> : <Copy size={16} />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {/* Game Config Highlights */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '14px',
      }}>
        <div className="glass-panel" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ fontSize: '26px' }}>{currentCategory.icon}</div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Category</div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: '#fff' }}>{currentCategory.name}</div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ fontSize: '26px' }}>🎭</div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Imposters</div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--rose-accent)' }}>
              {settings.imposterCount} {settings.imposterCount === 1 ? 'Imposter' : 'Imposters'}
            </div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ fontSize: '26px' }}>💬</div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Discussion Rounds</div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--cyan-accent)' }}>
              {settings.roundCount} Clue Rounds
            </div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ fontSize: '26px' }}>👥</div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Operatives</div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: '#fff' }}>
              {players.length} Players {players.length < 3 && <span style={{ color: 'var(--rose-accent)', fontSize: '12px' }}>(Min 3)</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Players Roster */}
      <div className="glass-panel" style={{ padding: '28px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '12px',
        }}>
          <div>
            <h3 style={{ fontSize: '20px', color: '#fff' }}>Connected Operatives</h3>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              {players.length} of 8 slots filled
            </span>
          </div>

          {isHost && (
            <button
              onClick={() => {
                soundManager.playClick();
                onAddBot();
              }}
              disabled={players.length >= 8}
              className="btn-secondary"
              style={{ padding: '8px 16px', fontSize: '13px', borderColor: 'rgba(6, 182, 212, 0.4)' }}
            >
              <Plus size={16} />
              <span>Add AI Bot</span>
            </button>
          )}
        </div>

        {/* Players Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: '16px',
        }}>
          {players.map((p) => {
            const isMe = p.id === currentPlayerId;
            return (
              <div
                key={p.id}
                style={{
                  background: 'rgba(0, 0, 0, 0.4)',
                  border: isMe ? '2px solid var(--cyan-accent)' : '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  position: 'relative',
                  boxShadow: isMe ? '0 0 15px rgba(6, 182, 212, 0.2)' : 'none',
                }}
              >
                {/* Avatar */}
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: 'rgba(0, 0, 0, 0.5)',
                  border: `2px solid ${p.color}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                  flexShrink: 0,
                }}>
                  {p.avatar}
                </div>

                {/* Info */}
                <div style={{ overflow: 'hidden', flex: 1 }}>
                  <div style={{
                    fontSize: '15px',
                    fontWeight: 700,
                    color: '#fff',
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}>
                    {p.name}
                    {isMe && <span style={{ fontSize: '11px', color: 'var(--cyan-accent)' }}>(You)</span>}
                  </div>

                  <div style={{ display: 'flex', gap: '6px', marginTop: '4px', flexWrap: 'wrap' }}>
                    {p.isHost && (
                      <span className="badge-tag" style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#f59e0b', fontSize: '10px' }}>
                        <Crown size={10} /> Host
                      </span>
                    )}
                    {p.isBot && (
                      <span className="badge-tag" style={{ background: 'rgba(139, 92, 246, 0.2)', color: '#a78bfa', fontSize: '10px' }}>
                        <Bot size={10} /> AI Agent
                      </span>
                    )}
                    {!p.isBot && !p.isHost && (
                      <span className="badge-tag" style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', fontSize: '10px' }}>
                        <User size={10} /> Player
                      </span>
                    )}
                  </div>
                </div>

                {/* Remove / Kick button for host */}
                {isHost && (p.isBot || !isMe) && (
                  <button
                    onClick={() => {
                      soundManager.playClick();
                      onRemovePlayer(p.id);
                    }}
                    title="Remove operative"
                    style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      padding: '4px',
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Control Actions */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
      }}>
        <button
          onClick={() => {
            soundManager.playClick();
            if (confirm('Leave lobby and return to home screen?')) {
              onLeaveRoom();
            }
          }}
          className="btn-secondary"
          style={{ padding: '14px 24px', color: 'var(--rose-accent)' }}
        >
          Leave Lobby
        </button>

        {isHost ? (
          <button
            onClick={() => {
              if (canStart) {
                soundManager.playClick();
                onStartGame();
              }
            }}
            disabled={!canStart}
            className="btn-primary"
            style={{
              padding: '16px 36px',
              fontSize: '18px',
              opacity: canStart ? 1 : 0.5,
              cursor: canStart ? 'pointer' : 'not-allowed',
            }}
          >
            <Play size={20} fill="#ffffff" />
            <span>Launch Mission ({players.length}/3 Min)</span>
          </button>
        ) : (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            color: 'var(--text-secondary)',
            fontFamily: 'var(--font-heading)',
            fontSize: '15px',
          }}>
            <Clock size={18} className="animate-float" />
            <span>Waiting for Host to launch mission...</span>
          </div>
        )}
      </div>
    </div>
  );
};
