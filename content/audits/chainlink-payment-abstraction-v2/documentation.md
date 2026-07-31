## Replacing a router with an auction changes who you have to trust

Chainlink services get paid in many tokens across many chains. Node operators
get paid in LINK. Payment Abstraction is the machinery closing that gap: collect
fees in whatever arrives, consolidate onto one chain over CCIP, convert to LINK,
route it to a withdrawal contract.

V1 did the conversion through Uniswap V3. V2 replaces that with a permissionless
Dutch auction settling through CowSwap.

That swap is the whole review. A router is a function call with a predictable
outcome. An auction is a game with participants, timing, and an external solver
network deciding how it clears. The protocol stops asking "did the swap execute
correctly" and starts asking "can a participant make this clear in their
favour".

## Three places that question lands

**Price descent and settlement timing.** A Dutch auction prices by clock: the
price falls until someone bids. So can a bidder influence when the clock is
read, or settle at a price the auction was not offering at that moment? Anything
that decouples the observed price from the real one is the bug.

**The callback boundary.** `IAuctionCallback` and the GPv2 settlement interface
hand control to external code partway through the flow. That is the classic
setting for reentrancy, and more subtly for reading state before it is final.
Callbacks are where an auction stops being a closed system.

**`PriceManager` as trust anchor.** Every auction resolves against the price
this contract reports. Staleness handling and bounds on acceptable deviation are
the only things stopping a bad quote from becoming a bad fill. In a system whose
entire purpose is converting value, the price oracle is the solvency boundary.

## Scope

13 files:

```
src/AuctionBidder.sol            src/BaseAuction.sol
src/Caller.sol                   src/GPV2CompatibleAuction.sol
src/PriceManager.sol             src/WorkflowRouter.sol
src/interfaces/…                 src/libraries/{Errors,Roles}.sol
```

## Outcome

No accepted finding. The contest report has not been published, so there is no
public link for this one yet.
