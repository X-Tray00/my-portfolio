## What Payment Abstraction is

Chainlink services are paid for in many tokens across many chains, but node
operators are paid in LINK. **Payment Abstraction** is the machinery that closes
that gap: it accepts fees in assorted tokens, consolidates them onto one chain
over CCIP, converts them to LINK, and routes the LINK to a withdrawal contract
for service providers.

V1 did the conversion through Uniswap V3. **V2 replaces that with a
permissionless Dutch auction**: allowlisted assets are auctioned, any
participant can bid, and the system integrates with CowSwap so the protocol's
solver network provides participation. The stated goals were resilience across
multiple liquidity venues and forward compatibility with venues not yet chosen.

## Scope

13 files:

```
src/AuctionBidder.sol            src/BaseAuction.sol
src/Caller.sol                   src/GPV2CompatibleAuction.sol
src/PriceManager.sol             src/WorkflowRouter.sol
src/interfaces/IAuctionCallback.sol
src/interfaces/IBaseAuction.sol
src/interfaces/IGPV2CompatibleAuction.sol
src/interfaces/IGPV2Settlement.sol
src/interfaces/IPriceManager.sol
src/libraries/Errors.sol         src/libraries/Roles.sol
```

## Where I spent the review

A Dutch auction that anyone can bid into, settling against an external solver
network, has a well-defined risk surface:

1. **Price descent and settlement timing.** Whether a bidder can influence when
   the clock is read, or settle at a price the auction was not offering.
2. **The callback boundary.** `IAuctionCallback` and the GPv2 settlement
   interface hand control to external code mid-flow — the classic place for
   reentrancy and for state read before it is final.
3. **`PriceManager` as the trust anchor.** Every auction resolves against the
   price this contract reports. Staleness handling and bounds on acceptable
   deviation are what stop a bad quote from becoming a bad fill.

## Outcome

**No accepted finding.** Reviewed and submitted; nothing survived judging.
