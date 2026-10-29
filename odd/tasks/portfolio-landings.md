# Feature: portfolio-landings

## Objective
Build a zero-cost portfolio site with 3 demo landing pages (fictional brands) used to prospect small businesses in LatAm.

## Problem / Why
The user needs extra income with no capital. Demos let them send ready-made mockups to prospects (dental clinics, bakeries, trainers) and show both design and automation skills.

## Scope
- One Astro + Tailwind + GSAP project, static output.
- `/` portfolio index (services, the 3 demos, contact via WhatsApp/Binance-friendly copy).
- `/dental` "Sonríe Clínica Dental": before/after slider, treatments with "desde" prices, WhatsApp booking with prefilled message.
- `/pasteleria` "Masa Madre Pastelería": menu + cart that builds a WhatsApp order message, custom cakes section.
- `/training` "Forja Training": 4-question quiz recommending a plan, lead sent to a configurable Google Apps Script endpoint with WhatsApp fallback; dark energetic design.

## Constraints
- pnpm only. Free hosting target (Cloudflare Pages / Vercel); no host blocked in Venezuela.
- Code, identifiers, comments in English; UI copy in neutral Spanish (target audience is Spanish-speaking businesses).
- Fictional brands only. Images from Unsplash (hotlinked URLs) or CSS.
- Respect prefers-reduced-motion. Mobile-first.

## TDD
- Mode: ON (source: global CLAUDE.md "Strict TDD Mode: enabled").
- Runner: Vitest (`pnpm test`). Applies to pure logic (cart message builder, quiz recommender, WhatsApp URL builder).

## Delivery
- Strategy: ask-on-risk. Local commits only on `feat/portfolio-landings`; push/deploy are user decisions.
- RDD: off (global) — ordinary checks only.

## Tasks
- [x] T1 Scaffold Astro + Tailwind + Vitest, shared layout, WhatsApp URL helper (TDD), portfolio index. Route: delegated writer (2+ non-trivial files).
- [x] T2 `/dental` landing. Route: delegated writer.
- [x] T3 `/pasteleria` landing + cart message builder (TDD). Route: delegated writer.
- [x] T4 `/training` landing + quiz recommender (TDD) + lead submit. Route: delegated writer.
- [x] T5 README with deploy steps (Cloudflare Pages/Vercel) and Apps Script snippet. Route: delegated writer.

## Acceptance criteria
- `pnpm test` green, `pnpm build` succeeds, each route renders and works on mobile width.

## Checks
- `pnpm test`, `pnpm build`.

## Progress / Evidence
- T1 done: commit 590cdf2; RED observed (whatsapp module missing, 'no tests' failure) then GREEN 4/4; `pnpm test` pass, `pnpm build` pass (1 page); route: delegated writer.
- T2 done: commit 442cf8d; `pnpm test` 4/4 pass, `pnpm build` pass (2 pages); route: delegated writer.
- T3 done: commit 1c641b8; RED observed (cart module missing) then GREEN 14/14; `pnpm build` pass (3 pages); route: delegated writer.
- T4 done: commit f7518e0; RED observed (quiz module missing) then GREEN 22/22; `pnpm build` pass (4 pages); route: delegated writer.
- T5 done: commit a8d73e9; `pnpm test` 22/22 pass, `pnpm build` pass (4 pages); route: delegated writer.

## Next step
- Pending check: manual browser test of cart, quiz, slider and 360px width (not yet observed). Review demos visually, set WHATSAPP_NUMBER/DEVELOPER in src/config.ts; push/deploy are user decisions.
