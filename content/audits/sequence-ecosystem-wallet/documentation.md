## What Sequence Ecosystem Wallet is

Sequence Ecosystem Wallet is a **non-custodial smart wallet** aimed at chains and
ecosystems that want to onboard users without seed phrases. It combines
passkeys, social auth, timed recovery keys and sandboxed session permissions.

The audited code is the **V3 implementation**: a minimal-proxy deployment model
plus a Merkle-proof-based configuration scheme. Rather than storing the full
signer set on chain, the wallet commits to a Merkle root of its configuration
and validates signers against proofs at use time. That keeps deployment and
updates cheap across many chains, and it moves the security question onto the
proof verification.

## Scope

47 files: the wallet core and factory, the configuration and signature
verification layer, the session/permission system, and the recovery module.

## Where I spent the review

A smart wallet's threat model is unusual — the attacker is often trying to
become an authorised signer rather than to drain a pool directly:

1. **Configuration integrity.** Whether a valid proof can be produced for a
   signer that was never in the committed tree. Merkle verification bugs
   (unsorted pairs, second-preimage on internal nodes, proofs of the wrong
   depth) are the direct path to wallet takeover.

2. **Session permission escape.** Sessions are meant to be sandboxed — limited
   targets, limited selectors, limited spend, limited lifetime. Each of those
   limits is a boundary worth testing, particularly whether a session can
   authorise a call that reconfigures the wallet itself.

3. **Recovery timing.** Timed recovery is a race by construction: the recovery
   key becomes usable after a delay, and the legitimate owner is supposed to be
   able to cancel. Whether the cancel path can be blocked, front-run or
   griefed is the question.

4. **Cross-chain replay.** Deterministic addresses across chains mean the same
   wallet exists at the same address everywhere, so any signature that omits a
   chain identifier from its domain is replayable.

## Outcome

**No accepted finding.** Reviewed and submitted; nothing survived judging.
