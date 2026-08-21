# Architecture

## Boundaries

| Area            | Responsibility                                                                                                        |
| --------------- | --------------------------------------------------------------------------------------------------------------------- |
| `core/auth`     | Typed unknown-boundary parsing for DummyJSON, session restore, one-flight refresh, 401 retry, guard, and interceptor. |
| `core/storage`  | Browser-safe, JSON-based `sessionStorage` access. Each caller owns its versioned envelope validation.                 |
| `shell`         | Persistent Ionic tab-bar/rail shell and the application's single Ionic router outlet.                                 |
| `features/home` | Signal-owned portfolio calculations, deterministic FX stream, and lazy Overview, Currency, and Analytics views.       |
| `features/auth` | Login form and return-URL recovery.                                                                                   |
| `shared`        | Ionic page header, count-up display, and Chart.js lifecycle hosts.                                                    |

## Runtime flow

1. The app initializer asks `AuthStore` to restore the current-tab refresh token.
2. A protected route is either permitted or redirected to `/login?returnUrl=…`.
3. Login exchanges credentials for tokens, keeps the access token in memory, persists the refresh token, and loads `/auth/me`.
4. The `authInterceptor` adds the access token only to DummyJSON auth requests. A 401 refreshes once and retries once.
5. `PortfolioStore` exposes immutable plan, scenario, and analytics computed signals. A bounded effect persists the validated plan envelope.
6. `FxRatesStore` combines document visibility with an RxJS four-second timer. Its component-scoped lifetime removes the feed when Currency Detail is destroyed.
7. Lazy Chart.js hosts create, update, and destroy their canvas instance in response to signal input changes.

## Routes

| Route                                           | Purpose                                           |
| ----------------------------------------------- | ------------------------------------------------- |
| `/login`                                        | Demo authentication and protected-route recovery. |
| `/app/home/overview`                            | Default planner.                                  |
| `/app/home/currency/:scenario`                  | `current` or `projected` Currency Detail.         |
| `/app/home/analytics`                           | Portfolio analytics.                              |
| `/app/create`, `/app/security`, `/app/settings` | Shared-shell placeholders.                        |

All pages are standalone lazy components. The persistent shell owns one `ion-router-outlet`; this avoids nested Ionic outlet transitions and keeps Home's Overview, Currency, and Analytics views interactive.

## Rendering and performance

The app uses `provideZonelessChangeDetection`, `OnPush`, signals, stable `@for` tracking, `@defer` chart blocks, and CSS transform/opacity motion. Chart.js is only imported by lazy chart host components. The production initial budget is 950 kB warning / 1.2 MB error because Ionic establishes a shared runtime; chart modules remain separately loaded.
