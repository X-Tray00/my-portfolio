## What Megapot is

Megapot V2 is a **decentralised jackpot protocol**. Users buy NFT-based tickets;
liquidity providers fund the prize pool and take the other side of the bet.
Drawings use Pyth Network entropy for provable fairness, winnings pay out
automatically based on number matches, and a bridge manager extends the whole
thing across chains.

The structure makes the LPs the interesting party. They are underwriting a
lottery, so the protocol's solvency depends on the payout maths being bounded —
`GuaranteedMinimumPayoutCalculator` exists precisely because an unbounded payout
against a finite pool is insolvency.

## Scope

16 files:

```
contracts/Jackpot.sol
contracts/JackpotBridgeManager.sol
contracts/GuaranteedMinimumPayoutCalculator.sol
contracts/lib/Combinations.sol
contracts/lib/FisherYatesWithRejection.sol
contracts/lib/TicketComboTracker.sol
contracts/lib/{UintCasts,JackpotErrors}.sol
```

## Where I spent the review

Randomness protocols have a well-defined and unusually mechanical risk surface,
and the library names above say exactly where it lives:

1. **Entropy handling.** Pyth entropy arrives asynchronously. The questions are
   whether ticket purchase closes before the seed is knowable, whether the
   callback can be forced to revert or be replayed, and what happens if the
   entropy provider never returns.

2. **`FisherYatesWithRejection`.** A shuffle with rejection sampling is where
   modulo bias creeps in. If the rejection bound is off, some outcomes become
   measurably more likely — which is not a crash but is a broken lottery.

3. **`Combinations` and `TicketComboTracker`.** Combinatorial accounting that
   decides who matched what. An error here is a payout error, and payout errors
   in a pooled-liquidity lottery come straight out of the LPs.

4. **Bridge accounting.** `JackpotBridgeManager` means tickets and prizes cross
   chains, so the pool's view of its own liabilities has to survive that.

## Outcome

**No accepted finding.** Reviewed and submitted; nothing survived judging.
Megapot had already been through a Zellic audit before the contest.
