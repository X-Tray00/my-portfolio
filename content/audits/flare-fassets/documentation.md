## What FAssets is

**FAssets** brings non-smart-contract assets — XRP, BTC, DOGE — into DeFi on
Flare while the holder keeps custody guarantees. An agent posts collateral on
Flare, a user sends the underlying asset on its native chain, and an
attestation proving that payment mints the wrapped FAsset.

The whole system rests on a bridge between two worlds that cannot see each
other. Flare contracts cannot read the XRP Ledger directly, so every
cross-chain fact arrives as an **attestation** from Flare's data layer. That
makes attestation handling the load-bearing component: if a proof can be
forged, replayed, or applied to the wrong redemption, the collateral model
fails behind it.

## Scope

120 files — the largest scope of any review listed here. The clusters:

- **Agent lifecycle** — collateral, availability, and the agent-exit path.
- **Minting** — collateral reservation, payment attestation, and the
  time-limited window between them.
- **Redemption** — request, payment confirmation, and the default path when an
  agent fails to pay.
- **Liquidation** — collateral ratio tracking and the auction mechanics.
- **Challenges** — illegal-payment, double-payment and free-balance challenges
  that let anyone prove agent misbehaviour.

## Where I spent the review

With 120 files, coverage is a budgeting problem. I concentrated on the paths
where **value crosses the chain boundary**, since that is where FAssets carries
risk no single-chain protocol has:

1. **Attestation replay and binding.** Whether a proof of one underlying payment
   can be applied to a different redemption, or reused across agents.
2. **Redemption default.** The path where an agent does not pay and the user is
   compensated from collateral. Whether an agent can escape the default, and
   whether a user can trigger it while having been paid.
3. **Liquidation boundaries.** Whether the collateral-ratio maths lets an agent
   sit just outside liquidation while actually undercollateralised.

## Outcome

**No accepted finding.** Reviewed and submitted; nothing survived judging.
