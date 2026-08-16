import React, { useState } from 'react';
import { Sparkles, Users, UserPlus, Play, Zap } from 'lucide-react';
import { CATEGORY_OPTIONS, AVATAR_OPTIONS, COLOR_PALETTE } from '../data/presetWords';
import type { GameSettings } from '../types/game';
import { soundManager } from '../services/soundService';

interface HomeScreenProps {
  onCreateRoom: (playerName: string, avatar: string, color: string, settings: GameSettings) => void;
  onJoinRoom: (roomCode: string, playerName: string, avatar: string, color: string) => void;
  onQuickPlay: (playerName: string, avatar: string, color: string) => void;
  onOpenHowToPlay: () => void;
  onOpenGeminiSettings: () => void;
  hasGeminiKey: boolean;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onCreateRoom,
  onJoinRoom,
  onQuickPlay,
  hasGeminiKey,
}) => {
  const [activeTab, setActiveTab] = useState<'create' | 'join' | 'quick'>('create');
  
  // Player profile state
  const [playerName, setPlayerName] = useState('Agent Alpha');
  const [avatar, setAvatar] = useState('🕵️');
  const [color, setColor] = useState('#06b6d4');

  // Join state
  const [joinCode, setJoinCode] = useState('');

  // Host Game Settings state
  const [imposterCount, setImposterCount] = useState(1);
  const [roundCount, setRoundCount] = useState(2);
  const [turnTimerSeconds] = useState(45);
  const [category, setCategory] = useState('random');
  const [customCategoryPrompt, setCustomCategoryPrompt] = useState('');
  const [botCount, setBotCount] = useState(3);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim()) return;
    soundManager.playClick();
    onCreateRoom(playerName.trim(), avatar, color, {
      imposterCount,
      roundCount,
      turnTimerSeconds,
      category,
      customCategoryPrompt,
      geminiApiKey: '',
      useGeminiApi: hasGeminiKey,
      botCount,
    });
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim() || !joinCode.trim()) return;
    soundManager.playClick();
    onJoinRoom(joinCode.trim().toUpperCase(), playerName.trim(), avatar, color);
  };

  const handleQuickSolo = () => {
    if (!playerName.trim()) return;
    soundManager.playClick();
    onQuickPlay(playerName.trim(), avatar, color);
  };

  return (
    <div style={{
      maxWidth: '1100px',
      margin: '0 auto',
      padding: '32px 20px 60px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '40px',
    }}>
      {/* Hero Section */}
      <div style={{ textAlign: 'center', maxWidth: '780px', marginTop: '10px' }} className="animate-scale-up">
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 16px',
          background: 'rgba(6, 182, 212, 0.12)',
          border: '1px solid rgba(6, 182, 212, 0.35)',
          borderRadius: 'var(--radius-full)',
          color: 'var(--cyan-accent)',
          fontSize: '13px',
          fontWeight: 600,
          marginBottom: '20px',
          letterSpacing: '0.04em',
        }}>
          <Sparkles size={16} />
          <span>POWERED BY GEMINI AI • SOCIAL DEDUCTION GAME</span>
        </div>

        <h1 style={{
          fontSize: 'clamp(36px, 6vw, 64px)',
          lineHeight: '1.05',
          fontWeight: 900,
          background: 'linear-gradient(135deg, #ffffff 30%, #38bdf8 70%, #818cf8 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '16px',
          textTransform: 'uppercase',
          letterSpacing: '-0.03em',
        }}>
          Guess The Imposter
        </h1>

        <p style={{
          fontSize: '18px',
          color: 'var(--text-secondary)',
          lineHeight: '1.6',
          maxWidth: '640px',
          margin: '0 auto',
        }}>
          Crewmates share subtle clues to prove they know the Secret Word.
          The Imposter only receives a single cryptic hint and must blend in without getting exposed!
        </p>
      </div>

      {/* Main Interaction Card */}
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '820px',
        padding: '32px',
        background: 'rgba(15, 23, 42, 0.75)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)',
      }}>
        {/* Navigation Tabs */}
        <div style={{
          display: 'flex',
          background: 'rgba(0, 0, 0, 0.35)',
          padding: '6px',
          borderRadius: 'var(--radius-md)',
          marginBottom: '28px',
          gap: '6px',
        }}>
          <button
            type="button"
            onClick={() => { soundManager.playClick(); setActiveTab('create'); }}
            style={{
              flex: 1,
              padding: '12px 16px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: activeTab === 'create' ? 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)' : 'transparent',
              color: activeTab === 'create' ? '#fff' : 'var(--text-secondary)',
              fontFamily: 'var(--font-heading)',
              fontWeight: 700,
              fontSize: '15px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s ease',
            }}
          >
            <UserPlus size={18} />
            <span>Create Room</span>
          </button>

          <button
            type="button"
            onClick={() => { soundManager.playClick(); setActiveTab('join'); }}
            style={{
              flex: 1,
              padding: '12px 16px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: activeTab === 'join' ? 'linear-gradient(135deg, #8b5cf6 0%, #d946ef 100%)' : 'transparent',
              color: activeTab === 'join' ? '#fff' : 'var(--text-secondary)',
              fontFamily: 'var(--font-heading)',
              fontWeight: 700,
              fontSize: '15px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s ease',
            }}
          >
            <Users size={18} />
            <span>Join Room</span>
          </button>

          <button
            type="button"
            onClick={() => { soundManager.playClick(); setActiveTab('quick'); }}
            style={{
              flex: 1,
              padding: '12px 16px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: activeTab === 'quick' ? 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)' : 'transparent',
              color: activeTab === 'quick' ? '#fff' : 'var(--text-secondary)',
              fontFamily: 'var(--font-heading)',
              fontWeight: 700,
              fontSize: '15px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s ease',
            }}
          >
            <Zap size={18} />
            <span>Solo AI Match</span>
          </button>
        </div>

        {/* Player Identity Selector */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '20px',
          marginBottom: '28px',
        }}>
          <label style={{
            display: 'block',
            fontSize: '13px',
            textTransform: 'uppercase',
            fontWeight: 700,
            letterSpacing: '0.06em',
            color: 'var(--text-secondary)',
            marginBottom: '12px',
          }}>
            Your Operative Profile
          </label>

          <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '20px', alignItems: 'center' }}>
            <div style={{
              width: '68px',
              height: '68px',
              borderRadius: '16px',
              backgroundColor: 'rgba(0,0,0,0.4)',
              border: `2px solid ${color}`,
              boxShadow: `0 0 20px ${color}40`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '34px',
              userSelect: 'none',
            }}>
              {avatar}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <input
                type="text"
                placeholder="Enter Operative Codename..."
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                maxLength={20}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: 'rgba(0, 0, 0, 0.5)',
                  border: '1px solid var(--border-bright)',
                  borderRadius: 'var(--radius-sm)',
                  color: '#fff',
                  fontSize: '16px',
                  fontFamily: 'var(--font-sans)',
                  outline: 'none',
                }}
              />

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Avatar:</span>
                {AVATAR_OPTIONS.slice(0, 8).map((av) => (
                  <button
                    key={av}
                    type="button"
                    onClick={() => { soundManager.playClick(); setAvatar(av); }}
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      border: avatar === av ? '2px solid var(--cyan-accent)' : '1px solid var(--border-subtle)',
                      background: avatar === av ? 'rgba(6, 182, 212, 0.2)' : 'rgba(0,0,0,0.3)',
                      cursor: 'pointer',
                      fontSize: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {av}
                  </button>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Color:</span>
                {COLOR_PALETTE.slice(0, 7).map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => { soundManager.playClick(); setColor(c); }}
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      backgroundColor: c,
                      border: color === c ? '2px solid #ffffff' : 'none',
                      cursor: 'pointer',
                      boxShadow: color === c ? `0 0 10px ${c}` : 'none',
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* TAB 1: CREATE ROOM */}
        {activeTab === 'create' && (
          <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '16px',
            }}>
              <div style={{
                background: 'rgba(0,0,0,0.3)',
                padding: '16px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Imposters</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--rose-accent)' }}>
                    {imposterCount} {imposterCount === 1 ? 'Imposter' : 'Imposters'}
                  </span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={3}
                  value={imposterCount}
                  onChange={(e) => setImposterCount(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--rose-accent)' }}
                />
              </div>

              <div style={{
                background: 'rgba(0,0,0,0.3)',
                padding: '16px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Discussion Rounds</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--cyan-accent)' }}>
                    {roundCount} {roundCount === 1 ? 'Round' : 'Rounds'}
                  </span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={3}
                  value={roundCount}
                  onChange={(e) => setRoundCount(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--cyan-accent)' }}
                />
              </div>

              <div style={{
                background: 'rgba(0,0,0,0.3)',
                padding: '16px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>AI Bot Players</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--amber-accent)' }}>
                    {botCount} Bots
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={6}
                  value={botCount}
                  onChange={(e) => setBotCount(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--amber-accent)' }}
                />
              </div>
            </div>

            {/* Category Selection */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '13px',
                textTransform: 'uppercase',
                fontWeight: 700,
                letterSpacing: '0.06em',
                color: 'var(--text-secondary)',
                marginBottom: '12px',
              }}>
                Select Category Theme
              </label>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                gap: '10px',
                maxHeight: '220px',
                overflowY: 'auto',
                paddingRight: '4px',
              }}>
                {CATEGORY_OPTIONS.map((cat) => (
                  <div
                    key={cat.id}
                    onClick={() => { soundManager.playClick(); setCategory(cat.id); }}
                    style={{
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-sm)',
                      background: category === cat.id ? 'rgba(6, 182, 212, 0.15)' : 'rgba(0,0,0,0.35)',
                      border: category === cat.id ? '1px solid var(--cyan-accent)' : '1px solid var(--border-subtle)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <span style={{ fontSize: '20px' }}>{cat.icon}</span>
                    <div style={{ overflow: 'hidden' }}>
                      <div style={{ fontSize: '13px', fontWeight: 600, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                        {cat.name}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {category === 'custom' && (
                <div style={{ marginTop: '12px' }}>
                  <input
                    type="text"
                    placeholder="E.g., 90s Anime Characters, Cyberpunk Inventions, Detective Novels..."
                    value={customCategoryPrompt}
                    onChange={(e) => setCustomCategoryPrompt(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      background: 'rgba(0,0,0,0.5)',
                      border: '1px solid var(--border-bright)',
                      borderRadius: 'var(--radius-sm)',
                      color: '#fff',
                      fontSize: '14px',
                      outline: 'none',
                    }}
                  />
                </div>
              )}
            </div>

            <button type="submit" className="btn-primary" style={{ padding: '16px', fontSize: '17px', width: '100%' }}>
              <Play size={20} fill="#ffffff" />
              <span>Initialize Room Lobby</span>
            </button>
          </form>
        )}

        {/* TAB 2: JOIN ROOM */}
        {activeTab === 'join' && (
          <form onSubmit={handleJoin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '13px',
                textTransform: 'uppercase',
                fontWeight: 700,
                letterSpacing: '0.06em',
                color: 'var(--text-secondary)',
                marginBottom: '10px',
              }}>
                Enter 6-Digit Room Code
              </label>
              <input
                type="text"
                placeholder="e.g. CYBER-99 or NEON-42"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                maxLength={10}
                style={{
                  width: '100%',
                  padding: '16px',
                  background: 'rgba(0, 0, 0, 0.5)',
                  border: '2px solid rgba(139, 92, 246, 0.4)',
                  borderRadius: 'var(--radius-md)',
                  color: '#fff',
                  fontSize: '22px',
                  fontFamily: 'var(--font-mono)',
                  letterSpacing: '0.15em',
                  textAlign: 'center',
                  textTransform: 'uppercase',
                  outline: 'none',
                }}
              />
            </div>

            <button type="submit" className="btn-primary" style={{
              background: 'linear-gradient(135deg, #8b5cf6 0%, #d946ef 100%)',
              padding: '16px',
              fontSize: '17px',
              width: '100%',
            }}>
              <Users size={20} />
              <span>Enter Room & Connect</span>
            </button>
          </form>
        )}

        {/* TAB 3: QUICK SOLO PLAY */}
        {activeTab === 'quick' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', textAlign: 'center' }}>
            <div style={{
              background: 'rgba(245, 158, 11, 0.1)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              borderRadius: 'var(--radius-md)',
              padding: '20px',
            }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>⚡</div>
              <h3 style={{ color: 'var(--amber-accent)', marginBottom: '8px' }}>Instant Solo Simulation Match</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.6' }}>
                Jump straight into a 5-player test match with 4 AI bot agents (including 1 covert imposter) using Gemini AI word generation. Experience all game phases immediately!
              </p>
            </div>

            <button
              type="button"
              onClick={handleQuickSolo}
              className="btn-primary"
              style={{
                background: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
                padding: '16px',
                fontSize: '17px',
                width: '100%',
              }}
            >
              <Zap size={20} />
              <span>Launch Instant Solo Match</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
