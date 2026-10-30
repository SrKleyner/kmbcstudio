import { gsap } from 'gsap';
import { paletteFor, stepDirection, wrapIndex } from '../lib/slider';

type Palette = { bg: string; fg: string };

/**
 * Home experience: infinite looping slider with wheel / drag / swipe / keys / buttons,
 * background color tween per active demo, expanding transition into the demo page,
 * and constant ambient motion (marquee, floating cards, wordmark parallax).
 */
export function initHome(): void {
  const root = document.querySelector<HTMLElement>('[data-home]');
  const paletteTag = document.getElementById('home-palettes');
  if (!root || !paletteTag) return;

  const stage = root.querySelector<HTMLElement>('[data-stage]')!;
  const slides = Array.from(root.querySelectorAll<HTMLElement>('[data-slide]'));
  const count = Number(root.dataset.count) || 1;
  const total = slides.length;
  const palettes: Palette[] = JSON.parse(paletteTag.textContent || '[]');
  const counter = root.querySelector<HTMLElement>('[data-current]');
  const marquee = root.querySelector<HTMLElement>('[data-marquee]');
  const wordLeft = root.querySelector<HTMLElement>('[data-word="left"]');
  const wordRight = root.querySelector<HTMLElement>('[data-word="right"]');
  const reduceQuery = matchMedia('(prefers-reduced-motion: reduce)');
  const reduced = () => reduceQuery.matches;

  const state = { pos: 0 };
  /** Horizontal offset (px) used only by the entrance sweep. */
  const intro = { x: 0 };
  let step = 1;
  let active = 0;
  let suppressClick = false;
  let opening = false;

  const measure = () => {
    step = (slides[0].offsetWidth || window.innerWidth * 0.5) * 1.07;
  };

  /** Positions every slide for the current (fractional) slider position. */
  const render = () => {
    const p = state.pos;
    slides.forEach((el, i) => {
      // Signed distance on the ring of `total` slides, in [-total/2, total/2).
      const d = ((((i - p + total / 2) % total) + total) % total) - total / 2;
      const abs = Math.abs(d);
      const scale = 1 - Math.min(abs, 2) * 0.1;
      el.style.transform = `translate3d(${d * step + intro.x}px,-50%,0) rotateY(${-d * 9}deg) scale(${scale})`;
      el.style.opacity = String(1 - Math.min(abs, 2.2) * 0.2);
      el.style.zIndex = String(Math.round(100 - abs * 10));
      const img = el.querySelector<HTMLElement>('[data-shot]');
      if (img) img.style.transform = `translate3d(${-d * 7}%,0,0) scale(1.18)`;
    });
    const next = wrapIndex(Math.round(p), count);
    if (next !== active) setActive(next);
  };

  const toRgb = (channels: string) => `rgb(${channels})`;

  const setActive = (index: number) => {
    active = index;
    const palette = paletteFor(index, palettes);
    if (counter) counter.textContent = String(index + 1).padStart(2, '0');
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', toRgb(palette.bg));
    gsap.to(document.body, {
      '--bg': palette.bg,
      '--fg': palette.fg,
      duration: reduced() ? 0 : 0.9,
      ease: 'power2.out',
      overwrite: 'auto',
    });
    slides.forEach((el) => {
      const isActive = Number(el.dataset.index) === index;
      if (el.getAttribute('aria-hidden') !== 'true') el.toggleAttribute('data-active', isActive);
    });
  };

  const moveTo = (target: number, duration = 0.9, ease = 'power3.out') => {
    gsap.killTweensOf(state);
    if (reduced() || duration === 0) {
      state.pos = target;
      render();
      return;
    }
    gsap.to(state, { pos: target, duration, ease, onUpdate: render });
  };

  const go = (delta: number) => moveTo(Math.round(state.pos) + delta, 0.95, 'power3.inOut');
  const snap = () => moveTo(Math.round(state.pos), 0.6);

  // --- Wheel / trackpad -------------------------------------------------------------
  let wheelTimer = 0;
  stage.addEventListener(
    'wheel',
    (e) => {
      e.preventDefault();
      if (opening) return;
      let delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      if (e.deltaMode === 1) delta *= 16;
      delta = Math.max(-120, Math.min(120, delta));
      gsap.killTweensOf(state);
      state.pos += (delta / step) * 0.9;
      render();
      clearTimeout(wheelTimer);
      wheelTimer = window.setTimeout(snap, 140);
    },
    { passive: false },
  );

  // --- Pointer drag / touch swipe with inertia -------------------------------------
  let dragging = false;
  let startX = 0;
  let lastX = 0;
  let lastT = 0;
  let velocity = 0; // slides per ms
  let travelled = 0;

  stage.addEventListener('pointerdown', (e) => {
    if (opening || (e.pointerType === 'mouse' && e.button !== 0)) return;
    dragging = true;
    travelled = 0;
    startX = lastX = e.clientX;
    lastT = performance.now();
    velocity = 0;
    gsap.killTweensOf(state);
  });

  window.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const dx = e.clientX - lastX;
    const now = performance.now();
    const dt = Math.max(1, now - lastT);
    travelled = Math.max(travelled, Math.abs(e.clientX - startX));
    if (travelled > 6) stage.classList.add('is-dragging');
    state.pos -= dx / step;
    velocity = velocity * 0.6 + (-dx / step / dt) * 0.4;
    lastX = e.clientX;
    lastT = now;
    render();
  });

  const endDrag = () => {
    if (!dragging) return;
    dragging = false;
    stage.classList.remove('is-dragging');
    if (travelled > 6) {
      suppressClick = true;
      setTimeout(() => (suppressClick = false), 0);
      const projected = state.pos + Math.max(-1.5, Math.min(1.5, velocity * 380));
      moveTo(Math.round(projected), 0.9);
    }
  };
  window.addEventListener('pointerup', endDrag);
  window.addEventListener('pointercancel', endDrag);

  // --- Buttons / keyboard -----------------------------------------------------------
  root.querySelector('[data-prev]')?.addEventListener('click', () => go(-1));
  root.querySelector('[data-next]')?.addEventListener('click', () => go(1));
  window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') go(1);
    else if (e.key === 'ArrowLeft') go(-1);
  });

  // Focusing a slide with the keyboard brings it to the center.
  slides.forEach((el) => {
    el.addEventListener('focus', () => {
      const idx = Number(el.dataset.index);
      const delta = stepDirection(wrapIndex(Math.round(state.pos), count), idx, count);
      if (delta !== 0) moveTo(Math.round(state.pos) + delta, 0.8);
    });
  });

  // --- Click: center a side slide, or open the active one with an expanding transition
  stage.addEventListener('click', (e) => {
    const slide = (e.target as HTMLElement).closest<HTMLElement>('[data-slide]');
    if (!slide) return;
    e.preventDefault();
    if (suppressClick || opening) return;
    const slideIndex = slides.indexOf(slide);
    const d = ((((slideIndex - state.pos + total / 2) % total) + total) % total) - total / 2;
    if (Math.abs(d) > 0.35) {
      moveTo(Math.round(state.pos + d), 0.8);
      return;
    }
    openDemo(slide);
  });

  const openDemo = (slide: HTMLElement) => {
    const href = slide.getAttribute('href')!;
    const img = slide.querySelector<HTMLImageElement>('[data-shot]');
    const card = slide.querySelector<HTMLElement>('[data-card]')!;
    const src = img?.currentSrc || img?.src || '';
    if (reduced() || !src) {
      window.location.href = href;
      return;
    }
    opening = true;
    const rect = card.getBoundingClientRect();
    const overlay = document.createElement('div');
    overlay.className = 'home-overlay';
    overlay.setAttribute('aria-hidden', 'true');
    overlay.style.backgroundImage = `url("${src}")`;
    gsap.set(overlay, { top: rect.top, left: rect.left, width: rect.width, height: rect.height, borderRadius: 18 });
    document.body.appendChild(overlay);
    gsap.to('[data-fade]', { autoAlpha: 0, duration: 0.3 });
    gsap.to(overlay, {
      top: 0,
      left: 0,
      width: window.innerWidth,
      height: window.innerHeight,
      borderRadius: 0,
      duration: 0.8,
      ease: 'power3.inOut',
      onComplete: () => {
        try {
          sessionStorage.setItem('kmbc-intro', JSON.stringify({ src, ts: Date.now() }));
        } catch {
          /* private mode: navigation still works, just without the fade-in */
        }
        window.location.href = href;
      },
    });
  };

  // Coming back through the browser cache: remove the overlay and restore the UI.
  window.addEventListener('pageshow', (e) => {
    if (!e.persisted) return;
    opening = false;
    document.querySelectorAll('.home-overlay').forEach((n) => n.remove());
    gsap.set('[data-fade]', { autoAlpha: 1 });
  });

  // --- Hover tilt -------------------------------------------------------------------
  if (matchMedia('(hover: hover)').matches) {
    slides.forEach((el) => {
      const card = el.querySelector<HTMLElement>('[data-card]')!;
      el.addEventListener('pointermove', (e) => {
        if (dragging || reduced() || opening) return;
        const r = card.getBoundingClientRect();
        const nx = (e.clientX - r.left) / r.width - 0.5;
        const ny = (e.clientY - r.top) / r.height - 0.5;
        gsap.to(card, { rotationY: nx * 10, rotationX: -ny * 10, scale: 1.03, transformPerspective: 1000, duration: 0.5, ease: 'power2.out', overwrite: 'auto' });
      });
      el.addEventListener('pointerleave', () => {
        gsap.to(card, { rotationY: 0, rotationX: 0, scale: 1, duration: 0.6, ease: 'power3.out', overwrite: 'auto' });
      });
    });
  }

  // --- Ambient motion + entrance (skipped for reduced motion) ------------------------
  measure();
  setActive(0);
  render();
  root.setAttribute('data-ready', '');
  window.addEventListener('resize', () => {
    measure();
    render();
  });

  const mm = gsap.matchMedia();
  mm.add('(prefers-reduced-motion: no-preference)', () => {
    // Entrance
    gsap.from('[data-word]', { yPercent: 115, duration: 1.2, ease: 'power4.out', stagger: 0.12 });
    gsap.from('[data-fade]', { autoAlpha: 0, y: 14, duration: 0.8, ease: 'power2.out', delay: 0.6, stagger: 0.08 });
    intro.x = window.innerWidth * 0.9;
    render();
    gsap.to(intro, { x: 0, duration: 1.8, ease: 'power4.out', onUpdate: render });

    // Cards float vertically, out of phase
    gsap.to('[data-float]', { y: -12, duration: 2.6, ease: 'sine.inOut', yoyo: true, repeat: -1, stagger: { each: 0.35, from: 'start' } });

    // Marquee drifts left, speeds up and reverses with slider velocity; wordmark halves slide apart.
    const wrap = gsap.utils.wrap(-50, 0);
    let mx = 0;
    let last = state.pos;
    let smooth = 0;
    const tick = () => {
      const v = state.pos - last;
      last = state.pos;
      smooth += (v - smooth) * 0.12;
      mx += -0.035 + smooth * -9;
      if (marquee) gsap.set(marquee, { xPercent: wrap(mx) });
      if (wordLeft) gsap.set(wordLeft, { x: -smooth * 520, skewX: smooth * -60 });
      if (wordRight) gsap.set(wordRight, { x: smooth * 520, skewX: smooth * -60 });
    };
    gsap.ticker.add(tick);

    // Pointer parallax on the wordmark (vertical + horizontal)
    const onMove = (e: PointerEvent) => {
      const nx = e.clientX / window.innerWidth - 0.5;
      const ny = e.clientY / window.innerHeight - 0.5;
      gsap.to('.home-word', { x: nx * -24, y: ny * -16, duration: 1.2, ease: 'power3.out', overwrite: 'auto' });
      gsap.to('[data-marquee]', { y: ny * 30, duration: 1.6, ease: 'power3.out', overwrite: 'auto' });
    };
    window.addEventListener('pointermove', onMove);

    return () => {
      gsap.ticker.remove(tick);
      window.removeEventListener('pointermove', onMove);
    };
  });
}
