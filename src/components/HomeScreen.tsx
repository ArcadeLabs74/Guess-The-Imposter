import { useEffect, useRef, useState } from 'react';
import {
  Play,
  Plus,
  Trash2,
  Users,
  Layers,
  Zap,
  BookOpen,
  VenetianMask,
  Smartphone,
  Globe,
  Copy,
  Check,
  Radio,
  Share2,
  UserPlus,
  LogIn,
  Loader2,
  SlidersHorizontal,
} from 'lucide-react';
import type { GameSettings, Player, DbRoom } from '../types/game';
import { CATEGORY_OPTIONS, PLAYER_COLORS } from '../data/presetWords';
import { animateHeroTitle, animateScreenIn, popIn } from '../lib/animations';
import { soundManager } from '../services/soundService';
import { CategoryModal } from './CategoryModal';

interface HomeScreenProps {
  onStartLocalGame: (names: string[], settings: GameSettings) => void;
  onOpenRules: () => void;
  // Supabase Online Props
  onlineRoom?: DbRoom | null;
  onlinePlayers?: Player[];
  isHostingOnline?: boolean;
  onHostOnlineRoom?: (hostName: string, hostColor: string, settings: GameSettings) => Promise<void>;
  onJoinOnlineRoom?: (code: string, playerName: string, playerColor: string) => Promise<void>;
  onStartOnlineGame?: () => Promise<void>;
  onLeaveOnlineRoom?: () => void;
}

const MIN_PLAYERS = 3;
const MAX_PLAYERS = 12;

const INITIAL_SELECTED_CATEGORIES = [
  'random',
  'food',
  'movies',
  'places',
  'animals',
  'gaming',
  'sports',
  'everyday',
  'professions',
  'superheroes',
];

