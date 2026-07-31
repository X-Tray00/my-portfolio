## Signing an outcome instead of a transaction

Transaction Rails, or Trails, lets a user sign an intent: pay, swap, fund, or
earn. A solver then works out how to actually achieve it across whatever
wallets, tokens and chains are involved.

Intent architectures move the trust question somewhere new. The user is no
longer approving a specific call they can inspect. They are approving a desired
result and handing the route to somebody else. Everything then rests on whether
the contracts enforce that the executed path delivers what was signed, and
nothing more.

This is a separate contest from the Sequence Ecosystem Wallet review. The wallet
is the account layer. Trails is the execution layer running on top.

## Nine files, one of them a hint

```
src/TrailsIntentEntrypoint.sol
src/TrailsRouter.sol
src/TrailsRouterShim.sol
src/guards/DelegatecallGuard.sol
src/interfaces/…
```

A dedicated `DelegatecallGuard` in a nine-file scope tells you where the sponsor
already expects trouble. That is where I started, on the principle that a guard
is worth attacking precisely because someone thought it was necessary.

## What I chased

**Delegatecall containment.** A router that delegatecalls into adapters is
running untrusted code inside its own storage context. The guard exists to stop
that becoming a takeover. Two questions follow: does every path actually reach
the guard, and do the guard's own assumptions survive nested calls?

**Intent binding.** Can a signed intent be replayed, partially executed, or
satisfied along a route that extracts more than the user authorised? These are
multichain rails, so a signature that omits a chain identifier is a signature
that works on every chain at once.

**Shim boundaries.** `TrailsRouterShim` exists to adapt call shapes between
interfaces. Adapters are a recurring place for calldata to be rebuilt slightly
differently from the version that was signed and verified, and slightly
differently is enough.

## Outcome

No accepted finding. The contest report has not been published, so there is no
public link for this one yet.
