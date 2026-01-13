# Aurora — AA Primer (Base Account Abstraction)

Short overview of Base account abstraction concepts used in validation.

---

## Why AA matters for a read-only validator

Even if Aurora is read-only, addresses may be:
- an **EOA** (no bytecode at the address)
- a **smart account** (contract bytecode present)

So validation should never assume “wallet == EOA”.

---

## Key terms

### EOA (Externally Owned Account)
- Controlled by a private key
- `eth_getCode(address)` returns `0x`

### Smart Account (Contract Account)
- A deployed contract used as an account
- `eth_getCode(address)` returns bytecode
- May implement custom validation/execution logic

### Bundler
- Service that submits aggregated user intents (often called user operations)

### Paymaster
- Component that can sponsor gas or apply policy rules for execution

---

## Practical checks Aurora uses

- Use `eth_getCode` to classify address type (EOA vs contract)
- Keep chainId/RPC/explorer **config-driven**
- Treat config changes as high-risk and review carefully

_Last updated: initial scaffold_
