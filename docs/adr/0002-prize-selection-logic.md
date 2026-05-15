# ADR 0002: Prize Selection and Inventory Logic

## Status
Accepted

## Context
The application must select a Prize for a Lead after they submit their information. The selection must be controllable (weights) and respect physical or digital inventory limits (stock).

## Decision
- **Server-Side Selection**: The winning prize will be determined on the server immediately after the Lead form is validated. This prevents clients from "rigging" the result.
- **Weighted Random Algorithm**: We will use a weighted random selection algorithm where each prize's `Probability Weight` is considered.
- **Atomic Stock Decrement**: When a prize is won, its `Stock` will be decremented. We will use a database transaction to ensure that stock never goes below zero and to handle concurrent spins correctly.
- **Exclusion of Out-of-Stock Prizes**: Prizes with a `Stock` of 0 will be excluded from the weighted selection pool.

## Rationale
- Server-side selection is essential for security.
- Weighted chances allow the business to control the "payout" ratio of different rewards.
- Stock limits prevent over-delivery of high-value or limited prizes.

## Consequences
- The database schema must include `weight` and `stock` fields for the `Prize` model.
- A "No Prize" or "Fallback Prize" segment might be needed if all prizes run out of stock.
