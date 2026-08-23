import { VenetianMask, BookOpen, Volume2, VolumeX, Home, LogOut } from 'lucide-react';
import { useState } from 'react';
import { soundManager } from '../services/soundService';

interface SidebarProps {
  inGame: boolean;
  onOpenRules: () => void;
  onLeave: () => void;
}

export function Sidebar({ inGame, onOpenRules, onLeave }: SidebarProps) {
  const [muted, setMuted] = useState(() => {
    const saved = localStorage.getItem('imposter_muted') === '1';
    soundManager.setMuted(saved);
    return saved;
  });

  const toggleMute = () => {
    const next = soundManager.toggleMute();
    setMuted(next);
    localStorage.setItem('imposter_muted', next ? '1' : '0');
  };

  const handleLeave = () => {
    if (inGame && !window.confirm('Leave the current game?')) return;
    onLeave();
  };

  return (
    <aside className="side-rail">
      <button
        className="rail-logo"
        onClick={handleLeave}
        aria-label={inGame ? 'Leave game and go home' : 'Guess the Imposter'}
      >
        <VenetianMask size={22} strokeWidth={2.2} />
      </button>

      <span className="rail-sep" />

      <button
        className={`rail-btn ${!inGame ? 'active' : ''}`}
        onClick={handleLeave}
        aria-label="Home"
      >
        {inGame ? <LogOut size={19} /> : <Home size={19} />}
      </button>

      <button className="rail-btn" onClick={onOpenRules} aria-label="How to play">
        <BookOpen size={19} />
      </button>

      <button
        className="rail-btn"
        onClick={toggleMute}
        aria-label={muted ? 'Unmute sounds' : 'Mute sounds'}
      >
        {muted ? <VolumeX size={19} /> : <Volume2 size={19} />}
      </button>

      <span className="rail-spacer" />

      <span className="rail-avatar">GTI</span>
    </aside>
  );
}
