# Aurora — Quickstart (Local)

Practical notes for running Aurora locally and interpreting output.

---

## What Aurora Does (Read-only)

Aurora performs **read-only** checks against Base Sepolia:
- RPC connectivity + latest block
- basic address probes (balance + `eth_getCode`)
- emits:
  - a JSON report in `reports/latest.json`
  - a sample run log in `logs/run.log` (or your local equivalent)

Aurora does **not** send transactions by default.

---

## 1) Configure the network

Aurora’s scripts read:
- `config/sepolia.network.json`

Confirm:
- `chainId` is `84532`
- RPC is HTTPS
- explorer base URL is `https://sepolia.basescan.org`

---

## 2) Use the address book

Repeatable probe inputs live here:
- `scripts/addressbook.json`

You can replace placeholders with your own addresses, but keep it **read-only**.

---

## 3) Run validation (typical flow)

A common script flow is:

1. Load `config/sepolia.network.json`
2. Connect to RPC and read `eth_blockNumber`
3. Probe addresses from `scripts/addressbook.json`
4. Print console-style output
5. Convert output to JSON with `scripts/export-report.ts`
6. Save to `reports/latest.json`

---

## 4) Interpreting the report

`reports/latest.json` is designed for CI/manual review:
- `status`: `PASS`/`FAIL`
- `network`: chainId, rpc, explorer
- `checks`: connectivity and consistency results
- `probes`: per-address results (balance/code)

If `status` is `FAIL`:
- try a fallback RPC from config
- compare with the previous report/log

---

## Troubleshooting

- RPC errors: switch to a fallback RPC and re-run
- Wrong explorer links: check `explorer.url` matches Sepolia
- Address type confusion: use `eth_getCode` (EOA returns `0x`)

_Last updated: initial scaffold_
