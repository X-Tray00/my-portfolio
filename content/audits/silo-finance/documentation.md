## A vault that inherits every market it touches

The audited component is SiloVault: an ERC-4626 vault that takes a deposit and
spreads it across multiple underlying lending markets according to a
configurable supply queue, accruing fees and distributing rewards along the way.

A meta-vault has a structural problem that a plain vault does not. Its
accounting must stay correct not only under its own operations, but under
whatever the markets beneath it decide to do. Those markets can pause, become
illiquid, change behaviour, or turn hostile after integration. The vault has to
survive all of it while still quoting a share price.

So the review is mostly about one thing: **can the vault's belief about its own
assets drift from reality?**

## Four ways that drift happens

**Allocation versus reality.** A market that silently accepts less than
requested, or one that cannot be exited, leaves the vault's recorded allocation
describing a world that no longer exists.

**Reward accrual across share movements.** Rewards accrued per share have to be
settled before any balance changes. If they are not, a plain transfer becomes a
way to move entitlement without moving the underlying claim, which is a
value transfer nobody authorised.

**Rounding direction.** ERC-4626 requires every conversion to round in the
vault's favour. Every assets-to-shares conversion is a place to get that
backwards, and getting it backwards is not a crash. It is a slow leak that looks
like normal operation.

**Forced market removal.** The path where a market must be ejected is always the
least-tested one in a meta-vault, and it is exactly where a stuck market becomes
a stuck vault.

## Scope

20 contracts, roughly 1,697 lines, centred on `SiloVault.sol` with market
integration, fee accrual, reward claiming and configuration around it.

## Outcome

No accepted finding.

The contest confirmed 6 Mediums across all wardens, including reward accrual
during transfers and a rounding-based deflation attack. Both are areas I worked.
I reached the right neighbourhoods and did not close.
