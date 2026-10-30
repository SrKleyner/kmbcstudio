import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/**
 * /servicios motion:
 *  - [data-sweep]     headline lines drift apart (scrubbed) as the section scrolls away
 *  - [data-reveal-x]  contact headline lines settle into the gutter (scrubbed)
 *  - [data-row-inner] service rows enter from alternating sides
 *  - [data-drift]  background numerals move vertically (shared reveal.ts also handles it on other pages)
 *  - process          pinned section: vertical scroll drives a horizontal track
 *  - [data-ticker*]   infinite marquees
 *  - [data-magnet]    CTA follows the pointer slightly
 */
export function initServicios(): void {
  gsap.registerPlugin(ScrollTrigger);
  const mm = gsap.matchMedia();

  mm.add('(prefers-reduced-motion: no-preference)', () => {
    // Section headline: aligned to the gutter at rest, then the two lines drift apart (opposite
    // directions) while the section scrolls away. Scrubbed, starts fully readable.
    const headline = document.querySelector<HTMLElement>('#servicios-title');
    if (headline) {
      gsap.utils.toArray<HTMLElement>('[data-sweep]', headline).forEach((line) => {
        const dir = Number(line.dataset.sweep) || 1;
        gsap.to(line, {
          xPercent: dir * 12,
          ease: 'none',
          scrollTrigger: { trigger: headline, start: 'clamp(top 25%)', end: 'bottom top', scrub: 0.5 },
        });
      });
    }

    // Contact headline: lines slide into the gutter and settle there (end state = aligned).
    const contact = document.querySelector<HTMLElement>('#contacto-title');
    if (contact) {
      gsap.utils.toArray<HTMLElement>('[data-reveal-x]', contact).forEach((line) => {
        const dir = Number(line.dataset.revealX) || 1;
        gsap.fromTo(
          line,
          { xPercent: dir * 8 },
          {
            xPercent: 0,
            ease: 'none',
            scrollTrigger: { trigger: contact, start: 'top 100%', end: 'top 55%', scrub: 0.5 },
          },
        );
      });
    }

    // Service rows: slide in a little from alternating sides and settle aligned.
    gsap.utils.toArray<HTMLElement>('[data-row-inner]').forEach((el) => {
      const dir = Number(el.dataset.rowInner) || 1;
      gsap.fromTo(
        el,
        { xPercent: dir * 5, autoAlpha: 0 },
        {
          xPercent: 0,
          autoAlpha: 1,
          ease: 'none',
          scrollTrigger: { trigger: el, start: 'top 95%', end: 'top 65%', scrub: 0.5 },
        },
      );
    });

    // Subtle vertical parallax on the ghost numerals (transform only)
    gsap.utils.toArray<HTMLElement>('[data-drift]').forEach((el) => {
      const distance = Number(el.dataset.drift) || 30;
      gsap.fromTo(
        el,
        { y: -distance },
        {
          y: distance,
          ease: 'none',
          scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: 0.5 },
        },
      );
    });

    // Infinite ticker
    gsap.to('[data-ticker]', { xPercent: -50, ease: 'none', duration: 28, repeat: -1 });

    // Pinned horizontal process. One scrubbed timeline: the track travels exactly from the
    // left gutter to the point where the last card ends at the right gutter, then holds briefly
    // before the pin releases, so the end state is always complete and aligned.
    const section = document.querySelector<HTMLElement>('[data-process]');
    const pin = section?.querySelector<HTMLElement>('[data-process-pin]');
    const track = section?.querySelector<HTMLElement>('[data-process-track]');
    const progress = section?.querySelector<HTMLElement>('[data-progress]');
    if (section && pin && track) {
      section.classList.add('is-pinned');
      // scrollWidth leaves out the trailing padding; add it back so the last card stops at the right gutter.
      const distance = () => Math.max(0, track.scrollWidth + parseFloat(getComputedStyle(track).paddingRight) - window.innerWidth);
      const HOLD = 0.18; // trailing hold, relative to the travel (duration 1)
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: () => `+=${Math.round(distance() * (1 + HOLD))}`,
          pin,
          scrub: 0.5,
          invalidateOnRefresh: true,
          anticipatePin: 1,
        },
      });
      tl.to(track, { x: () => -distance(), duration: 1 }, 0);
      tl.fromTo('[data-step-num]', { xPercent: 10 }, { xPercent: -10, duration: 1 }, 0);
      if (progress) tl.fromTo(progress, { scaleX: 0 }, { scaleX: 1, duration: 1 }, 0);
      tl.to({}, { duration: HOLD });
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
    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener('load', refresh);
    document.fonts?.ready.then(refresh);
  });
}
