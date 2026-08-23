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
  const [copiedCode, setCopiedCode] = useState(false);
  const [roomCode] = useState('GTI-8492');
  const [names, setNames] = useState(['', '', '', '']);
  const [settings, setSettings] = useState<GameSettings>({
    imposterCount: 1,
    roundCount: 2,
    category: 'random',
  });

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
            <div className="online-code-banner">
              <div>
                <div className="section-label" style={{ marginBottom: 4 }}>
                  <Radio size={13} className="status-dot-live" />
                  ONLINE ROOM CODE · LIVE LOBBY
                </div>
                <div className="online-room-code">{roomCode}</div>
              </div>

              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
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
                  {copiedCode ? 'COPIED CODE' : 'COPY CODE'}
                </button>
              </div>
            </div>

            <div className="section-label" style={{ marginTop: 12 }}>
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
                    padding: '10px 14px',
                    background: 'var(--bg-elevated)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border)',
                  }}
                >
                  <span className="status-dot-live" />
                  <span
                    className="player-dot"
                    style={{
                      width: 32,
                      height: 32,
                      fontSize: 12,
                      background: PLAYER_COLORS[i % PLAYER_COLORS.length],
                    }}
                  >
                    {name.charAt(0).toUpperCase()}
                  </span>
                  <span style={{ fontWeight: 600, fontSize: 13.5, color: 'var(--ink)' }}>{name}</span>
                  <span style={{ marginLeft: 'auto', fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    {i === 0 ? 'HOST' : 'READY'}
                  </span>
                </div>
              ))}
            </div>
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