export function HomeScreen({
  onStartLocalGame,
  onOpenRules,
  onlineRoom,
  onlinePlayers = [],
  isHostingOnline = false,
  onHostOnlineRoom,
  onJoinOnlineRoom,
  onStartOnlineGame,
  onLeaveOnlineRoom,
}: HomeScreenProps) {
  const heroRef = useRef<HTMLDivElement>(null);
  const setupRef = useRef<HTMLDivElement>(null);

  const [gameMode, setGameMode] = useState<'local' | 'online'>(onlineRoom ? 'online' : 'local');
  const [onlineTab, setOnlineTab] = useState<'host' | 'join'>('host');
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [invitedFriends, setInvitedFriends] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [joinName, setJoinName] = useState('Agent Phoenix');
  const [hostName, setHostName] = useState('Host Operative');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [onlineError, setOnlineError] = useState<string | null>(null);

  const [names, setNames] = useState(['', '', '', '']);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>(INITIAL_SELECTED_CATEGORIES);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  const [settings, setSettings] = useState<GameSettings>({
    imposterCount: 1,
    roundCount: 2,
    category: 'random',
  });

  const activeRoomCode = onlineRoom?.code || '';

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
    if (!activeRoomCode) return;
    soundManager.playClick();
    const shareUrl = `${window.location.origin}${window.location.pathname}?room=${activeRoomCode}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join my Guess The Imposter Game!',
          text: `Join my Guess The Imposter room with code: ${activeRoomCode}`,
          url: shareUrl,
        });
        return;
      } catch {
        // fallback
      }
    }
    navigator.clipboard?.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleInviteFriends = () => {
    if (!activeRoomCode) return;
    soundManager.playClick();
    const inviteMessage = `🕵️‍♂️ Play Guess The Imposter with me!\n\nRoom Code: ${activeRoomCode}\nDirect Link: ${window.location.origin}${window.location.pathname}?room=${activeRoomCode}`;
    navigator.clipboard?.writeText(inviteMessage);
    setInvitedFriends(true);
    setTimeout(() => setInvitedFriends(false), 2500);
  };

  const handleCreateOnline = async () => {
    if (!onHostOnlineRoom) return;
    setOnlineError(null);
    setIsSubmitting(true);
    soundManager.playClick();
    try {
      await onHostOnlineRoom(hostName, PLAYER_COLORS[0], settings);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create room';
      setOnlineError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleJoinOnline = async () => {
    if (!onJoinOnlineRoom || !joinCode.trim()) return;
    setOnlineError(null);
    setIsSubmitting(true);
    soundManager.playClick();
    try {
      const colorIndex = (onlinePlayers.length + 1) % PLAYER_COLORS.length;
      await onJoinOnlineRoom(joinCode.trim().toUpperCase(), joinName.trim() || 'Agent Guest', PLAYER_COLORS[colorIndex]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to join room';
      setOnlineError(msg);
    } finally {
      setIsSubmitting(false);
    }
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
  const canStartLocal = names.length >= MIN_PLAYERS;
  const canStartOnline = onlinePlayers.length >= MIN_PLAYERS;

  const start = () => {
    soundManager.playCardFlip();
    if (gameMode === 'online') {
      if (onStartOnlineGame) onStartOnlineGame();
    } else {
      onStartLocalGame(finalNames, settings);
    }
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
          <span className="brand-spine-tag">{gameMode === 'local' ? 'PASS & PLAY' : 'ONLINE MULTIPLAYER'}</span>
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
              <span>{gameMode === 'local' ? 'PASS & PLAY · 60S PER TURN · ZERO SETUP' : 'ONLINE SUPABASE MULTIPLAYER · MULTI-DEVICE'}</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Hero Featured Card */}
      <section className="corner-notch-card hero-featured-card" data-anim>
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
              <span className="hero-spec-dot" /> {gameMode === 'online' ? (onlinePlayers.length || 0) : names.length} ACTIVE CREW
            </span>
            <span>
              <span className="hero-spec-dot" /> {settings.roundCount} {settings.roundCount === 1 ? 'ROUND' : 'ROUNDS'}
            </span>
            <span>
              <span className="hero-spec-dot" /> {gameMode === 'local' ? 'PASS & PLAY' : 'ONLINE SUPABASE LOBBY'}
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
            <div>• MODE: {gameMode === 'local' ? 'LOCAL PASS & PLAY' : 'ONLINE MULTIPLAYER'}</div>
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
            {onlineError && (
              <div style={{ padding: '10px 14px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid var(--danger)', borderRadius: 'var(--radius-md)', color: 'var(--danger)', fontSize: 13, marginBottom: 12 }}>
                {onlineError}
              </div>
            )}

            {/* If Already In an Online Room */}
            {onlineRoom ? (
              <>
                <div className="online-code-banner">
                  <div>
                    <div className="section-label" style={{ marginBottom: 4 }}>
                      <Radio size={13} className="status-dot-live" />
                      ACTIVE ROOM LOBBY
                    </div>
                    <div className="online-room-code">{onlineRoom.code}</div>
                  </div>

                  <div className="online-actions-group">
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => {
                        navigator.clipboard?.writeText(onlineRoom.code);
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

                    {onLeaveOnlineRoom && (
                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        onClick={onLeaveOnlineRoom}
                      >
                        LEAVE ROOM
                      </button>
                    )}
                  </div>
                </div>

                <div className="section-label" style={{ marginTop: 12 }}>
                  <Users size={13} />
                  CONNECTED OPERATIVES ({onlinePlayers.length}/12) {onlinePlayers.length < 3 && '(Min 3 to launch)'}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '10px' }}>
                  {onlinePlayers.map((player) => (
                    <div
                      key={player.id}
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
                          background: player.color,
                        }}
                      >
                        {player.name.charAt(0).toUpperCase()}
                      </span>
                      <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--ink)' }}>{player.name}</span>
                      <span style={{ marginLeft: 'auto', fontSize: 10.5, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                        {player.isHost ? 'HOST' : 'CONNECTED'}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              /* Online Tab Switcher: Host vs Join */
              <>
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
                      <span>CREATE NEW ROOM</span>
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
                      <span>JOIN WITH CODE</span>
                    </button>
                  </div>

                  {copiedLink && <span className="toast-feedback"><Check size={13} /> Invite Link Copied!</span>}
                  {invitedFriends && <span className="toast-feedback"><Check size={13} /> Invite Message Copied!</span>}
                </div>

                {onlineTab === 'host' ? (
                  <div style={{ background: 'var(--bg-elevated)', padding: '22px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-strong)', marginTop: 14 }}>
                    <div className="section-label" style={{ marginBottom: 12 }}>
                      <Radio size={13} />
                      HOST ONLINE MULTIPLAYER ROOM (SUPABASE)
                    </div>

                    <div className="online-join-grid">
                      <div className="online-input-box">
                        <label>HOST CODENAME</label>
                        <input
                          className="input"
                          value={hostName}
                          placeholder="Host Operative"
                          maxLength={16}
                          onChange={(e) => setHostName(e.target.value)}
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      className="btn btn-primary"
                      style={{ marginTop: 16 }}
                      disabled={isSubmitting}
                      onClick={handleCreateOnline}
                    >
                      {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Radio size={16} />}
                      <span>CREATE ONLINE ROOM & GENERATE CODE ↗</span>
                    </button>
                  </div>
                ) : (
                  <div style={{ background: 'var(--bg-elevated)', padding: '22px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-strong)', marginTop: 14 }}>
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
                        disabled={!joinCode.trim() || isSubmitting}
                        onClick={handleJoinOnline}
                      >
                        {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <LogIn size={16} />}
                        <span>CONNECT & JOIN LOBBY ↗</span>
                      </button>
                    </div>
                  </div>
                )}
              </>
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
                      Math.floor(((gameMode === 'online' ? (onlinePlayers.length || 4) : names.length) - 1) / 2) || 1,
                      settings.imposterCount + 1
                    ),
                  })
                }
                disabled={settings.imposterCount >= Math.max(1, Math.floor(((gameMode === 'online' ? (onlinePlayers.length || 4) : names.length) - 1) / 2))}
                aria-label="More imposters"
              >
                +
              </button>
            </div>
          </div>

          <div className="setting-row">
            <div>
              <div className="setting-name">Clue Rounds</div>
              <div className="setting-desc">Number of discussion passes</div>
            </div>
            <div className="stepper">
              <button
                onClick={() => {
                  soundManager.playClick();
                  setSettings({ ...settings, roundCount: Math.max(1, settings.roundCount - 1) });
                }}
                disabled={settings.roundCount <= 1}
                aria-label="Fewer rounds"
              >
                −
              </button>
              <span className="stepper-value" style={{ minWidth: 44, textAlign: 'center' }}>
                {settings.roundCount} {settings.roundCount === 1 ? 'Rnd' : 'Rnds'}
              </span>
              <button
                onClick={() => {
                  soundManager.playClick();
                  setSettings({ ...settings, roundCount: Math.min(20, settings.roundCount + 1) });
                }}
                disabled={settings.roundCount >= 20}
                aria-label="More rounds"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Quick Rounds Pill Presets */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center', marginTop: -6 }}>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
            Quick select:
          </span>
          {[1, 2, 3, 4, 5, 8, 10].map((r) => (
            <button
              key={r}
              type="button"
              className={`segmented-chip ${settings.roundCount === r ? 'active' : ''}`}
              style={{
                padding: '3px 10px',
                borderRadius: '999px',
                fontSize: 11,
                fontFamily: 'var(--font-mono)',
                fontWeight: 600,
                border: settings.roundCount === r ? '1px solid var(--accent-strong)' : '1px solid var(--border)',
                background: settings.roundCount === r ? 'var(--accent-dim)' : 'var(--bg-elevated)',
                color: settings.roundCount === r ? 'var(--accent-strong)' : 'var(--text-secondary)',
                cursor: 'pointer',
              }}
              onClick={() => {
                soundManager.playClick();
                setSettings({ ...settings, roundCount: r });
              }}
            >
              {r} {r === 1 ? 'Rnd' : 'Rnds'}
            </button>
          ))}
        </div>

        <hr className="divider" />

        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
            <div>
              <div className="section-label" style={{ marginBottom: 2 }}>
                <Layers size={13} />
                Word Deck Selection
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                Active: <strong style={{ color: 'var(--ink)' }}>{CATEGORY_OPTIONS.find((c) => c.id === settings.category)?.name || 'Random Mix'}</strong> · {CATEGORY_OPTIONS.find((c) => c.id === settings.category)?.description}
              </div>
            </div>

            <button
              type="button"
              className="btn btn-secondary btn-sm"
              style={{ height: 34, padding: '0 14px', fontSize: 11 }}
              onClick={() => {
                soundManager.playClick();
                setShowCategoryModal(true);
              }}
            >
              <SlidersHorizontal size={13} />
              Filter Decks ({selectedCategoryIds.length}) ↗
            </button>
          </div>

          <div className="category-grid">
            {CATEGORY_OPTIONS.filter((c) => selectedCategoryIds.includes(c.id))
              .slice(0, 10)
              .map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  className={`category-chip ${settings.category === cat.id ? 'active' : ''}`}
                  onClick={() => {
                    soundManager.playClick();
                    setSettings({ ...settings, category: cat.id });
                  }}
                  title={cat.description}
                >
                  <span className="cat-name">{cat.name}</span>
                </button>
              ))}

            {selectedCategoryIds.length > 10 && (
              <button
                type="button"
                className="category-chip"
                style={{ borderStyle: 'dashed', background: 'var(--surface-2)' }}
                onClick={() => {
                  soundManager.playClick();
                  setShowCategoryModal(true);
                }}
                title="Open modal to view and customize all category decks"
              >
                <span className="cat-name" style={{ color: 'var(--accent-strong)' }}>
                  +{selectedCategoryIds.length - 10} More…
                </span>
              </button>
            )}
          </div>
        </div>

        <hr className="divider" />

        <button
          className="btn btn-primary btn-block btn-lg"
          onClick={start}
          disabled={gameMode === 'online' ? (!onlineRoom || !isHostingOnline || !canStartOnline) : !canStartLocal}
        >
          <Play size={17} strokeWidth={2.6} />
          {gameMode === 'online'
            ? onlineRoom
              ? isHostingOnline
                ? `Launch Online Mission (${onlinePlayers.length}/3 Min) ↗`
                : 'Waiting for Host to Launch Mission…'
              : 'Create or Join an Online Room Above ↗'
            : `Launch Session with ${names.length} Players ↗`}
        </button>
      </section>

      {/* Category Selection & Filter Popup Modal */}
      {showCategoryModal && (
        <CategoryModal
          selectedIds={selectedCategoryIds}
          activeCategoryId={settings.category}
          onSaveSelection={(newIds, newActive) => {
            setSelectedCategoryIds(newIds);
            setSettings({ ...settings, category: newActive });
          }}
          onClose={() => setShowCategoryModal(false)}
        />
      )}
    </div>
  );
}
