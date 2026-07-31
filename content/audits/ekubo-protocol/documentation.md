## One contract holds every pool

Ekubo is a concentrated-liquidity AMM with a singleton architecture. Instead of
deploying a contract per trading pair, every pool lives inside one contract and
tracks its balances as internal accounting.

The upside is obvious: a swap across three pools moves no tokens between
contracts, it just updates numbers. That is a large gas saving and it is why the
sponsor describes the code as relentlessly optimised.

The security consequence is less obvious and more interesting. In a
Uniswap-V2-style design, a bug in one pair is contained to that pair, because
the pair is a separate contract holding its own tokens. In a singleton, there is
no containment boundary. Every pool shares one storage space, one token balance,
and one reentrancy surface. A mistake that would be a local problem elsewhere is
potentially a global one here.

## The three questions, in order of blast radius

**Can accounting cross a pool boundary?** The invariant holding the singleton
together is that each pool's balances are tracked independently against one
shared pot. Anywhere a pool key is derived, hashed, or truncated is a place two
different pools might resolve to the same slot. That is the worst case in the
whole design, so it went first.

**What can an extension reach?** Extensions attach custom behaviour at hook
points, and hooks fire while the pool is mid-update. Which state is already
committed when a hook runs? Can an extension re-enter? Can a malicious extension
on its own pool touch anyone else's? Ekubo ships oracle, TWAMM, MEV-resist and
limit-order extensions, so this is not hypothetical surface.

**Does the tick maths hold at the extremes?** Concentrated liquidity
concentrates rounding error along with capital. Boundary ticks, zero-liquidity
ranges, and the logic that crosses between initialised ticks are where this
class of protocol has historically broken.

## Scope

92 files: the singleton core, the maths libraries under it, and the shipped
extensions.

## Outcome

No accepted finding.

Heavily optimised code that has already been audited is a hard target, and this
is what that looks like from the inside.
