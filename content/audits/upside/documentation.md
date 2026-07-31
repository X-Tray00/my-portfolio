## What Upside is

Upside lets users **tokenise a URL** and trade the resulting token. `tokenize()`
mints a token bound to a link, `swap()` trades it, and the owner configures fees
on both.

## Scope

2 contracts, **379 lines** — the smallest scope of anything listed here.

## Where I spent the review

A 379-line scope removes every excuse. There is no coverage strategy to get
wrong and no corner you did not have time to reach; if there is a bug, you either
found it or you missed it.

With the surface that small, I worked it exhaustively rather than by priority:

1. **Tokenisation front-running.** `tokenize()` binds a URL to a token. Anyone
   watching the mempool can see which URL is about to be claimed, which makes
   claim-ordering the obvious first question.
2. **Fee arithmetic at the boundaries.** Whether a trade small enough can round
   its fee to zero, and whether the fee recipient can be left as an address that
   cannot receive.
3. **Swap invariants.** Whether the curve can be pushed to a state where it
   prices at zero or reverts permanently.

## Outcome

**No accepted finding — and neither did anyone else.**

This contest closed with **zero High and zero Medium severity findings** across
every warden who entered. 27 reports were submitted and all of them landed as
Low or non-critical, including the front-running and fee-rounding observations
above.

I include it because a null result on a contest nobody cracked is a different
data point from a null result on a contest others solved, and the distinction is
worth being able to see.
