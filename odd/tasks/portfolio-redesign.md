# Feature: portfolio-redesign

## Objective
Redesign the portfolio home (`/`) into a full-bleed, motion-rich showcase for KLEYNER BONALDE (domain kmbcstudio.com) and move services/pricing to a dedicated page.

## Problem / Why
The current index is a centered, narrow, plain layout that does not sell premium work. Demo images also fail to load until several refreshes. The user wants an agency-grade first impression to send to prospects.

## Requirements (from user)
- Full screen usage: NO centered max-width column with empty side gutters. Edge-to-edge layouts (only small responsive padding).
- Hero: name "KLEYNER BONALDE" prominent; contact button at top-right.
- Infinite slider (loops both ways; wheel, drag/swipe, arrows, keyboard) with a small visual preview of each demo landing. Inspiration: guillaumecolombel.fr (not a copy).
- Page background color changes smoothly on every slide advance/retreat (one palette per demo).
- Clicking a slide opens that landing (expanding transition) to show it working; demo pages get a way back to the portfolio.
- Bottom-right button leading to Services page: Servicios (with prices) → Proceso → "Hablemos de tu negocio" (contact).
- Constant parallax plus vertical and horizontal element motion on both pages; respect `prefers-reduced-motion`.

## Constraints
- pnpm only; Astro + Tailwind 4 + GSAP already in place. Code/comments English; UI copy neutral Spanish.
- Site URL: https://kmbcstudio.com.
- Previews as local optimized screenshots of the demos (no fragile hotlinks for the slider).

## TDD
- Mode: ON (global CLAUDE.md). Runner: Vitest (`pnpm test`). Applies to pure slider logic (`src/lib/slider.ts`: index wrapping, direction, color per index).

## Delivery
- Branch `feat/portfolio-redesign` (from `feat/portfolio-landings`). Local commits only; push/deploy are user decisions. RDD off.

## Tasks
- [x] T1 Diagnose and fix demo images not loading until refresh (root cause, not workaround); set site to kmbcstudio.com and developer name. Route: delegated writer.
- [x] T2 Slider logic (TDD) + new full-bleed home: hero, contact button, infinite slider with previews, background color transitions, click-to-open transition, bottom-right Services button; back link on demo pages. Route: delegated writer.
- [x] T3 `/servicios` page: Servicios y precios → Proceso → Hablemos de tu negocio, full-bleed with parallax and horizontal/vertical motion. Route: delegated writer.
- [x] T4 Visual verification screenshots at 1440px and 390px for `/` and `/servicios`; fix overflow issues. Route: delegated writer.

- [x] T5 Install impeccable design skill (project scope, claude provider, no hooks; engine binary gitignored). Route: inline.
- [x] T6 `/servicios` scroll motion + typography: section headlines must be fully readable at rest (no clipped "SERVICIOS Y P"), scroll-driven horizontal motion must be scrubbed smoothly and settle at a defined aligned end state, clear section boundaries/alignment between sections, contact section without overlapping outline text clutter. Apply impeccable polish/layout/typeset/animate criteria. Route: delegated writer.
- [x] T7 Same motion/typography audit for `/` (home) with impeccable criteria; keep the approved structure (full-bleed, name readable, slider, color shift, buttons). Route: delegated writer.

- [ ] T8 Home hierarchy swap: the value proposition ("Landings que convierten visitas en clientes") becomes the large headline; "Kleyner Bonalde — Desarrollador web freelance" becomes the small line. Re-fit type sizes so the headline is fully readable above the slider at 1920/1440/1366/390. Route: delegated writer.
- [ ] T9 Home: remove all text motion (velocity skew/x on the wordmark, pointer parallax, marquee drift); keep at most a one-time entrance fade. Route: delegated writer.
- [ ] T10 Home wheel/trackpad: replace the per-event position nudging + snap with an accumulate-threshold-and-step model (one slide per gesture, locked while animating) so mouse wheel and trackpad move smoothly between cards; pure helper in src/lib/slider.ts under TDD. Route: delegated writer.

## Acceptance criteria
- `pnpm test` and `pnpm build` pass; no horizontal page scroll at 390px; images load on first visit; slider loops infinitely in both directions; reduced-motion disables animations.

## Checks
- `pnpm test`, `pnpm build`, headless screenshots.

