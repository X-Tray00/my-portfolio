## What Float128 is

Forte's Float128 is a **signed floating-point library for Solidity** — a
128-bit format packed into a single `uint256`, with a mantissa, a base-10
exponent and a sign bit. Solidity has no native floating point, so protocols
needing wide dynamic range (AMM curves, interest accrual, options pricing) have
to either build fixed-point workarounds or take a dependency on something like
this.

That dependency shape is what makes a library audit different from a protocol
audit. There is no TVL to drain and no privileged role to abuse. The blast
radius is entirely *downstream*: every protocol that later integrates the
library inherits whatever is wrong with it, and inherits it silently.

## Scope

Three files, ~1,530 lines:

```
src/Float128.sol
src/Ln.sol
src/Types.sol
```

## Where I spent the review

For a math library the productive question is not "who can call this" but
**"what inputs did the author not think about"**. Concretely:

1. **Domain boundaries.** Every mathematical function has inputs where it is
   undefined — `ln(0)`, division by zero, roots of negatives. A library must
   reject them. Silently returning *something* is worse than reverting, because
   the caller has no way to detect it.
2. **Packing and unpacking round-trips.** Whether a value survives
   encode → decode unchanged across the whole representable range, including
   denormals and the exponent extremes.
3. **Precision loss under composition.** Individually acceptable rounding that
   compounds when operations are chained.

Line 1 produced the primary finding: **`ln(0)` did not revert.** Mathematically
`ln(0)` tends to negative infinity — it has no value. The implementation
computed and returned an arbitrary result instead. A lending protocol using it
for rate curves, or an AMM using it for pricing, would consume that number as if
it were valid.

## Outcome

**2 High severity**, both accepted. Contest rank #18.
