## 379 lines and nowhere to hide

Upside tokenises URLs. `tokenize()` mints a token bound to a link, `swap()`
trades it, and the owner sets fees on both. Two contracts, 379 lines, the
smallest scope of anything listed here.

A scope this size removes every excuse a reviewer normally has. There is no
coverage strategy to get wrong, no contract you ran out of time before reaching,
no defensible reason to have missed something. Either you found it or you did
not.

So I worked it exhaustively rather than by priority, which is a luxury you get
exactly once per contest of this size.

## What I went after

**Tokenisation front-running.** `tokenize()` binds a URL to a token, and the
binding is first come first served. Anyone watching the mempool can see which
URL is about to be claimed. Claim ordering is the obvious first question and the
obvious first thing an attacker tries.

**Fee arithmetic at the edges.** Can a trade be small enough that its fee rounds
to zero? Can the fee recipient be set to an address that cannot receive, wedging
the path for everyone?

**Swap invariants.** Can the curve be driven into a state where it prices at
zero, or reverts permanently and strands whatever is in it?

## Outcome

No accepted finding, and neither did anybody else.

This contest closed with zero Highs and zero Mediums across every warden who
entered. 27 reports were submitted and all of them landed as Low or
non-critical, including the front-running and fee-rounding observations above.

I list it deliberately. A null result on a contest nobody cracked is a different
data point from a null result on a contest others solved, and a portfolio that
cannot tell you which is which is not telling you much.
