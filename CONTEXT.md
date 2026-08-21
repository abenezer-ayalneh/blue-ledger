# BlueLedger Context

BlueLedger is a planning interface, not a brokerage or a trading application. All currency quotations are indicative simulations and all portfolio outcomes are arithmetic projections.

## Domain terms

| Term              | Meaning                                                                                |
| ----------------- | -------------------------------------------------------------------------------------- |
| Investor          | The authenticated DummyJSON demo user represented in the application header.           |
| Portfolio Plan    | The session-scoped inputs: Current Capital, Monthly Contribution, and Horizon.         |
| Current Capital   | The whole-dollar starting USD amount available at the beginning of a Portfolio Plan.   |
| Projected Value   | `Current Capital + Monthly Contribution × Horizon`; it does not imply a market return. |
| Scenario          | Either the `current` or `projected` view passed from Overview to Currency Detail.      |
| Currency Position | One of the fixed USD/EUR/GBP allocations applied to a Scenario amount.                 |
| Indicative Rate   | A deterministic, bounded simulated rate used for visual planning; it is non-tradable.  |

## Invariants

- USD is the base currency.
- Currency allocation starts at USD 50%, EUR 30%, GBP 20%.
- Planner values are whole dollars and remain valid only within their documented ranges.
- The refresh token persists only for the active browser tab; the access token never leaves signal memory.
- The reference image guides visual language only and is not part of the public application assets.
