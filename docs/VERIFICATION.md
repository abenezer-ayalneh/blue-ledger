# Verification

## Required local checks

```bash
npm ci
npm run format:check
npm run lint
npm test
npm run build
npm run e2e
```

## Manual gates

- Test the Ionic zoneless smoke flow: input, numeric input, rotated range keys, segment change, route/tab state, action sheet, sign-out alert, lazy charts, and signal-driven updates.
- Review Login, Overview, Currency Detail, Analytics, and placeholders at 280px, 390px, 768px, 1024px, and 1440px.
- Confirm no horizontal overflow at 280px, 44px targets, visible focus, semantic chart alternatives, and reduced-motion final states.
- Verify reload session restore against DummyJSON, a 401 refresh/retry, and invalid refresh-token recovery.
- Confirm a protected deep link returns to its validated local route after login.
- Confirm the profile action sheet requires its Ionic alert confirmation before sign-out.
- Confirm `npm ls zone.js` is empty; no NgModules, `any`, Angular Material, or alternate UI library may be introduced.
- CI repeats format, lint, unit, build, and fully mocked Playwright/axe checks on pull requests and `main`.
- `npm audit --omit=dev` should report zero production dependency vulnerabilities.

## Evidence boundary

An Angular production build validates types, templates, static bundling, and lazy chunks. It does not prove Ionic wrapper behavior under a real browser, external DummyJSON availability, or deployment behavior. The open gates above must be run before public delivery.

Playwright intercepts the DummyJSON endpoints during CI E2E tests so credentials are never transmitted from automation. A separate manual production smoke is required for the live demo API.

For a workstation with an already-managed Chromium cache, `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` may point to that local binary. CI installs Playwright's pinned browser version instead.
