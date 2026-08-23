import { animate, stagger, createTimeline } from 'animejs';

export function animateScreenIn(root: HTMLElement | null) {
  if (!root) return;
  const targets = root.querySelectorAll('[data-anim]');
  animate(targets, {
    opacity: [0, 1],
    translateY: [22, 0],
    delay: stagger(70, { start: 60 }),
    duration: 650,
    ease: 'out(3)',
  });
}

export function animateHeroTitle(root: HTMLElement | null) {
  if (!root) return;
  const words = root.querySelectorAll('.hero-word');
  animate(words, {
    opacity: [0, 1],
    translateY: [34, 0],
    delay: stagger(110, { start: 100 }),
    duration: 750,
    ease: 'outExpo',
  });
}

export function flipRevealCard(el: HTMLElement) {
  animate(el, {
    rotateY: [{ to: -14, duration: 160, ease: 'inOut(2)' }, { to: -180, duration: 640, ease: 'inOut(3)' }],
    scale: [{ to: 1.04, duration: 300 }, { to: 1, duration: 400 }],
    duration: 800,
  });
}

export function popIn(el: HTMLElement, delay = 0) {
  animate(el, {
    opacity: [0, 1],
    scale: [0.82, 1],
    translateY: [16, 0],
    duration: 550,
    delay,
    ease: 'outBack',
  });
}

export function shakeEl(el: HTMLElement) {
  animate(el, {
    translateX: [0, -9, 8, -6, 4, 0],
    duration: 480,
    ease: 'out(2)',
  });
}

export function pulseEl(el: HTMLElement) {
  animate(el, {
    scale: [1, 1.05, 1],
    duration: 420,
    ease: 'inOut(2)',
  });
}

export { createTimeline };

/* ---------------------------------------------------------------------------
 * Button micro-interaction FX — anime.js driven, event-delegated so every
 * current & future button picks it up automatically.
 *
 *   hover   -> springy grow (cards get a soft lift instead)
 *   press   -> quick squish
 *   release -> elastic overshoot back to rest
 *   click   -> expanding ripple from the pointer position
 * ------------------------------------------------------------------------- */

const FX_SELECTOR = '.btn, .icon-pill, .vote-card, .category-chip';

let buttonFxReady = false;

function fxTarget(target: EventTarget | null): HTMLElement | null {
  if (!(target instanceof Element)) return null;
  const el = target.closest<HTMLElement>(FX_SELECTOR);
  return el && !el.matches(':disabled') ? el : null;
}

function isLiftCard(el: HTMLElement) {
  return el.classList.contains('vote-card') || el.classList.contains('category-chip');
}

function spawnRipple(el: HTMLElement, x: number, y: number) {
  const rect = el.getBoundingClientRect();
  const d = Math.max(rect.width, rect.height) * 2.2;
  const ripple = document.createElement('span');
  ripple.className = 'fx-ripple';
  ripple.style.width = `${d}px`;
  ripple.style.height = `${d}px`;
  ripple.style.left = `${x - rect.left}px`;
  ripple.style.top = `${y - rect.top}px`;
  el.appendChild(ripple);
  animate(ripple, {
    scale: [{ from: 0, to: 1, duration: 600, ease: 'out(3)' }],
    opacity: [
      { from: 0, to: 0.26, duration: 70, ease: 'out(2)' },
      { to: 0, duration: 530, ease: 'out(2)' },
    ],
  }).then(() => ripple.remove());
}

export function initButtonFx(): void {
  if (buttonFxReady || typeof window === 'undefined') return;
  buttonFxReady = true;

  // Respect users who opt out of non-essential motion.
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  document.addEventListener('pointerover', (e) => {
    const el = fxTarget(e.target);
    if (!el || (e.relatedTarget instanceof Node && el.contains(e.relatedTarget))) return;
    animate(
      el,
      isLiftCard(el)
        ? { translateY: -3, scale: 1.02, duration: 340, ease: 'out(3)' }
        : { scale: 1.045, duration: 340, ease: 'out(4)' }
    );
  });

  document.addEventListener('pointerout', (e) => {
    const el = fxTarget(e.target);
    if (!el || (e.relatedTarget instanceof Node && el.contains(e.relatedTarget))) return;
    animate(
      el,
      isLiftCard(el)
        ? { translateY: 0, scale: 1, duration: 380, ease: 'out(3)' }
        : { scale: 1, duration: 380, ease: 'out(3)' }
    );
  });

  document.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    const el = fxTarget(e.target);
    if (!el) return;
    animate(el, { scale: 0.94, duration: 130, ease: 'out(3)' });
  });

  document.addEventListener('pointerup', (e) => {
    const el = fxTarget(e.target);
    if (!el) return;
    animate(el, { scale: 1, duration: 620, ease: 'outElastic(1, .42)' });
  });

  document.addEventListener('click', (e) => {
    const el = fxTarget(e.target);
    if (!el || e.detail === 0) return; // ignore keyboard-activated clicks (no pointer pos)
    spawnRipple(el, e.clientX, e.clientY);
  });
}
