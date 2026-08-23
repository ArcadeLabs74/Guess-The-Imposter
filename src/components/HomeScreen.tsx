import { useEffect, useRef, useState } from 'react';
import {
  Play,
  Plus,
  Trash2,
  Users,
  Layers,
  Zap,
  BookOpen,
  ArrowUpRight,
  VenetianMask,
  Smartphone,
  Globe,
  Copy,
  Check,
  Radio,
  Share2,
  UserPlus,
  LogIn,
} from 'lucide-react';
import type { GameSettings } from '../types/game';
import { CATEGORY_OPTIONS, PLAYER_COLORS } from '../data/presetWords';
import { animateHeroTitle, animateScreenIn, popIn } from '../lib/animations';
import { soundManager } from '../services/soundService';

interface HomeScreenProps {
  onStartGame: (names: string[], settings: GameSettings) => void;
  onOpenRules: () => void;
}

const MIN_PLAYERS = 3;
const MAX_PLAYERS = 12;

export function HomeScreen({ onStartGame, onOpenRules }: HomeScreenProps) {
  const heroRef = useRef<HTMLDivElement>(null);
  const setupRef = useRef<HTMLDivElement>(null);

  const [gameMode, setGameMode] = useState<'local' | 'online'>('local');
  const [onlineTab, setOnlineTab] = useState<'host' | 'join'>('host');
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [invitedFriends, setInvitedFriends] = useState(false);
  const [roomCode] = useState('GTI-8492');
  const [joinCode, setJoinCode] = useState('');
  const [joinName, setJoinName] = useState('');
  const [joinedSuccess, setJoinedSuccess] = useState(false);

  const [names, setNames] = useState(['', '', '', '']);
  const [settings, setSettings] = useState<GameSettings>({
    imposterCount: 1,
    roundCount: 2,
    category: 'random',
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlRoom = params.get('room');
      if (urlRoom) {
        setGameMode('online');
        setOnlineTab('join');
        setJoinCode(urlRoom.toUpperCase());
      }
    }
  }, []);

  const handleShareLink = async () => {
    soundManager.playClick();
    const shareUrl = `${window.location.origin}${window.location.pathname}?room=${roomCode}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join my Guess The Imposter Game!',
          text: `Join my Guess The Imposter room with code: ${roomCode}`,
          url: shareUrl,
        });
        return;
      } catch {
        // Fallback to clipboard
      }
    }
    navigator.clipboard?.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleInviteFriends = () => {
    soundManager.playClick();
    const inviteMessage = `🕵️‍♂️ Play Guess The Imposter with me!\n\nRoom Code: ${roomCode}\nDirect Link: ${window.location.origin}${window.location.pathname}?room=${roomCode}`;
    navigator.clipboard?.writeText(inviteMessage);
    setInvitedFriends(true);
    setTimeout(() => setInvitedFriends(false), 2500);
  };

  const handleJoinRoom = () => {
    if (!joinCode.trim()) return;
    soundManager.playClick();
    setJoinedSuccess(true);
    const newOperative = joinName.trim() || 'Agent Guest';
    if (!names.includes(newOperative)) {
      setNames((prev) => [...prev, newOperative]);
    }
    setTimeout(() => {
      setOnlineTab('host');
      setJoinedSuccess(false);
    }, 800);
  };

  useEffect(() => {
    animateHeroTitle(heroRef.current);
    animateScreenIn(setupRef.current);
  }, []);

  const prevCount = useRef(names.length);
  useEffect(() => {
    if (names.length > prevCount.current) {
      const el = document.getElementById(`player-row-${names.length - 1}`);
      if (el) popIn(el);
    }
    prevCount.current = names.length;
  }, [names.length]);

  const setCount = (n: number) => {
    soundManager.playClick();
    setNames((prev) => {
      if (n <= prev.length) return prev.slice(0, n);
      return [...prev, ...Array(n - prev.length).fill('')];
    });
  };

  const setName = (i: number, value: string) => {
    setNames((prev) => prev.map((n, idx) => (idx === i ? value : n)));
  };

  const finalNames = names.map((n, i) => n.trim() || `Player ${i + 1}`);
  const canStart = names.length >= MIN_PLAYERS;

  const start = () => {
    soundManager.playCardFlip();
    onStartGame(finalNames, settings);
  };

  return (
    <div className="bento-home-grid" ref={setupRef}>
      {/* 1. Left Vertical Brand Spine Card */}
      <aside className="brand-spine-card" data-anim>
        <div className="brand-spine-header">
          <span className="brand-spine-logo">
            <VenetianMask size={22} strokeWidth={2.4} />
          </span>
          <span className="brand-spine-ver">GTI // 01</span>
        </div>

        <h2 className="brand-spine-title">IMPOSTER</h2>

        <div className="brand-spine-footer">
          <span className="status-dot-live" />
          <span className="brand-spine-tag">PASS & PLAY</span>
        </div>
      </aside>

      {/* 2. Top Mission Card */}
      <section className="top-mission-card" data-anim ref={heroRef}>
        <div className="mission-top-row">
          <div>
            <h1 className="mission-headline hero-word">
              BLEND IN TECH.
              <br />
              READY FOR THE UNKNOWN.
            </h1>
            <div className="mission-subline">
              <Zap size={14} />
              <span>PASS & PLAY · 60S PER TURN · ZERO SETUP REQUIRED</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Hero Featured Card with Signature Inverted Corner Notch */}
      <section className="corner-notch-card hero-featured-card" data-anim>
        {/* The Signature Inverted Corner Notch Dock with Concave Fillets */}
        <div className="notch-dock">
          <button
            className="notch-arrow-btn"
            onClick={start}
            disabled={!canStart}
            aria-label="Start Game"
            title="Start Game Now"
          >
            <ArrowUpRight size={26} strokeWidth={2.4} />
          </button>
        </div>

        {/* Top-Left Inverted Concave Fillet */}
        <div className="notch-fillet-tl" aria-hidden="true">
          <svg viewBox="0 0 28 28" fill="none" className="fillet-svg">
            <path d="M 0 0 C 15.464 0 28 12.536 28 28 V 0 H 0 Z" fill="var(--parent-bg)" />
          </svg>
        </div>

        {/* Bottom-Right Inverted Concave Fillet for Top Notch */}
        <div className="notch-fillet-br" aria-hidden="true">
          <svg viewBox="0 0 28 28" fill="none" className="fillet-svg">
            <path d="M 0 0 C 15.464 0 28 12.536 28 28 V 0 H 0 Z" fill="var(--parent-bg)" />
          </svg>
        </div>

        {/* Bottom-Right Notch Dock for Separated Mode Buttons */}
        <div className="notch-dock-bottom">
          <div className="separated-mode-group">
            <button
              type="button"
              className={`separated-mode-btn ${gameMode === 'local' ? 'active' : ''}`}
              onClick={() => {
                soundManager.playClick();
                setGameMode('local');
              }}
            >
              <Smartphone size={13} strokeWidth={2.4} />
              <span>LOCAL</span>
            </button>
            <button
              type="button"
              className={`separated-mode-btn ${gameMode === 'online' ? 'active' : ''}`}
              onClick={() => {
                soundManager.playClick();
                setGameMode('online');
              }}
            >
              <Globe size={13} strokeWidth={2.4} />
              <span>ONLINE</span>
            </button>
          </div>
        </div>

        {/* Bottom-Left Fillet for Bottom Notch */}
        <div className="notch-fillet-bl" aria-hidden="true">
          <svg viewBox="0 0 28 28" fill="none" className="fillet-svg">
            <path d="M 28 0 C 28 15.464 15.464 28 0 28 H 28 V 0 Z" fill="var(--parent-bg)" />
          </svg>
        </div>

        {/* Top-Right Fillet for Bottom Notch */}
        <div className="notch-fillet-tr" aria-hidden="true">
          <svg viewBox="0 0 28 28" fill="none" className="fillet-svg">
            <path d="M 28 0 C 28 15.464 15.464 28 0 28 H 28 V 0 Z" fill="var(--parent-bg)" />
          </svg>
        </div>

        <div className="notch-card-content">
          <h2 className="hero-corner-title">
            BUILT FOR THE FIELD. TRUSTED IN THE ROOM. NEVER GET CAUGHT.
          </h2>

          <div className="hero-stat-row">
            <div>
              <span className="hero-stat-num">
                {String(settings.imposterCount).padStart(2, '0')}
              </span>
              <span className="hero-stat-unit">
                {settings.imposterCount === 1 ? 'IMPOSTER' : 'IMPOSTERS'}
              </span>
            </div>
          </div>

          <div className="hero-spec-bullets">
            <span>
              <span className="hero-spec-dot" /> {names.length} ACTIVE CREW
            </span>
            <span>
              <span className="hero-spec-dot" /> {settings.roundCount} CLUE ROUNDS
            </span>
            <span>
              <span className="hero-spec-dot" /> {gameMode === 'local' ? 'PASS & PLAY' : 'ONLINE LOBBY'}
            </span>
          </div>
        </div>
      </section>

      {/* 4. Manual / Protocol Bento Card */}
      <section className="bento-manual-card" data-anim>
        <div>
          <div className="manual-icon-stack">
            <BookOpen size={24} strokeWidth={2.2} />
          </div>
          <h3 className="manual-title">GAME MANUAL</h3>
          <p className="manual-desc">
            Everyone receives the secret coordinates except the undercover imposter.
            Drop subtle clues, read the room, and vote before they escape.
          </p>
          <div className="manual-spec-list">
            <div>• MODE: 100% OFFLINE PASS & PLAY</div>
            <div>• DETECT: EMERGENCY ROUND VOTE</div>
          </div>
        </div>

        <button
          className="btn btn-secondary btn-sm"
          style={{ alignSelf: 'flex-start', width: '100%' }}
          onClick={onOpenRules}
        >
          <BookOpen size={13} />
          EXPLORE RULES ↗
        </button>
      </section>

      {/* 5. Setup & Roster Module (Spans Columns) */}
      <section className="bento-setup-card" data-anim>
        {gameMode === 'online' ? (
          <div className="online-lobby-panel">
            {/* Online Tab Switcher: Host vs Join */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
              <div className="online-tab-switch">
                <button
                  type="button"
                  className={`online-tab-btn ${onlineTab === 'host' ? 'active' : ''}`}
                  onClick={() => {
                    soundManager.playClick();
                    setOnlineTab('host');
                  }}
                >
                  <Radio size={13} />
                  <span>HOST LOBBY</span>
                </button>
                <button
                  type="button"
                  className={`online-tab-btn ${onlineTab === 'join' ? 'active' : ''}`}
                  onClick={() => {
                    soundManager.playClick();
                    setOnlineTab('join');
                  }}
                >
                  <LogIn size={13} />
                  <span>ENTER ROOM CODE</span>
                </button>
              </div>

              {copiedLink && <span className="toast-feedback"><Check size={13} /> Invite Link Copied!</span>}
              {invitedFriends && <span className="toast-feedback"><Check size={13} /> Invite Message Copied!</span>}
            </div>

            {onlineTab === 'host' ? (
              <>
                <div className="online-code-banner">
                  <div>
                    <div className="section-label" style={{ marginBottom: 4 }}>
                      <Radio size={13} className="status-dot-live" />
                      YOUR ROOM CODE
                    </div>
                    <div className="online-room-code">{roomCode}</div>
                  </div>

                  <div className="online-actions-group">
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => {
                        navigator.clipboard?.writeText(roomCode);
                        setCopiedCode(true);
                        soundManager.playClick();
                        setTimeout(() => setCopiedCode(false), 2000);
                      }}
                    >
                      {copiedCode ? <Check size={14} color="var(--accent-strong)" /> : <Copy size={14} />}
                      {copiedCode ? 'COPIED' : 'COPY CODE'}
                    </button>

                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={handleShareLink}
                    >
                      <Share2 size={14} />
                      SHARE LINK
                    </button>

                    <button
                      type="button"
                      className="btn btn-sage btn-sm"
                      onClick={handleInviteFriends}
                    >
                      <UserPlus size={14} />
                      INVITE FRIENDS
                    </button>
                  </div>
                </div>

                <div className="section-label" style={{ marginTop: 8 }}>
                  <Users size={13} />
                  CONNECTED OPERATIVES ({names.length}/8)
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '10px' }}>
                  {finalNames.map((name, i) => (
                    <div
                      key={i}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '12px 16px',
                        background: 'var(--bg-elevated)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border)',
                      }}
                    >
                      <span className="status-dot-live" />
                      <span
                        className="player-dot"
                        style={{
                          width: 34,
                          height: 34,
                          fontSize: 13,
                          background: PLAYER_COLORS[i % PLAYER_COLORS.length],
                        }}
                      >
                        {name.charAt(0).toUpperCase()}
                      </span>
                      <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--ink)' }}>{name}</span>
                      <span style={{ marginLeft: 'auto', fontSize: 10.5, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                        {i === 0 ? 'HOST' : 'READY'}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div style={{ background: 'var(--bg-elevated)', padding: '22px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-strong)' }}>
                <div className="section-label" style={{ marginBottom: 12 }}>
                  <LogIn size={13} />
                  JOIN MULTIPLAYER ROOM
                </div>

                <div className="online-join-grid">
                  <div className="online-input-box">
                    <label>YOUR CODENAME</label>
                    <input
                      className="input"
                      value={joinName}
                      placeholder="e.g. Agent Phoenix"
                      maxLength={16}
                      onChange={(e) => setJoinName(e.target.value)}
                    />
                  </div>

                  <div className="online-input-box">
                    <label>ENTER ROOM CODE</label>
                    <input
                      className="input online-input-code"
                      value={joinCode}
                      placeholder="GTI-8492"
                      maxLength={10}
                      onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 12, marginTop: 18, alignItems: 'center', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    className="btn btn-primary"
                    disabled={!joinCode.trim()}
                    onClick={handleJoinRoom}
                  >
                    {joinedSuccess ? <Check size={16} /> : <LogIn size={16} />}
                    {joinedSuccess ? 'ROOM CONNECTED!' : 'CONNECT & JOIN LOBBY ↗'}
                  </button>

                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => {
                      setJoinCode('GTI-8492');
                      soundManager.playClick();
                    }}
                  >
                    Use Code: GTI-8492
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="setting-row">
              <div>
                <div className="section-label">
                  <Users size={13} />
                  Crew Roster · Pass Device
                </div>
                <div className="setting-desc">Set custom codenames or use default player tags.</div>
              </div>

              <div className="stepper">
                <button
                  onClick={() => setCount(Math.max(MIN_PLAYERS, names.length - 1))}
                  disabled={names.length <= MIN_PLAYERS}
                  aria-label="Remove player"
                >
                  −
                </button>
                <span className="stepper-value">{names.length}</span>
                <button
                  onClick={() => setCount(Math.min(MAX_PLAYERS, names.length + 1))}
                  disabled={names.length >= MAX_PLAYERS}
                  aria-label="Add player"
                >
                  +
                </button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '10px' }}>
              {names.map((name, i) => (
                <div className="player-row" key={i} id={`player-row-${i}`} style={{ marginBottom: 0 }}>
                  <span
                    className="player-dot"
                    style={{ background: PLAYER_COLORS[i % PLAYER_COLORS.length] }}
                  >
                    {finalNames[i].charAt(0).toUpperCase()}
                  </span>
                  <input
                    className="input"
                    value={name}
                    placeholder={`Player ${i + 1}`}
                    maxLength={16}
                    onChange={(e) => setName(i, e.target.value)}
                  />
                  <button
                    className="row-remove"
                    onClick={() => setCount(names.length - 1)}
                    disabled={names.length <= MIN_PLAYERS}
                    aria-label={`Remove player ${i + 1}`}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setCount(names.length + 1)}
                disabled={names.length >= MAX_PLAYERS}
              >
                <Plus size={14} />
                Add Crewmate
              </button>
            </div>
          </>
        )}

        <hr className="divider" />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
          <div className="setting-row">
            <div>
              <div className="setting-name">Imposters</div>
              <div className="setting-desc">Infiltrators among the crew</div>
            </div>
            <div className="stepper">
              <button
                onClick={() =>
                  setSettings({ ...settings, imposterCount: Math.max(1, settings.imposterCount - 1) })
                }
                disabled={settings.imposterCount <= 1}
                aria-label="Fewer imposters"
              >
                −
              </button>
              <span className="stepper-value">{settings.imposterCount}</span>
              <button
                onClick={() =>
                  setSettings({
                    ...settings,
                    imposterCount: Math.min(
                      Math.floor((names.length - 1) / 2),
                      settings.imposterCount + 1
                    ),
                  })
                }
                disabled={settings.imposterCount >= Math.floor((names.length - 1) / 2)}
                aria-label="More imposters"
              >
                +
              </button>
            </div>
          </div>

          <div className="setting-row">
            <div>
              <div className="setting-name">Clue Rounds</div>
              <div className="setting-desc">Passes per session</div>
            </div>
            <div className="segmented">
              {[1, 2, 3].map((r) => (
                <button
                  key={r}
                  className={settings.roundCount === r ? 'active' : ''}
                  onClick={() => {
                    soundManager.playClick();
                    setSettings({ ...settings, roundCount: r });
                  }}
                >
                  {r} {r === 1 ? 'Round' : 'Rounds'}
                </button>
              ))}
            </div>
          </div>
        </div>

        <hr className="divider" />

        <div>
          <div className="section-label" style={{ marginBottom: 12 }}>
            <Layers size={13} />
            Word Deck Selection
          </div>
          <div className="category-grid">
            {CATEGORY_OPTIONS.map((cat) => (
              <button
                key={cat.id}
                className={`category-chip ${settings.category === cat.id ? 'active' : ''}`}
                onClick={() => {
                  soundManager.playClick();
                  setSettings({ ...settings, category: cat.id });
                }}
              >
                <span className="cat-name">{cat.name}</span>
              </button>
            ))}
          </div>
        </div>

        <hr className="divider" />

        <button
          className="btn btn-primary btn-block btn-lg"
          onClick={start}
          disabled={!canStart}
        >
          <Play size={17} strokeWidth={2.6} />
          Launch Session with {names.length} Players ↗
        </button>
      </section>
    </div>
  );
}
