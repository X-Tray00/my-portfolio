---
title: "Locked Transfers Can Be Bypassed Using LayerZero Endpoint"
severity: high
submission: S-688
status: valid
note: "First contest. First finding."
---

## Description

The `Titn.sol` contract includes a transfer restriction mechanism that prevents certain addresses from transferring TITN tokens when `isBridgedTokensTransferLocked` is `true`. However, this restriction can be bypassed if the recipient is the LayerZero endpoint (`lzEndpoint`).

```solidity
function _validateTransfer(address from, address to) internal view {
    uint256 arbitrumChainId = 42161;

    if (
        from != owner() &&
        from != transferAllowedContract &&
        to != transferAllowedContract &&
        isBridgedTokensTransferLocked &&
        (isBridgedTokenHolder[from] || block.chainid == arbitrumChainId) &&
        to != lzEndpoint   // ← this exemption is the vulnerability
    ) {
        revert BridgedTokensTransferLocked();
    }
}
```

The `to != lzEndpoint` condition creates an unintended escape hatch: any restricted address can send tokens to the LayerZero endpoint, which then forwards them elsewhere — effectively circumventing the lock entirely.

## Impact

- **Lock bypass**: Users restricted from transferring TITN can route tokens through the LayerZero endpoint and forward them to unrestricted addresses.
- **Cross-chain exploitation**: Attackers can move locked TITN across chains, creating an unfair advantage over compliant users.
- **Broken trust assumptions**: The entire bridged token transfer lock mechanism is undermined, since the security guarantee it provides no longer holds.

## Proof of Concept — Simulated Attack

1. `isBridgedTokensTransferLocked` is set to `true` — direct transfers revert.
2. Restricted user attempts a normal transfer → blocked by `BridgedTokensTransferLocked()`.
3. Instead, the user sends TITN to `lzEndpoint` — the check passes due to the `to != lzEndpoint` exemption.
4. Via LayerZero bridging mechanisms, tokens are forwarded to a new address where restrictions no longer apply.
5. Transfer lock successfully bypassed. ✓

## Recommended Fix

Remove the `lzEndpoint` exemption from `_validateTransfer()`:

```solidity
function _validateTransfer(address from, address to) internal view {
    uint256 arbitrumChainId = 42161;

    if (
        from != owner() &&
        from != transferAllowedContract &&
        to != transferAllowedContract &&
        isBridgedTokensTransferLocked &&
        (isBridgedTokenHolder[from] || block.chainid == arbitrumChainId)
    ) {
        revert BridgedTokensTransferLocked();
    }
}
```

Additionally:
- Ensure all LayerZero bridging functions enforce transfer locks **before** processing transactions.
- Write unit tests confirming that tokens sent via LayerZero are still subject to the same restrictions.

## Affected Code

[Titn.sol#L71-L87](https://github.com/code-423n4/2025-02-thorwallet/blob/main/contracts/Titn.sol#L71-L87)
