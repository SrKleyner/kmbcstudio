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
- Not verified: real drag/wheel/inertia feel, expanding transition in a real browser, pinned scroll behavior (no scripted browser available).

## Next step
- User review in a real browser; push/deploy are user decisions.
