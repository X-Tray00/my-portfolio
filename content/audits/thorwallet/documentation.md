## What THORWallet is

THORWallet is a non-custodial DeFi wallet. The audited contracts implement the
**TITN token migration**: holders exchange `ARB.TGT` for `ARB.TITN` on Arbitrum,
then bridge to `BASE.TITN` on Base using LayerZero's OFT standard.

The design splits holders into two classes. Tokens minted natively on Base move
freely. Tokens that arrived over the bridge are flagged as
`isBridgedTokenHolder` and — while `isBridgedTokensTransferLocked` is set — may
only be sent to a single admin-configured address, initially the staking
contract. The lock exists to stop bridged supply from being dumped on the market
before the team opens trading.

## Scope

Four files, a deliberately small surface:

```
contracts/Titn.sol
contracts/MergeTgt.sol
contracts/interfaces/IMerge.sol
contracts/interfaces/IERC677Receiver.sol
```

- **`Titn.sol`** — the OFT token, holding the transfer-restriction logic.
- **`MergeTgt.sol`** — the TGT → TITN merge, including vesting and the quantity
  math that decides how much TITN a given TGT deposit earns over time.

## Where I spent the review

A small scope means the interesting questions are about *state transitions*
rather than volume. The three I kept returning to:

1. **Can the transfer lock be escaped?** Every branch of `_validateTransfer()`
   is an exemption, and each exemption is a potential hole.
2. **Does the merge math stay solvent?** Whether the TGT→TITN curve can be
   drained faster than intended across the vesting window.
3. **Does bridging preserve the holder classification?** A token that loses its
   `isBridgedTokenHolder` flag in transit silently escapes the restriction.

Question 1 produced the finding. The `to != lzEndpoint` exemption meant a
restricted holder could send tokens *to the LayerZero endpoint* — which then
forwards them onward — and the lock no longer applied.

## Outcome

**1 High severity**, accepted. Contest rank 🥉 3rd. First contest I entered and
the first bug I submitted.
