## The bond is the whole protocol

CSM lets anyone run Ethereum validators under Lido without permission. The thing
that makes that safe is a stETH bond the operator posts up front. That single
deposit does three jobs at once: it is the operator's skin in the game, the
protocol's recourse when they misbehave, and the accounting unit their rewards
are measured in.

Three jobs, one number. Most of the interesting code is bond mechanics, and most
of the interesting questions are about whether those three jobs can be made to
disagree.

## A scoping note worth stating plainly

This contest covered CSM, not Lido's core staking pool. CSM holds roughly
770,000 staked ETH, about 8.5% of Lido's TVL. The stETH contract itself was
never in scope.

I mention it because "audited Lido" is the kind of line that quietly inflates
into something it is not.

## The two areas that absorbed the time

**The bond curve.** `CSBondCurve` maps validator count to required bond in
tranches, which means there are boundaries, and boundaries are where money
hides. Can an operator straddle a tranche edge? Can a curve change be applied
retroactively in the operator's favour? Can the lock path and the claim path
disagree about the same bond at the same moment? Each of those is a question
about whether the three jobs above stay in sync.

**The SSZ verification path.** `CSVerifier` proves beacon-chain facts to the
execution layer using generalised Merkle indices, with `GIndex` doing the tree
arithmetic. This is the kind of code where an off-by-one in an index is both
easy to write and nearly invisible on review, and it sits directly on the
penalty path. Get it wrong and you can penalise the wrong operator, or fail to
penalise the right one.

## Scope

34 files:

```
Bond accounting     CSBondCore, CSBondCurve, CSBondLock, CSAccounting
Operator lifecycle  CSModule, CSEjector, CSExitPenalties,
                    PermissionlessGate, VettedGate, VettedGateFactory
Rewards and oracle  CSFeeDistributor, CSFeeOracle, CSStrikes,
                    BaseOracle, HashConsensus
Verification        CSVerifier, GIndex, SSZ
Infrastructure      QueueLib, SigningKeys, OssifiableProxy, PausableUntil
```

## Outcome

No accepted finding.

CSM had been through several audit rounds before the contest opened, which sets
the bar for a novel finding correspondingly high. That is the ordinary result on
a codebase this well-trodden, and it is worth saying rather than omitting.
