## What Ekubo is

Ekubo is a **concentrated-liquidity AMM** built on three ideas: a singleton
contract holding every pool rather than one contract per pair, super-
concentrated liquidity for capital efficiency, and an **extension** system that
lets pools attach custom behaviour at defined hook points.

The singleton design is the interesting part from a security standpoint. It
makes swaps cheaper — no token transfers between pool contracts, just internal
accounting — but it also means every pool shares one storage space and one
reentrancy surface. An error that would be contained to a single pair in a
Uniswap-V2-style design is potentially global here.

## Scope

92 files: the core singleton, the math libraries underneath it, and the shipped
extensions (oracle, TWAMM, MEV-resist and limit-order variants).

## Where I spent the review

Three questions drove the review, in order of how much damage a mistake would
do:

1. **Can accounting cross the pool boundary?** In a singleton, the invariant
   holding everything together is that each pool's balances are tracked
   independently against one shared token pool. Anywhere a pool key is derived,
   hashed or truncated is a place two pools might collide.

2. **What can an extension do that it should not?** Extensions run at hook
   points with the pool mid-update. The questions are which state is already
   committed when the hook fires, whether an extension can re-enter, and whether
   a malicious extension on its own pool can affect anyone else's.

3. **Does the tick and liquidity math hold at the extremes?** Concentrated
   liquidity concentrates rounding error too. Boundary ticks, zero-liquidity
   ranges and the crossing logic between initialised ticks are where these
   protocols historically break.

## Outcome

**No accepted finding.** Reviewed and submitted; nothing survived judging.

Ekubo's contracts are, by the sponsor's own description, "relentlessly
optimised" — and heavily optimised code that has already been audited is a hard
target. That is the honest read on this one.
