---
title: "Float128.eq() breaks logical equality for numerically equal values with different encodings"
severity: high
submission: S-31
status: valid
---

## Description

The `Float128.eq()` function attempts to determine equality between two `packedFloat` values by directly comparing their underlying bitwise encoding:

```solidity
function eq(packedFloat a, packedFloat b) internal pure returns (bool) {
    return packedFloat.unwrap(a) == packedFloat.unwrap(b);
}
```

However, this logic fails to account for the fact that the same mathematical value can be represented by multiple valid `packedFloat` encodings.

For example:

- `123.45` can be encoded as `12345e-2`, `123450e-3`, or `1234500e-4`
- All decode to the same numeric value: `1234500 × 10⁻⁴ = 123.45`
- Yet their packed representations differ, and `Float128.eq()` will return `false`

This creates a logical inconsistency: two values that are mathematically equal fail equality checks.

## Impact

This can lead to serious issues in downstream protocols:

- **Comparison-based logic**: Contracts relying on equality will behave incorrectly
- **Set-like behavior**: You cannot de-duplicate equivalent values
- **Mappings or lookups**: Equivalent values will hash differently and map incorrectly
- **Math-sensitive invariants**: Fail due to mismatches in logical float values

This undermines the correctness and trustworthiness of a core math utility and can silently break downstream protocols.

## Proof of Concept

```solidity
contract FloatEqualityPoC is Test {
    using Float128 for int256;
    using Float128 for packedFloat;

    function test_eqFailsForSameValueDifferentEncoding() public {
        packedFloat a = Float128.toPackedFloat(123450, -3);   // 123.45
        packedFloat b = Float128.toPackedFloat(1234500, -4);  // 123.45

        (int am, int ae) = Float128.decode(a);
        (int bm, int be) = Float128.decode(b);

        // Assert mathematical equality
        int vA = am * int(10 ** uint(-ae));
        int vB = bm * int(10 ** uint(-be));
        assertEq(vA, vB, "Decoded values must be equal");

        // eq() fails due to different bit encoding
        assertFalse(Float128.eq(a, b), "Float128.eq fails on equivalent values");
    }
}
```

**Terminal output:**

```
Ran 1 test for test/FloatEqualityPoC.t.sol:FloatEqualityPoC
[FAIL: Float128.eq fails on equivalent values] test_eqFailsForSameValueDifferentEncoding() (gas: 6946)
Suite result: FAILED. 0 passed; 1 failed; 0 skipped
```

## Recommended Fix

Rewrite `Float128.eq()` to compare decoded values in normalized form.

**Option 1 — Compare decoded values directly:**

```solidity
function eq(packedFloat a, packedFloat b) internal pure returns (bool) {
    (int am, int ae) = Float128.decode(a);
    (int bm, int be) = Float128.decode(b);
    return am == bm && ae == be;
}
```

**Option 2 (safer) — Normalize and compare:**

```solidity
function eq(packedFloat a, packedFloat b) internal pure returns (bool) {
    return Float128.normalize(a) == Float128.normalize(b);
}
```

## Affected Code

- [Float128.sol#L1064-L1072](https://github.com/code-423n4/2025-04-forte/blob/main/src/Float128.sol#L1064-L1072)
- [Float128.sol#L1074-L1135](https://github.com/code-423n4/2025-04-forte/blob/main/src/Float128.sol#L1074-L1135)
