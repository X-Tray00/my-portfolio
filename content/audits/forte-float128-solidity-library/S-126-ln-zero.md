---
title: "ln(0) does not revert, violating mathematical invariants and silently returning invalid result"
severity: high
submission: S-126
status: valid
---

## Description

In mathematical terms, the natural logarithm of zero is undefined, tending toward negative infinity. Any reliable numerical system must guard against such input to avoid nonsensical or misleading outputs.

In the Float128 library, calling `ln()` with a `packedFloat` value representing zero does not revert or throw an error. Instead, it silently computes and returns an arbitrary result. This behavior contradicts mathematical expectations and can lead to undefined behavior in higher-level protocols that rely on this library.

This issue is especially dangerous because:

- Zero is a special, well-defined value in the library: its canonical form is a mantissa of all zeroes and exponent `-8192`.
- The documentation explicitly emphasizes normalization and special handling of zero.
- Calling `ln(0)` should be considered an invalid operation and must revert, similar to `1 / 0`.

## Impact

- **Mathematical inconsistency**: protocols relying on `ln()` for calculations involving small or zero values will behave incorrectly.
- **Silent errors**: dependent protocols (e.g., AMMs, lending rates, interest curves) may silently compute wrong values.
- **Downstream propagation**: operations that trust the result may propagate invalid values or precision errors.

## Proof of Concept

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "src/Float128.sol";

contract LnZeroPoC is Test {
    using Float128 for int256;
    using Float128 for packedFloat;

    function test_lnZeroShouldRevert() public {
        packedFloat zero = int256(0).toPackedFloat(-8192); // Canonical zero

        // Expect revert when computing ln(0)
        vm.expectRevert();
        zero.ln();
    }
}
```

**Terminal output:**

```
Ran 1 test for test/LnZeroPoC.t.sol:LnZeroPoC
[FAIL: next call did not revert as expected] test_lnZeroShouldRevert() (gas: 63682)
Suite result: FAILED. 0 passed; 1 failed; 0 skipped; finished in 1.20ms
```

## Recommended Fix

In the implementation of `Float128.ln(packedFloat x)`, add an explicit check at the beginning:

```solidity
require(x != ZERO, "ln undefined for zero");
```

Alternatively, decode the mantissa and revert if it is zero:

```solidity
(int256 mantissa, ) = decode(x);
require(mantissa != 0, "ln undefined for zero");
```

This prevents accidental or malicious misuse and aligns with both mathematical standards and developer expectations.

## Affected Code

[Ln.sol#L56-L77](https://github.com/code-423n4/2025-04-forte/blob/main/src/Ln.sol#L56-L77)
