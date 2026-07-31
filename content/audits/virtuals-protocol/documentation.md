## What Virtuals Protocol is

Virtuals is a launchpad for **tokenised AI agents**. Each agent gets its own
token; contributors stake, propose upgrades and share in the agent's revenue.
Around that sits a governance layer — `veVirtual` for non-transferable voting
weight, a protocol DAO, and a separate Genesis DAO for launching new agents.

## Scope

67 files — the largest surface of the three contests where I landed a finding.
The clusters that mattered:

- **Agent lifecycle** — `AgentFactoryV2`, `AgentNftV2`, validator registration
  and the application/execution flow.
- **Token layer** — `FERC20`, the ERC-20 implementation agent tokens are built
  on, plus the bonding-curve contracts.
- **Governance** — `veVirtualToken`, `VirtualProtocolDAO`, `VirtualGenesisDAO`.
- **Staking and rewards** — contribution accounting and reward distribution.

## Where I spent the review

With 67 files and a fixed clock, coverage strategy matters more than depth on
any single contract. I prioritised by **how many other contracts depend on a
given assumption** — a bug in a leaf contract hurts that contract, a bug in the
token everything is denominated in hurts everything.

That put `FERC20` first, and specifically its **ERC-20 invariants**. The one
worth checking on any custom token implementation is:

> the sum of all balances must equal `totalSupply()`, always

Mint, burn, transfer and any protocol-specific hook all have to preserve it.
`burnFrom()` did not: it reduced the holder's balance without decrementing
`_totalSupply`. Every burn permanently inflated the reported supply relative to
the tokens that actually existed.

That breaks anything reading supply as ground truth — circulating-supply
displays, market-cap calculations, and any on-chain logic computing a share as
`balance / totalSupply`.

## Outcome

**1 Medium severity**, accepted. Contest rank #64.
