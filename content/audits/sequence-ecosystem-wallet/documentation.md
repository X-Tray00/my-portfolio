## The attacker does not want your funds, they want to be you

Most protocols in this list can be attacked by draining a pool. A smart wallet
usually cannot. There is no pool, only one user's assets behind one
authorisation model.

So the threat model inverts. The goal is not to move money directly, it is to
become an address the wallet believes is allowed to move it. Every question
below is a variation on that.

## Where the wallet keeps its trust

Sequence V3 does not store its signer set on chain. It commits to a Merkle root
of its configuration and validates signers against proofs when they are used,
which keeps deployment and updates cheap across many chains.

It also means the security of the wallet reduces to the correctness of a Merkle
verification. That is a good trade, and it concentrates the risk somewhere very
specific.

## Four ways to become a signer

**Forge a proof.** Can a valid proof be produced for a signer that was never in
the committed tree? Merkle verification bugs are a well-mapped family: unsorted
pair handling, second-preimage attacks on internal nodes, proofs accepted at the
wrong depth. Any of them ends in wallet takeover, so this went first.

**Escape a session.** Sessions are meant to be sandboxed: limited targets,
limited selectors, limited spend, limited lifetime. Each limit is a boundary to
test, and the sharpest question is whether a session can authorise a call that
reconfigures the wallet itself. That would turn a temporary permission into a
permanent one.

**Win the recovery race.** Timed recovery is a race by construction. A recovery
key becomes usable after a delay, and the real owner is supposed to cancel it if
it was not them. So: can the cancel path be blocked, front-run, or griefed?

**Replay across chains.** Deterministic addresses mean the same wallet exists at
the same address on every chain. A signature that does not bind a chain
identifier into its domain is a signature that works everywhere it was never
meant to.

## Scope

47 files: wallet core and factory, configuration and signature verification, the
session and permission system, and recovery. Passkeys and social auth sit on top
of all of it.

## Outcome

No accepted finding.
