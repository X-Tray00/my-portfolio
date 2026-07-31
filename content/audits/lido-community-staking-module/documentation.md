## What CSM is

Lido's **Community Staking Module** is the permissionless entry point into
Lido's validator set. Anyone can run Ethereum validators under it by posting a
stETH bond as collateral — a fraction of the 32 ETH a solo validator needs —
and earns bond rebase plus staking rewards, socialised across Lido's modules.

The bond is what makes the whole thing work: it is simultaneously the operator's
skin in the game, the protocol's recourse if that operator misbehaves, and the
accounting unit for their rewards. Most of the interesting logic is bond
mechanics.

A scoping note worth stating plainly: **this contest covered CSM, not Lido's
core staking pool.** CSM holds roughly 770,000 staked ETH, about 8.5% of Lido's
total TVL. The stETH contract itself was not in scope.

## Scope

34 files. The clusters:

- **Bond accounting** — `CSBondCore`, `CSBondCurve`, `CSBondLock`,
  `CSAccounting`.
- **Operator lifecycle** — `CSModule`, `CSEjector`, `CSExitPenalties`,
  `PermissionlessGate`, `VettedGate`, `VettedGateFactory`.
- **Rewards and oracle** — `CSFeeDistributor`, `CSFeeOracle`, `CSStrikes`,
  `BaseOracle`, `HashConsensus`.
- **Verification** — `CSVerifier`, `GIndex`, `SSZ` — Merkle proofs against
  beacon-chain state.
- **Infrastructure** — `QueueLib`, `SigningKeys`, `OssifiableProxy`,
  `PausableUntil`.

## Where I spent the review

Two areas absorbed most of the time.

**The bond curve.** `CSBondCurve` maps validator count to required bond in
tranches. Anywhere a curve is applied per-operator and mutated over time, the
questions are whether a boundary can be straddled, whether a curve change can be
applied retroactively to an operator's advantage, and whether the lock and the
claim paths can disagree about the same bond.

**The SSZ verification path.** `CSVerifier` proves beacon-chain facts on the
execution layer via generalised Merkle indices. `GIndex` arithmetic is the kind
of code where an off-by-one in a tree index is both easy to write and hard to
see, and it sits directly on the penalty path.

## Outcome

**No accepted finding.** I reviewed the module and submitted, but nothing I
raised survived judging.

That is the honest outcome and it is the common one — CSM had already been
through several audit rounds before the contest, and the bar for a novel finding
was correspondingly high.
