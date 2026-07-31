## Porting Aave V3 means porting its assumptions

K2 is a lending protocol on Stellar's Soroban, and it adapts Aave V3's design:
supply for interest-bearing aTokens, borrow against collateral at variable
rates, liquidate positions that fall underwater.

The design is proven. That is exactly what makes the port interesting.

Aave V3 was written against the EVM, and it leans on EVM guarantees that are not
stated anywhere in the code because on the EVM they are free. Soroban is a
Rust and WebAssembly environment. Its rules differ on arithmetic, on caller
identity, on reentrancy, and on whether stored data continues to exist. Every
place the port carried a line across without re-deriving why it was safe is a
candidate.

So I did not review this as a fresh lending protocol. I reviewed it as a
translation, asking one question per contract: **what did the original rely on
that this environment does not provide?**

## The three that carried real risk

**Arithmetic.** Solidity 0.8 reverts on overflow, and has since 2021, so modern
EVM code simply assumes it. Rust in release mode wraps unless the code opts into
checked operations. Interest accumulators and index maths ported line by line
inherit a completely different failure mode: instead of a revert you get a
plausible wrong number.

**Caller identity.** Aave's access control assumes `msg.sender` is fixed for the
duration of a call and cannot be spoofed. Soroban uses `require_auth`, which is
a different model with different guarantees. The equivalence has to be
established, not assumed.

**Storage that expires.** Soroban entries have a time to live and must be
bumped, or they lapse. There is no EVM analogue at all. For a lending protocol
this is not a housekeeping detail: position data that can quietly disappear is a
solvency question.

## Scope

81 files of Rust, the only non-Solidity review listed here.

```
contracts/shared/src/{utils,dex,types,upgradeable,errors,events}.rs
contracts/pool/…            supply, borrow, repay, withdraw
contracts/a_token/…         interest-bearing receipt token
contracts/liquidation/…     health factor and auction logic
```

## Outcome

One confirmed finding, under disclosure embargo.

The issue is validated by the sponsor. No technical details appear here and none
will until the fix is deployed, because the affected code is live. That includes
the severity: on a scope this size, severity plus the three areas named above
would narrow the search considerably for anyone reading with bad intent.

The contest report has not been published yet either. This page will be updated
when disclosure is permitted.
