---
title: "FERC20.burnFrom() reduces user balance but not totalSupply, leading to inflation risk and accounting mismatch"
severity: medium
submission: S-686
status: valid
---

## Description

The `burnFrom()` function in `FERC20.sol` reduces a user's token balance but fails to update the `_totalSupply` variable. This results in an inconsistency between the token balances held by all accounts and the reported total supply.

```solidity
function burnFrom(address user, uint256 amount) public onlyOwner {
    require(user != address(0), "Invalid address");
    _balances[user] = _balances[user] - amount;
    emit Transfer(user, address(0), amount);
}
```

Because `_totalSupply` is not decremented, any burn will make the contract report a larger supply than what actually exists.

## Impact

This breaks key ERC20 invariants and can lead to:

- **Incorrect price and market cap calculations**
- **Voting power or staking logic being skewed**, if they rely on `totalSupply`
- **Integration mismatches** in analytics dashboards, exchanges, or bridges
- **Economic risk** if assumptions about circulating supply are violated

The bug also introduces silent accounting drift over time as more tokens are "burned" but not removed from supply.

## Proof of Concept

**Initial conditions:** contract deployed with supply of 1,000,000 tokens.

```
_totalSupply == 1_000_000
_balances[msg.sender] == 1_000_000
```

The owner calls:

```solidity
burnFrom(msg.sender, 100_000);
```

After execution:

```
_balances[msg.sender] == 900_000   ✓
_totalSupply           == 1_000_000 ✗ (unchanged — this is the bug)
```

The ERC20 invariant `sum(balances) == totalSupply` is broken. Token trackers and contracts depending on accurate `totalSupply()` (governance, vaults, staking) will behave incorrectly.

## Recommended Fix

Decrement `_totalSupply` alongside the balance:

```solidity
function burnFrom(address user, uint256 amount) public onlyOwner {
    require(user != address(0), "Invalid address");

    _balances[user] -= amount;
    _totalSupply -= amount;

    emit Transfer(user, address(0), amount);
}
```

This ensures:
- `totalSupply()` accurately reflects the circulating supply
- External tools, on-chain integrations, and accounting mechanisms remain consistent
- The `sum(balances) == totalSupply` invariant is maintained

## Affected Code

[FERC20.sol#L136-L140](https://github.com/code-423n4/2025-04-virtuals-protocol/blob/main/contracts/fun/FERC20.sol#L136-L140)
