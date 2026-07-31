## What Silo Finance is

The audited component is **SiloVault** — an ERC-4626 vault that accepts a
deposit and distributes it across multiple underlying lending markets according
to a configurable supply queue, accruing fees on interest and distributing
rewards to depositors.

A meta-vault of this shape inherits every market it allocates into. Its
accounting has to stay correct not just under its own operations but under
whatever the underlying markets do — including markets that become paused,
illiquid, or hostile after the fact.

## Scope

20 contracts, ~1,697 lines. `SiloVault.sol` is the centre of gravity; the rest
is market integration, fee accrual, reward claiming and configuration.

## Where I spent the review

1. **Queue and allocation invariants.** Whether the vault's recorded allocation
   can diverge from what the underlying markets actually hold — through a market
   that silently accepts less than requested, or one that cannot be exited.

2. **Reward accrual across share movements.** Rewards accrued per share must be
   settled before any balance change, or a transfer becomes a way to move
   entitlement without moving the underlying claim.

3. **Rounding direction.** ERC-4626 requires rounding to favour the vault. Every
   conversion between assets and shares is a place where a wrong direction is a
   slow leak rather than a visible failure.

4. **Market removal.** The path where a market has to be forcibly removed is
   always the least-tested one, and it is where a stuck market becomes a stuck
   vault.

## Outcome

**No accepted finding.** Reviewed and submitted; nothing survived judging.

The contest confirmed 6 Mediums across all wardens — including reward accrual
during transfers and rounding-based deflation, both areas I worked. I reached
the right neighbourhoods and did not convert.
