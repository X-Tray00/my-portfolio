## Somebody has to take the other side of a lottery

Megapot V2 sells NFT jackpot tickets, draws numbers using Pyth entropy, and pays
out on matches. The part that makes it a security problem rather than a game is
that the prize pool is funded by liquidity providers.

Those LPs are underwriting the bet. Which means protocol solvency depends on the
payout maths being provably bounded, and a contract named
`GuaranteedMinimumPayoutCalculator` exists because an unbounded payout against a
finite pool is not a bug report, it is an insolvency.

So the target is not "can I steal the jackpot". It is "can I make the pool owe
more than it holds".

## The library names tell you where to look

```
contracts/lib/FisherYatesWithRejection.sol
contracts/lib/Combinations.sol
contracts/lib/TicketComboTracker.sol
```

Randomness protocols have an unusually mechanical risk surface, and this scope
labels it for you.

**Entropy handling.** Pyth entropy arrives asynchronously. Does ticket purchase
close before the seed becomes knowable? Can the callback be forced to revert or
be replayed? What happens if the provider never returns at all? Every async
oracle has a "never answers" branch and it is usually the least tested one.

**Rejection sampling.** `FisherYatesWithRejection` is where modulo bias lives.
Rejection sampling exists to eliminate it, and if the rejection bound is off by
even a little, certain outcomes become measurably more likely. Nothing reverts.
Nothing looks wrong. The lottery is simply not fair, which is the entire product.

**Combinatorial payout.** `Combinations` and `TicketComboTracker` decide who
matched what. An error here is a payout error, and payout errors in a
pooled-liquidity lottery come directly out of LP capital.

**Bridge accounting.** `JackpotBridgeManager` means tickets and prizes cross
chains, so the pool's view of its own liabilities has to survive that trip.

## Scope

16 files, including `Jackpot.sol`, the bridge manager, the payout calculator and
the libraries above.

## Outcome

No accepted finding. Megapot had already been through a Zellic audit before the
contest opened.
