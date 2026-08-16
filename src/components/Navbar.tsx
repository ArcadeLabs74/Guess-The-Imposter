import React, { useState } from 'react';
import { Volume2, VolumeX, Sparkles, HelpCircle, Copy, Check, LogOut } from 'lucide-react';
import { soundManager } from '../services/soundService';
import type { GamePhase } from '../types/game';

interface NavbarProps {
  currentPhase: GamePhase;
  roomCode: string | null;
  onOpenHowToPlay: () => void;
  onOpenGeminiSettings: () => void;
  onLeaveRoom: () => void;
  hasGeminiKey: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPhase,
  roomCode,
  onOpenHowToPlay,
  onOpenGeminiSettings,
  onLeaveRoom,
  hasGeminiKey,
}) => {
  const [isMuted, setIsMuted] = useState(soundManager.getMuted());
  const [copied, setCopied] = useState(false);

  const handleToggleSound = () => {
    const next = soundManager.toggleMute();
    setIsMuted(next);
    if (!next) {
      soundManager.playClick();
    }
  };

  const handleCopyCode = () => {
    if (!roomCode) return;
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    soundManager.playPop();
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      background: 'rgba(10, 12, 20, 0.85)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border-subtle)',
      padding: '12px 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '16px',
      width: '100%',
    }}>
      {/* Brand */}
      <div 
        onClick={() => {
          if (currentPhase !== 'home') {
            soundManager.playClick();
            if (confirm('Return to home screen? Current game progress will be reset.')) {
              onLeaveRoom();
            }
          }
        }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          cursor: currentPhase !== 'home' ? 'pointer' : 'default',
        }}
      >
        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: '10px',
          background: 'linear-gradient(135deg, #06b6d4 0%, #8b5cf6 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '20px',
          boxShadow: '0 0 15px rgba(6, 182, 212, 0.4)',
        }}>
          🎭
        </div>
        <div>
          <div style={{
            fontFamily: 'var(--font-heading)',
            fontWeight: 800,
            fontSize: '18px',
            letterSpacing: '0.02em',
            background: 'linear-gradient(90deg, #ffffff 30%, #38bdf8 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            GUESS THE IMPOSTER
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600 }}>
            AI Social Deduction Game
          </div>
        </div>
      </div>

      {/* Room Code Badge (if active room) */}
      {roomCode && currentPhase !== 'home' && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid var(--border-bright)',
          borderRadius: 'var(--radius-full)',
          padding: '6px 14px',
        }}>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>
            Room:
          </span>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontWeight: 700,
            color: 'var(--cyan-accent)',
            letterSpacing: '0.08em',
          }}>
            {roomCode}
          </span>
          <button
            onClick={handleCopyCode}
            title="Copy room code"
            style={{
              background: 'transparent',
              border: 'none',
              color: copied ? 'var(--emerald-accent)' : 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              padding: '2px',
              transition: 'color 0.2s ease',
            }}
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
          </button>
        </div>
      )}

      {/* Action Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* Gemini AI Status / Settings */}
        <button
          onClick={() => {
            soundManager.playClick();
            onOpenGeminiSettings();
          }}
          className="btn-secondary"
          style={{
            padding: '7px 12px',
            fontSize: '13px',
            borderColor: hasGeminiKey ? 'rgba(6, 182, 212, 0.4)' : 'rgba(255, 255, 255, 0.1)',
            background: hasGeminiKey ? 'rgba(6, 182, 212, 0.12)' : 'rgba(255, 255, 255, 0.04)',
          }}
          title="Configure Gemini AI API"
        >
          <Sparkles size={15} color={hasGeminiKey ? '#06b6d4' : '#94a3b8'} />
          <span style={{ display: 'inline-block' }}>
            {hasGeminiKey ? 'Gemini AI' : 'AI Setup'}
          </span>
          <span style={{
            width: '7px',
            height: '7px',
            borderRadius: '50%',
            backgroundColor: hasGeminiKey ? '#10b981' : '#f59e0b',
            display: 'inline-block',
          }} />
        </button>

        {/* How to Play */}
        <button
          onClick={() => {
            soundManager.playClick();
            onOpenHowToPlay();
          }}
          className="btn-secondary"
          style={{ padding: '7px 12px', fontSize: '13px' }}
          title="Game Rules & Guide"
        >
          <HelpCircle size={15} />
          <span>Rules</span>
        </button>

        {/* Mute Toggle */}
        <button
          onClick={handleToggleSound}
          className="btn-secondary"
          style={{
            padding: '8px',
            color: isMuted ? 'var(--text-muted)' : 'var(--cyan-accent)',
          }}
          title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
        >
          {isMuted ? <VolumeX size={17} /> : <Volume2 size={17} />}
        </button>

        {/* Exit Room button */}
        {currentPhase !== 'home' && (
          <button
            onClick={() => {
              soundManager.playClick();
              if (confirm('Leave current game and return to home?')) {
                onLeaveRoom();
              }
            }}
            className="btn-secondary"
            style={{ padding: '8px', color: 'var(--rose-accent)', borderColor: 'rgba(244, 63, 94, 0.3)' }}
            title="Leave Game Room"
          >
            <LogOut size={16} />
          </button>
        )}
      </div>
    </header>
  );
};
