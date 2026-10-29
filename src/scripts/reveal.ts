import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/**
 * Scroll reveals shared by every page.
 *  - [data-reveal]        fades/slides the element itself in.
 *  - [data-reveal-group]  staggers its direct children.
 *  - [data-parallax]      moves the element slowly while scrolling (value = distance in px).
 * Everything stays visible when JS is off or the user prefers reduced motion.
 */
export function initReveal(): void {
  gsap.registerPlugin(ScrollTrigger);
  const mm = gsap.matchMedia();

  mm.add('(prefers-reduced-motion: no-preference)', () => {
    gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((el) => {
      gsap.from(el, {
        opacity: 0,
        y: 36,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
      });
    });

    gsap.utils.toArray<HTMLElement>('[data-reveal-group]').forEach((group) => {
      gsap.from(Array.from(group.children), {
        opacity: 0,
        y: 40,
        duration: 0.8,
        ease: 'power3.out',
        stagger: 0.12,
        scrollTrigger: { trigger: group, start: 'top 85%', once: true },
      });
    });

    gsap.utils.toArray<HTMLElement>('[data-parallax]').forEach((el) => {
      const distance = Number(el.dataset.parallax) || 40;
      gsap.fromTo(
        el,
        { y: -distance },
        {
          y: distance,
          ease: 'none',
          scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true },
        },
      );
    });

    gsap.from('[data-hero] > *', {
      opacity: 0,
      y: 30,
      duration: 1,
      ease: 'power3.out',
      stagger: 0.12,
      delay: 0.1,
    });
  });
}
