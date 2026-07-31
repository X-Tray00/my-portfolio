## What Covenant is

Covenant builds **markets for the use and funding of leverage against any
collateral asset, using the collateral itself as liquidity**. Instead of
requiring a separate lending pool per asset, the collateral being levered
provides the liquidity, which is what lets the protocol support permissionless
structured products.

Two roles matter for the threat model: **curators**, who configure markets and
choose oracles, and the **LEX** (liquidity exchange) that prices and settles.
Curators are semi-trusted — they cannot steal directly, but the parameters they
pick determine whether a market is safe.

## Scope

26 files:

```
src/Covenant.sol
src/curators/CovenantCurator.sol
src/curators/oracles/BaseAdapter.sol
src/curators/oracles/CrossAdapter.sol
src/curators/oracles/chainlink/ChainlinkOracle.sol
src/curators/oracles/pyth/PythOracle.sol
src/lex/latentswap/LatentSwapLEX.sol
…
```

## Where I spent the review

The oracle adapter layer took most of the time, because in a leverage protocol
the oracle *is* the solvency boundary — every liquidation, every health check
and every mint resolves against it.

1. **`CrossAdapter` composition.** Chaining two price feeds to synthesise a pair
   compounds both feeds' staleness windows and both feeds' decimal handling. The
   question is whether the composed result is more stale, or less precise, than
   either input is checked for.

2. **Chainlink vs Pyth semantics.** The two adapters wrap oracles with genuinely
   different models — push vs pull, different staleness signals, different
   confidence semantics. A shared `BaseAdapter` interface over two different
   trust models is where one oracle's guarantees get silently assumed of the
   other.

3. **`LatentSwapLEX` settlement.** Whether the exchange can be pushed into
   settling at a price the market did not offer, particularly around the
   boundaries where leverage is unwound.

## Outcome

**No accepted finding.** Reviewed and submitted; nothing survived judging.
