## What K2 is

K2 is a **borrowing and lending protocol on Stellar's Soroban** platform. It
adapts Aave V3's design — supply assets for interest-bearing aTokens, borrow
against collateral at variable rates, liquidate undercollateralised positions —
to Stellar's constraints.

The interesting part is the port itself. Aave V3's design assumes the EVM:
its storage layout, its reentrancy model, its integer semantics, its notion of
an external call. Soroban is a **Rust/WASM** environment with different rules
for all four. Anywhere the port carried an EVM assumption across without
re-deriving it is a candidate bug.

## Scope

**81 files of Rust** — the only non-Solidity review listed here.

```
contracts/shared/src/{utils,dex,types,upgradeable,errors,events}.rs
contracts/pool/…            supply, borrow, repay, withdraw
contracts/a_token/…         interest-bearing receipt token
contracts/liquidation/…     health factor and auction logic
```

## Where I spent the review

I worked the review as a **differential audit against Aave V3** rather than as a
fresh lending-protocol review. The question on each contract was not "is this
correct in isolation" but "what did the EVM original rely on that Soroban does
not provide".

The three that carried the most risk:

1. **Integer semantics.** Solidity 0.8 reverts on overflow. Rust's release
   profile wraps unless the code opts into checked arithmetic. Any index maths
   or interest accumulator ported line-by-line inherits a different failure mode.

2. **Reentrancy and authorisation.** Soroban's `require_auth` model is not the
   `msg.sender` model. Aave's guards assume the caller identity is fixed for
   the duration of a call; the equivalent guarantee on Soroban has to be
   established, not assumed.

3. **Storage TTL.** Soroban entries expire and must be bumped. State that
   silently disappears has no EVM analogue at all, and a lending protocol whose
   position data can lapse is a solvency problem, not a UX one.

## Outcome

**One confirmed finding — under disclosure embargo.**

The issue is validated by the sponsor. **No technical details are published
here**, and none will be until the fix is deployed: the affected code is live,
and a description specific enough to be interesting is specific enough to be a
roadmap. That includes the severity — on a scope this small, severity plus the
areas named above would narrow the search considerably.

The contest report has not been published yet either, so there is no public link
for this one. Both this page and the entry will be updated once disclosure is
permitted.
