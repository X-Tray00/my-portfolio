## What Transaction Rails is

Sequence's Transaction Rails ("Trails") are **multichain intent rails**: a user
signs an intent — pay, swap, fund or earn — and the system resolves it across
whatever wallet, token and chain are involved, in one click.

Intent architectures move the trust question. The user is no longer signing a
specific call; they are signing a *desired outcome*, and a solver decides how to
reach it. Everything then depends on whether the contracts enforce that the
executed path actually delivers what was signed.

This is a **separate contest** from the Sequence Ecosystem Wallet review — the
wallet is the account layer, Trails is the execution layer on top.

## Scope

9 files — small, and deliberately so:

```
src/TrailsIntentEntrypoint.sol
src/TrailsRouter.sol
src/TrailsRouterShim.sol
src/guards/DelegatecallGuard.sol
src/interfaces/…
```

The presence of a dedicated `DelegatecallGuard` in a nine-file scope is a strong
hint about where the sponsor expected trouble, and it is where I started.

## Where I spent the review

1. **Delegatecall containment.** A router that delegatecalls into adapters is
   executing untrusted code in its own storage context. The guard exists to stop
   that; the question is whether every path reaches the guard, and whether the
   guard's own assumptions hold under nested calls.

2. **Intent binding.** Whether a signed intent can be replayed, partially
   executed, or satisfied along a path that drains more than the user authorised
   — including on a different chain, since these are multichain rails and a
   signature without chain binding is a signature usable everywhere.

3. **Shim boundaries.** `TrailsRouterShim` exists to adapt call shapes. Adapters
   are classic places for calldata to be reconstructed slightly differently from
   what was signed and verified.

## Outcome

**No accepted finding.** Reviewed and submitted; nothing survived judging.

The contest report has not been published yet, so there is no public link for
this one.
