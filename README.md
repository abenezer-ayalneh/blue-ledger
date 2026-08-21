# BlueLedger

BlueLedger is a client-side FX portfolio planner built for the Angular/Ionic developer assessment. It turns a starting balance, monthly contribution, and planning horizon into transparent, non-trading portfolio scenarios.

## Stack and guarantees

- Angular 22 standalone components with zoneless change detection.
- Ionic 8 standalone components, customized with Ionic variables, slots, and shadow parts before considering native HTML.
- Tailwind CSS 4 for layout and design tokens; Chart.js for the two chart canvases only.
- Signals for app state, Angular/RxJS interop for the visibility-aware simulated FX feed, and strict TypeScript without `any`.
- Access tokens are memory-only. The session-scoped refresh token and portfolio plan are schema-checked before reading from `sessionStorage`.

## Local development

```bash
npm ci
npm start
```

Open `http://localhost:4200`. Use **Use demo account** on the login screen to fill the documented DummyJSON credentials, then sign in. The live demo API is required for authentication.

```bash
npm test
npm run build
```

The app uses a 950 kB initial warning budget and keeps Chart.js inside lazy page chunks. See [docs/VERIFICATION.md](docs/VERIFICATION.md) for the verification boundary and [docs/DELIVERY.md](docs/DELIVERY.md) for public-release fields.

## Documentation

- [Domain context](CONTEXT.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Ionic-first inventory](docs/IONIC_COMPONENT_INVENTORY.md)
- [Implementation log](docs/IMPLEMENTATION_LOG.md)
- [Zoneless architecture decision](docs/adr/0001-angular-22-ionic-zoneless.md)
