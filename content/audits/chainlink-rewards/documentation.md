## What Chainlink Rewards is

**Chainlink Rewards (CLR)** is a community incentive program. Projects in the
Chainlink BUILD program allocate a portion of their token supply to Chainlink
ecosystem participants, and these contracts are the on-chain claim mechanism
that distributes it.

The structure is a factory plus per-project claim contracts: a BUILD project
registers through `BUILDFactory`, deposits its allocation, and participants
claim their share through `BUILDClaim` — some immediately, the rest unlocking
over a schedule.

## Scope

Two files — the smallest scope of any contest I have entered, and one of the
largest prize pools ($200,000):

```
src/BUILDClaim.sol
src/BUILDFactory.sol
```

That ratio is informative. A two-file scope with that much money behind it means
the sponsor expects the bugs to be subtle, and that everything easy has already
been found. Volume strategies are useless here; the only thing that pays is
depth on a small amount of code.

## Where I spent the review

Claim contracts have a compact and well-known failure set, and with two files
there is time to work all of it properly:

1. **Double claiming.** Whether any path lets the same allocation be claimed
   twice — through re-entry, through a refactored merkle proof, or across an
   early-claim-then-vest boundary.
2. **The early-claim discount.** Taking tokens early costs a penalty. The
   question is whether the discount curve can be gamed by timing, and where the
   forfeited remainder goes.
3. **Accounting between factory and claim.** Whether the factory's view of what
   a project has deposited can diverge from what the claim contract will
   actually pay out — the direction that ends in insolvency.
4. **Season transitions.** Whether an unclaimed balance from one season is
   correctly handled when the next is configured.

## Outcome

**No accepted finding.** Reviewed and submitted; nothing survived judging.
