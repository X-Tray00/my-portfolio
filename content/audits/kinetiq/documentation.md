## One protocol, two chains, one exchange rate

Kinetiq is liquid staking on Hyperliquid: stake HYPE, get kHYPE, and the
protocol delegates across validators while managing a liquidity buffer and a
withdrawal queue.

The defining feature is architectural. `StakingManager` runs on HyperEVM. The
actual delegation happens on HyperCore. Those are two layers that update
independently, and the protocol has to keep one coherent picture across both.

Everything the exchange rate is built from lives on both sides of that split.
Which makes the split the review.

## The three questions

**Buffer coherence.** The liquidity buffer tracked on HyperEVM has to reflect
what is genuinely delegated on HyperCore. Any window where the two disagree is a
window where `StakingAccountant` computes the wrong exchange rate, and the
exchange rate is what every deposit and every withdrawal prices against. A
temporary inconsistency in a bridged system is not a display bug, it is a
mispricing anyone can trade into.

**Queue ordering under slashing.** If a slashing event lands while a withdrawal
queue is partly drained, who absorbs the loss? A design where earlier exits are
made whole and later ones eat it hands a first-mover advantage to whoever
notices first. That is a fairness bug with a directly computable payoff, which
is my favourite shape of finding.

**Oracle-driven rotation.** `OracleManager` feeds validator performance metrics
that drive delegation decisions. If those metrics can be stale or steered, stake
moves toward a validator of the attacker's choosing.

## Scope

8 contracts, roughly 1,332 lines:

```
StakingManager      staking logic, buffer, withdrawal queue
KHYPE               receipt token
StakingAccountant   exchange-rate calculation
ValidatorManager    delegation and validator operations
OracleManager       validator performance metrics
```

## Outcome

No accepted finding, and here the honest version matters.

The contest confirmed 3 Highs and 5 Mediums across all wardens, including buffer
mismanagement locking funds and exactly the slashing-order problem described
above. I was in the right areas and did not convert. That is a more useful thing
to know about a reviewer than a clean sheet on a contest where nothing existed.
