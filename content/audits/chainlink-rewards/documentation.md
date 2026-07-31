## $200,000 for two files

That ratio is the most informative thing about this contest before you read a
line of code.

```
src/BUILDClaim.sol
src/BUILDFactory.sol
```

A sponsor putting that much behind that little is telling you two things. They
expect the remaining bugs to be subtle, and they are confident everything
shallow has already been found. Volume strategies are worthless here. There is
nowhere to get lucky.

The upside is that a two-file scope removes the usual excuse. You cannot run out
of time before reaching an important contract. If something is there and you
miss it, that is on the reading, not the clock.

## What the contracts do

Chainlink Rewards distributes tokens from BUILD-program projects to Chainlink
ecosystem participants. A project registers through `BUILDFactory`, deposits its
allocation, and participants claim through `BUILDClaim`: some immediately, the
rest unlocking over a schedule, with a penalty for taking the early exit.

## Four questions, worked exhaustively

**Double claiming.** Can the same allocation be claimed twice? Through
reentrancy, through a re-submitted proof, or across the boundary where an early
claim becomes a vested one.

**The early-claim discount.** Taking tokens early costs you. Can the discount
curve be gamed by timing, and where does the forfeited remainder go? Forfeited
value has to land somewhere, and "somewhere" is a design decision worth
attacking.

**Factory and claim accounting.** Can the factory's view of what a project has
deposited diverge from what the claim contract will actually pay out? Divergence
in one direction is a stuck balance. In the other it is insolvency.

**Season transitions.** What happens to an unclaimed balance when the next
season is configured? Transitions are the least-exercised paths in any
distribution contract.

## Outcome

No accepted finding.
