# ADR 0001: Angular 22 with Ionic in zoneless mode

- Status: Accepted
- Date: 2026-08-21

## Context

The assessment requires current Angular, standalone APIs, Ionic, and no `zone.js`. Ionic is used through Angular wrappers and must remain reactive when Angular does not rely on Zone.js.

## Decision

Use Angular 22 standalone bootstrap with `provideZonelessChangeDetection()` and `provideIonicAngular()`. Import components only from `@ionic/angular/standalone`; do not mix raw custom elements or NgModules. App state is signal based, with explicit RxJS-to-signal conversion for timed and DOM streams.

The Ionic compatibility smoke gate comprises input, range, segment, router/tab, action-sheet/alert, deferred chart, and signal-driven visual updates. A runtime browser pass is required in addition to compilation because the risk is wrapper behavior, not typing.

## Consequences

- `zone.js` must not appear in dependencies, polyfills, or application configuration.
- Components use `OnPush`; external work must enter signals or explicitly notify Angular.
- The app must stop for a framework-conflict report if an Ionic wrapper cannot update correctly under the smoke gate. Zone.js cannot be added as a workaround.
