## What Kinetiq is

Kinetiq is a **liquid staking protocol on Hyperliquid**. Stake HYPE, receive
kHYPE representing a share in a validator delegation pool; the protocol automates
delegation across validators while managing a liquidity buffer and a withdrawal
queue.

What makes it unusual is Hyperliquid's **dual-chain architecture**. The
`StakingManager` runs on HyperEVM, but the actual delegation happens on
HyperCore. Balances therefore live on two layers that update independently, and
every operation has to keep them coherent. That split is the defining risk of
the protocol.

## Scope

8 contracts, ~1,332 lines:

```
StakingManager      core staking logic, buffer and queue
KHYPE               receipt token
StakingAccountant   exchange-rate calculation
ValidatorManager    delegation and validator operations
OracleManager       validator performance metrics
```

## Where I spent the review

The dual-chain split drove everything:

1. **Buffer accounting across layers.** The liquidity buffer on HyperEVM has to
   reflect what is actually delegated on HyperCore. Any window where the two
   disagree is a window where the exchange rate is wrong — and the exchange rate
   is what every deposit and withdrawal prices against.

2. **Withdrawal queue ordering under slashing.** If a slashing event lands
   mid-queue, the question is who absorbs it. A design where earlier exits are
   made whole and later ones eat the loss is a first-mover advantage, which is a
   fairness bug with real economic value.

3. **Oracle-driven validator rotation.** `OracleManager` feeds performance data
   that drives delegation decisions. Whether stale or manipulated metrics can
   move stake to an attacker-favourable validator.

## Outcome

**No accepted finding.** Reviewed and submitted; nothing survived judging.

The contest itself was productive — 3 Highs and 5 Mediums were confirmed across
all wardens, including buffer mismanagement locking funds and exactly the
slashing-order issue described above. I did not land any of them.
