## A bridge between two chains that cannot see each other

FAssets brings XRP, BTC and DOGE into DeFi on Flare while the holder keeps
custody guarantees. An agent posts collateral on Flare, a user sends the real
asset on its native chain, and the wrapped FAsset gets minted.

The load-bearing part is the middle step. Flare contracts cannot read the XRP
Ledger. They have no way to check whether that payment happened. So every
cross-chain fact arrives as an **attestation** from Flare's data layer, and the
contracts treat it as truth.

That makes attestation handling the trust boundary for the entire system. If a
proof can be forged, replayed, or applied to a redemption it was not issued for,
the collateral model behind it does not matter. The bridge is only as sound as
the thing telling it what happened elsewhere.

## Budgeting 120 files

This was the largest scope I have reviewed, and coverage becomes an allocation
problem rather than a reading problem. I spent the budget on paths where value
crosses the chain boundary, because that is where FAssets carries risk no
single-chain protocol has to think about.

**Attestation replay and binding.** Can a proof of one underlying payment be
applied to a different redemption, or reused across agents? This is the direct
attack on the trust boundary.

**Redemption default.** When an agent fails to pay on the underlying chain, the
user is compensated from collateral instead. Two failure directions: an agent
escaping a default they owe, or a user triggering one after having been paid.
Both are real money and both depend on evidence from a chain the contract
cannot query.

**Liquidation boundaries.** Whether the collateral-ratio maths lets an agent sit
just outside liquidation while actually undercollateralised.

## Scope

120 files, clustering into agent lifecycle, minting, redemption, liquidation,
and the challenge system that lets anyone prove agent misbehaviour.

## Outcome

No accepted finding.
