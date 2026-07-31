## In a leverage protocol the oracle is the solvency boundary

Covenant builds markets for using and funding leverage against any collateral,
with the collateral itself providing the liquidity rather than a separate
lending pool per asset. That is what lets it support permissionless structured
products.

Strip away the mechanism and every important operation resolves against a price:
health checks, liquidations, minting, unwinding. The oracle is not an input to
this system, it is the thing that decides whether the system is solvent. So that
is where the review went.

## Two oracles, one interface, different trust models

The scope wraps both Chainlink and Pyth behind a shared `BaseAdapter`:

```
src/curators/oracles/BaseAdapter.sol
src/curators/oracles/CrossAdapter.sol
src/curators/oracles/chainlink/ChainlinkOracle.sol
src/curators/oracles/pyth/PythOracle.sol
```

Those two oracles are genuinely different animals. Chainlink pushes updates on
its own schedule. Pyth is pull-based and the caller supplies the update. They
signal staleness differently and they express confidence differently.

A common interface over two different trust models is a very specific kind of
trap: it invites code, and reviewers, to assume one oracle's guarantees apply to
the other. That assumption is invisible because the interface hides it.

**`CrossAdapter` compounds the problem.** Chaining two feeds to synthesise a
pair that neither provides directly means you inherit both staleness windows and
both decimal conventions. The composed result can be older, or less precise,
than anything the individual checks are looking for.

## The other two areas

**Curator parameters.** Curators are semi-trusted. They cannot steal directly,
but they configure markets and choose oracles, so the parameters they are
allowed to pick determine whether a market is safe at all. The question is which
of those choices are bounded and which are not.

**`LatentSwapLEX` settlement.** Whether the exchange can be pushed into settling
at a price the market was not offering, particularly around the boundaries where
leverage unwinds.

## Scope

26 files, centred on `Covenant.sol`, the curator layer, the oracle adapters and
the LEX.

## Outcome

No accepted finding.
