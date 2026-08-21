# Delivery Record

This record distinguishes completed, repository-backed verification from delivery work that requires an authenticated deployment account.

| Field                 | Value                                                                 |
| --------------------- | --------------------------------------------------------------------- |
| Public repository URL | https://github.com/abenezer-ayalneh/blue-ledger                      |
| Production URL        | Pending: Vercel device authentication is required to create/claim a project |
| Demo credentials      | `emilys` / `emilyspass`                                               |
| Tested commit SHA     | `182af8013a25289e7433a2fe5fef86847a721e4b`                           |
| Deployment timestamp  | Pending deployment                                                    |
| Verification summary  | `npm ci`, formatting, lint, 12 unit tests, production build, six mocked E2E flows, and a local axe scan passed; the live API smoke and deployed URL checks remain pending. |

## Known limitations

- DummyJSON is an external demo API; availability and avatar latency are outside BlueLedger’s control.
- FX values are deterministic visual simulations, not prices or trading advice.
- Vercel is not authenticated on this machine. Publishing a permanent Vercel deployment requires completing Vercel's device-authentication flow; live login is also intentionally deferred until that URL exists.
