## A library audit has no TVL and no blast radius limit

Every other review here has a number attached: this much locked, these many
users. Float128 had neither. Nothing was deployed on top of it yet.

That inverts the usual severity logic. There is no pool to drain and no
privileged role to abuse, so nothing you find can be exploited today. What you
find instead is a defect that every future integrator inherits, silently,
forever. A lending protocol wiring this into its rate curve does not get a
warning. It gets a number.

So the question stops being "who can call this" and becomes:

> what input did the author never consider, and what does the function return
> when it gets one?

## The domain boundary

Every mathematical function has inputs where it is undefined. `ln(0)` is the
classic one: the natural logarithm tends to negative infinity as its argument
approaches zero, so at exactly zero there is no value to return. Not a large
value. Not a small one. None.

A library has exactly two acceptable behaviours here. Revert, or return an
explicit error the caller must handle. `Ln.sol` did neither. It computed
something and returned it, and the caller had no way to tell that number apart
from a real result.

Picture the downstream. An AMM prices a swap through a log curve, feeds in a
zero balance during some edge state, and gets back an arbitrary value that looks
like a price. Nothing reverts. Nothing logs. The trade settles.

That is why this is a High on a library with zero TVL. The severity is not about
what it costs now, it is about the fact that it fails quietly.

## Scope

Three files, roughly 1,530 lines:

```
src/Float128.sol
src/Ln.sol
src/Types.sol
```

The format packs a mantissa, a base-10 exponent and a sign bit into a single
`uint256`. Solidity has no native floating point, so protocols needing wide
dynamic range either build fixed-point workarounds or take a dependency on
something like this.

## The three questions I worked

1. **Domain boundaries.** Undefined inputs across every exported function, not
   just `ln`. Division by zero, roots of negatives, the exponent extremes.
2. **Pack and unpack round-trips.** Whether a value survives encode then decode
   unchanged across the full representable range, including denormals where the
   mantissa loses its leading digit.
3. **Precision under composition.** Rounding that is fine once and unacceptable
   after being chained through four operations, which is how these libraries are
   actually used.

Line one produced both findings. Lines two and three came up clean, which is a
genuinely good sign for a library this dense.

## Outcome

Two Highs, both accepted. Contest rank #18.
