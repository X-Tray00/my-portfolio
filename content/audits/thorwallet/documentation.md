## Every exemption is a door someone left unlocked

That is the whole review in one line. `Titn.sol` guards transfers with a chain of
conditions, and each `&&` in that chain is a case the author decided *should not*
be blocked. Those decisions are where the bug lives, because a security check is
only as strong as its shortest escape route.

Here is the guard as shipped:

```solidity
function _validateTransfer(address from, address to) internal view {
    uint256 arbitrumChainId = 42161;

    if (
        from != owner() &&
        from != transferAllowedContract &&
        to != transferAllowedContract &&
        isBridgedTokensTransferLocked &&
        (isBridgedTokenHolder[from] || block.chainid == arbitrumChainId) &&
        to != lzEndpoint
    ) {
        revert BridgedTokensTransferLocked();
    }
}
```

Six conditions. Five of them are load-bearing. The sixth, `to != lzEndpoint`, is
the finding.

## Why that line exists, and why it fails

The intent is reasonable. TITN is a LayerZero OFT, so bridging necessarily sends
tokens *to* the endpoint contract. Block that and you break bridging.

The mistake is treating the endpoint as a destination rather than as a pipe.
Tokens sent there do not stop there. LayerZero forwards them onward to an
address the sender chooses, and the lock does not travel with them. So a
restricted holder does not need to defeat the check at all. They route around
it:

1. `isBridgedTokensTransferLocked` is true, direct transfers revert.
2. The restricted holder sends to `lzEndpoint` instead. Condition six is false,
   so the whole `if` is false, and no revert fires.
3. LayerZero delivers to a fresh address on the other side, where
   `isBridgedTokenHolder` was never set.
4. The tokens are now free.

The lock was meant to stop bridged supply from hitting the market before the
team opened trading. It stopped nothing.

## What the protocol is, for context

The audited contracts run TITN's migration. Holders swap `ARB.TGT` for
`ARB.TITN` on Arbitrum, then bridge to `BASE.TITN`. Tokens minted natively on
Base move freely. Tokens that arrived over the bridge get flagged and, while the
lock is on, may only go to one admin-set address, initially the staking
contract.

Four files, which is a small enough surface that coverage was never the
constraint:

```
contracts/Titn.sol
contracts/MergeTgt.sol
contracts/interfaces/IMerge.sol
contracts/interfaces/IERC677Receiver.sol
```

## The two things that did not pan out

Worth recording, because a review is not just its hits.

**The merge curve.** `MergeTgt.sol` decides how much TITN a TGT deposit earns
across a vesting window. I spent real time on whether the quantity maths could
be drained faster than intended by splitting deposits or timing them at period
boundaries. It holds up.

**Flag persistence across the bridge.** My first hypothesis was that
`isBridgedTokenHolder` might be lost in transit, letting tokens launder
themselves by round-tripping. That turned out to be handled. The irony is that
the actual bug made the flag irrelevant: no laundering needed when the endpoint
itself is an open door.

## Outcome

One High, accepted. Third place. It was my first contest and my first
submission, which is a piece of luck I do not expect to repeat.
