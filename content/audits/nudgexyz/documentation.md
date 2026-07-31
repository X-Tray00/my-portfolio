## Paying people to hold means measuring holding

Nudge runs campaigns that reward users for holding a token. A sponsor funds a
campaign, users reallocate into the target asset, and rewards scale with how
much they held and for how long.

The economics decide the attack surface. Rewards are paid for a behaviour, and
that behaviour has to be measured on chain. So anything that makes a user
*appear* to have held more, or longer, than they really did converts directly
into stolen reward budget. No exploit of the token needed, just a
misrepresentation the contract accepts.

## Where the measurement can lie

**Reallocation accounting.** `handleReallocation` is the single function the
entire reward model rests on. Can it be called on someone else's behalf? Twice?
With amounts the caller never actually moved? Everything downstream trusts
whatever this function records.

**Holding that lasted one block.** If holding is sampled at points rather than
integrated over time, a position held for a single block can be
indistinguishable from one held for a week. Every sampling boundary is an attack
window, and flash loans make the capital requirement roughly zero.

**Campaign solvency.** Can the factory's accounting of what a campaign is funded
for diverge from what the campaign will actually pay out? The gap between
"funded" and "owed" is where a distribution contract becomes insolvent.

**Griefing the payout.** Reward distribution that can be made to revert for one
specific user is a denial of service against their earnings. That is a Medium in
most rulebooks and it is easy to miss, because the contract looks fine from
every other address.

## Scope

7 contracts, roughly 641 lines:

```
NudgeCampaign         reallocation and reward distribution
NudgeCampaignFactory  deployment and funding
NudgePointsCampaigns  points-based variant
```

## Outcome

No accepted finding.

The contest confirmed 4 Mediums across all wardens: unauthorised reward
reallocation, a DoS on `handleReallocation`, cross-chain token loss for smart
accounts, and reward manipulation via Uniswap V2 flash swaps. The first two sit
squarely in the areas above, which is the useful and uncomfortable detail.
