import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/**
 * /servicios motion:
 *  - [data-sweep]     headline slides horizontally while its section scrolls through
 *  - [data-row]       service rows enter from alternating sides
 *  - [data-drift]  background numerals move vertically (shared reveal.ts also handles it on other pages)
 *  - process          pinned section: vertical scroll drives a horizontal track
 *  - [data-ticker*]   infinite marquees
 *  - [data-magnet]    CTA follows the pointer slightly
 */
export function initServicios(): void {
  gsap.registerPlugin(ScrollTrigger);
  const mm = gsap.matchMedia();

  mm.add('(prefers-reduced-motion: no-preference)', () => {
    // Horizontal sweeps tied to scroll
    gsap.utils.toArray<HTMLElement>('[data-sweep]').forEach((el) => {
      const amount = Number(el.dataset.sweep) || 10;
      gsap.fromTo(
        el,
        { xPercent: -amount },
        {
          xPercent: amount,
          ease: 'none',
          scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: 0.6 },
        },
      );
    });

    // Service rows: slide in from alternating sides, with the whole row drifting a little
    gsap.utils.toArray<HTMLElement>('[data-row-inner]').forEach((el) => {
      const dir = Number(el.dataset.rowInner) || 1;
      gsap.fromTo(
        el,
        { xPercent: dir * 14, autoAlpha: 0 },
        {
          xPercent: 0,
          autoAlpha: 1,
          ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 92%', end: 'top 45%', scrub: 0.8 },
        },
      );
    });

    // Vertical parallax on the big numerals
    gsap.utils.toArray<HTMLElement>('[data-drift]').forEach((el) => {
      const distance = Number(el.dataset.drift) || 40;
      gsap.fromTo(
        el,
        { y: -distance },
        {
          y: distance,
          ease: 'none',
          scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true },
        },
      );
    });

    // Infinite tickers
    gsap.to('[data-ticker]', { xPercent: -50, ease: 'none', duration: 28, repeat: -1 });
    gsap.fromTo('[data-ticker-reverse]', { xPercent: -50 }, { xPercent: 0, ease: 'none', duration: 40, repeat: -1 });

    // Pinned horizontal process
    const section = document.querySelector<HTMLElement>('[data-process]');
    const pin = section?.querySelector<HTMLElement>('[data-process-pin]');
    const track = section?.querySelector<HTMLElement>('[data-process-track]');
    const progress = section?.querySelector<HTMLElement>('[data-progress]');
    if (section && pin && track) {
      section.classList.add('is-pinned');
      const distance = () => Math.max(0, track.scrollWidth - window.innerWidth);
      const tween = gsap.to(track, {
        x: () => -distance(),
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: () => `+=${distance()}`,
          pin,
          scrub: 0.8,
          invalidateOnRefresh: true,
          anticipatePin: 1,
          onUpdate: (self) => progress && gsap.set(progress, { scaleX: self.progress }),
        },
      });
      // Numerals drift against the track for extra depth
      gsap.utils.toArray<HTMLElement>('[data-step-num]').forEach((num) => {
        gsap.fromTo(num, { xPercent: 18 }, { xPercent: -18, ease: 'none', scrollTrigger: { trigger: num.closest('article'), containerAnimation: tween, start: 'left 100%', end: 'right 0%', scrub: true } });
      });
    }

    // Magnetic CTA
    const magnet = document.querySelector<HTMLElement>('[data-magnet]');
    if (magnet) {
      const moveX = gsap.quickTo(magnet, 'x', { duration: 0.5, ease: 'power3.out' });
      const moveY = gsap.quickTo(magnet, 'y', { duration: 0.5, ease: 'power3.out' });
      const onMove = (e: PointerEvent) => {
        const r = magnet.getBoundingClientRect();
        moveX((e.clientX - (r.left + r.width / 2)) * 0.18);
        moveY((e.clientY - (r.top + r.height / 2)) * 0.18);
      };
      const reset = () => {
        moveX(0);
        moveY(0);
      };
      magnet.addEventListener('pointermove', onMove);
      magnet.addEventListener('pointerleave', reset);
    }

    // Fonts and images can shift layout after load: recompute trigger positions.
    window.addEventListener('load', () => ScrollTrigger.refresh());
  });
}
