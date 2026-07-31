## What Nudge.xyz is

Nudge is a **campaign platform for incentivising token holding**. A sponsor funds
a campaign; users reallocate into the target token and earn rewards scaled by
how much they hold and for how long. A factory deploys and funds campaigns, and
a points-based variant runs the same idea without immediate token payout.

The economic shape is what matters: rewards are paid for *holding*, and holding
is measured on chain. Anything that lets a user appear to hold more, or for
longer, than they really did converts directly into stolen reward budget.

## Scope

7 contracts, ~641 lines:

```
NudgeCampaign         reallocation and reward distribution
NudgeCampaignFactory  deployment and funding
NudgePointsCampaigns  points-based variant
```

## Where I spent the review

1. **Reallocation accounting.** `handleReallocation` is the single function the
   whole reward model rests on. Whether it can be called on someone else's
   behalf, called twice, or called with amounts the caller never actually moved.

2. **Flash-loan-shaped holding.** If holding is sampled rather than integrated
   over time, a position held for one block can be indistinguishable from one
   held for a week. Any sampling boundary is an attack window.

3. **Campaign funding solvency.** Whether the factory's accounting of what a
   campaign is funded for can diverge from what the campaign will pay out.

4. **Griefing the reward path.** Reward distribution that can be made to revert
   for one user is a denial of service against their earnings, which is a Medium
   in most rulebooks.

## Outcome

**No accepted finding.** Reviewed and submitted; nothing survived judging.

The contest confirmed 4 Mediums across all wardens — unauthorised reward
reallocation, a DoS on `handleReallocation`, cross-chain token loss for smart
accounts, and reward manipulation via Uniswap V2 flash swaps. The first two sit
squarely in the areas I worked.