## Progress / Evidence
- T1 (45744df, delegated writer): root cause = 25 demo photos hotlinked from images.unsplash.com with on-demand transforms (curl: each cold request 1.0-2.5 s, all HTTP 200, no local caching/retry, plus loading=lazy) so images arrived late/unpredictably until the CDN cache warmed over several refreshes. Not reproducible as a 404; diagnosis from measured cold latency + external dependency. Fix: all photos downloaded to src/assets/photos and served via astro:assets <Image> (webp, local origin); og:image uses local URLs; unsplash preconnect removed. Site = https://kmbcstudio.com, name = Kleyner Bonalde. test 22 pass, build OK, no 'unsplash' in dist.
- T2 (9ecd443): TDD RED observed (slider.test.ts failed: cannot find module ./slider), then GREEN 35/35 tests. Home with infinite slider, color tween, expanding click transition (GSAP overlay + sessionStorage fade-in on demo), back link on demos, local screenshot previews (headless Firefox 1440x900).
- T3 (1b00e32): /servicios with sweeping headline, editorial price rows, pinned horizontal process, tickers, contact CTA.
- T4: Firefox screenshots 1440x900 and 390x844 of / and /servicios checked visually; scrollWidth <= innerWidth at 390 for /, /servicios and demos (378-390 vs 390).
- Fix (9558c9a, inline): "Escríbeme" and "Servicios" stayed invisible. Root cause reproduced in headless Chromium: Tailwind `transition` (includes opacity/transform) on GSAP `[data-fade]` links froze the autoAlpha fade-in at opacity 0. Limited to transition-[scale,background-color,color]. Verified: no opacity-0 interactive elements on /, /servicios, demos; test 35/35, build OK.
- Fix (inline): slider track now starts below the wordmark; card size derived from free height. Measured in Chromium: card top > wordmark bottom at 1920x958, 1366x657, 390x844; no horizontal overflow. WHATSAPP_NUMBER set to the owner number.
- T6 (46f3dd0, delegated writer): root causes. (1) Headline was one nowrap line "SERVICIOS Y PRECIOS · SERVICIOS Y PRECIOS" at 17vw (~3x viewport wide) swept +-14% of its own width, so it never aligned and scrolled away mid-word. (2) Contact lines swept +-9% at 13.5vw, "DE TU NEGOCIO" overflowed the gutter. (3) Ad-hoc font sizes per block; outlined "Cuéntame tu idea" ticker overlapped the contact headline (removed). (4) Process pin: distance ignored the right padding (last card ended at the viewport edge, not the gutter), scrub .8, no end hold; pinned content could exceed short viewports. Fix: shared --gutter/--section-y and role scale (.t-display/.t-contact/.t-h2/.t-row/.t-step/.t-card in global.css); headlines two lines sized to the width (min with vh); servicios headline aligned at rest and drifts apart scrubbed while leaving; contact lines settle into the gutter (scrub, end aligned); service rows: title and price share size/baseline; process = one scrubbed timeline with distance incl. right padding plus 18% hold; ScrollTrigger.refresh on load and fonts.ready; ghost numerals 6% alpha, +-40px parallax. Measured in Chromium (text-range boxes): headlines at rest within [gutter, width-gutter] at 1920x958 (48-1872), 1440x900 (43-1397), 1366x657 (41-1325), 390x844 (16-374); scrollWidth == innerWidth everywhere; last process card right edge = width - gutter at pin end; contact section fits one viewport at all four sizes. Reduced motion: no transforms, nothing hidden. Screenshots: scratchpad/pw/shots1 (s-*, m1920/m390/m1366, end-*). detect: no findings. test 35/35, build OK. impeccable context ran (no PRODUCT.md; proceeded on incumbent as allowed); eyebrow labels and section numbers kept to preserve copy/structure.
- T7 (72f1a53, delegated writer): audit of / at 4 viewports: wordmark 48-1872 / 43-1397 / 41-1325 / 16-374, cards below the wordmark, buttons on the gutter, no overflow, reduced motion static. Only real problem: pointer parallax shifted the wordmark up to +-12px off the gutter; reduced to +-5px. Not verified: real drag/wheel feel and expanding transition by hand.
- Fix c1d7ef9 (inline): ticker had 2 copies narrower than wide viewports (gap while looping) -> 4 copies, -25% loop; measured track right edge never below 3967px at 1920/2560. Process numerals used xPercent +-10 of a stretched flex child (~73px) -> self-start + 0/-12/0px keyframes; measured numeral-vs-title dx 0 at pin start/end, max -12, never clipped (1920, 390).
- Not verified (earlier): real drag/wheel/inertia feel, expanding transition in a real browser, pinned scroll behavior (no scripted browser available).

## Next step
- User review in a real browser; push/deploy are user decisions.
