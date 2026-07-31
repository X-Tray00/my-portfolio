## 67 files, a fixed clock, and one question worth asking first

Virtuals was the biggest scope of the three contests where I landed something,
and big scopes punish you for reading in file order. You run out of time in the
middle of the alphabet.

The heuristic I used: **rank contracts by how many other contracts depend on
their assumptions.** A bug in a leaf contract hurts that contract. A bug in the
token everything is denominated in hurts everything above it.

That put `FERC20` first, ahead of the DAO contracts and the agent factory, and
that is where the finding was.

## The invariant

Any custom ERC-20 implementation has one property that must hold after every
single operation:

> the sum of all balances equals `totalSupply()`

Mint raises both sides. Burn lowers both sides. Transfer moves value between
balances and leaves supply alone. Any function touching either side has to
preserve the equality, including protocol-specific extras bolted on later.

`burnFrom()` did not. It reduced the holder's balance and never decremented
`_totalSupply`. Every burn widened the gap permanently, and nothing in the
contract could close it again.

## Why that is a Medium and not cosmetic

No funds move, which is why this is not a High. But `totalSupply()` is read as
ground truth in more places than people expect:

- Circulating supply displays and market cap, which are simply wrong afterwards.
- Any on-chain logic computing a share as `balance / totalSupply`, which now
  under-reports every holder's proportion.
- Governance weight, if voting power is ever derived from supply.

The drift is monotonic and irreversible. It never self-corrects, it only grows
with each burn.

## What Virtuals actually is

A launchpad for tokenised AI agents. Each agent gets its own token, contributors
stake and share revenue, and a governance layer sits over the top: `veVirtual`
for non-transferable voting weight, a protocol DAO, and a separate Genesis DAO
for launching new agents.

The scope clustered into four areas:

- **Agent lifecycle:** `AgentFactoryV2`, `AgentNftV2`, validator registration.
- **Token layer:** `FERC20` and the bonding curves.
- **Governance:** `veVirtualToken`, `VirtualProtocolDAO`, `VirtualGenesisDAO`.
- **Staking and rewards:** contribution accounting and distribution.

## Outcome

One Medium, accepted. Contest rank #64.

The rank is worth reading honestly. This contest confirmed 32 unique
vulnerabilities across all wardens, 6 of them High. I found one accounting bug
in a scope where far more was available, which says the prioritisation got me to
a real finding but not to the deepest ones.
