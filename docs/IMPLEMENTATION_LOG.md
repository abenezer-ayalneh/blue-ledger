# Implementation Log

## 2026-08-21 — Foundation and vertical slice

- Decision: Bootstrap Angular 22 with standalone APIs, zoneless change detection, Ionic 8 standalone imports, Tailwind 4, RxJS, and lazy Chart.js hosts.
- Decision: Treat Ionic components as the control layer; use native elements only for semantic copy and Chart.js canvas accessibility support. The component inventory records this boundary.
- Implemented: Session-scoped DummyJSON auth with memory-only access tokens, typed unknown parsing, validated refresh-token persistence, protected lazy routes, a one-flight refresh, and one guarded 401 retry.
- Implemented: Signal-based portfolio plan persistence, formula `currentCapital + monthlyContribution × horizonMonths`, Overview, Currency Detail, Analytics, authenticated shell, placeholders, animated count-up, and visibility-aware deterministic FX simulation.
- Corrected: The portfolio store now injects storage before its initial signal reads it. Vitest exposed the TypeScript field-initialization ordering issue before browser delivery.
- Corrected: An investor fetch made during token refresh now carries a no-refresh context. This prevents a failed freshly-refreshed `/auth/me` request from waiting on its own single-flight refresh promise.
- Verified: The Vitest configuration resolves Ionic's Node-incompatible component-directory import explicitly, then a zoneless Ionic TestBed confirms `ionInput` and `ion-button` events update Login signals.
- Added: ESLint, Prettier, Playwright, and axe-based browser checks. CI will mock DummyJSON in E2E; live DummyJSON remains reserved for the final production smoke.
- Corrected: The shared muted copy and primary action colors meet the 4.5:1 WCAG AA threshold after the first axe scan surfaced two serious login contrast findings.
- Corrected: The authenticated shell is now persistent around one Ionic router outlet. The first real E2E pass exposed that nested/recreated Ionic outlets left an exiting page pointer-active after sign-in; the revised shell keeps the outlet stable and uses Ionic tab-bar primitives as its navigation layer.
- Corrected: The rotated `ion-range` controls retain Ionic input behavior and now add an explicit narrow keyboard adapter for Home, End, Up, and Down values; no native-control fallback was introduced.
- Added: GitHub Actions quality gates and Vercel's SPA rewrite/output configuration. Both remain locally documented until the public repository and deployment are created.
- Added: The Ionic avatar now falls back to the investor's computed initials after an image load error.
- Updated: Direct PostCSS now uses 8.5.26; `npm audit --omit=dev` reports zero production vulnerabilities.
- Verification: `npm ci`, format, lint, 12 Vitest tests, production build, and six mocked Playwright/axe tests pass. The final initial raw bundle is 911.04 kB (187.63 kB estimated transfer), below the documented 950 kB warning budget; Chart.js remains lazy. `npm audit --omit=dev` reports zero vulnerabilities and `npm ls zone.js` is empty.
- Limitation: Vitest's JSDOM logs two benign Ionic stylesheet-parse notices while the dedicated browser suite passes. Live DummyJSON smoke, public repository publication, Vercel deployment, Lighthouse, and committed cross-platform visual baselines remain delivery gates.
