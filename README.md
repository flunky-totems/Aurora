# Aurora

## About

Aurora is a read-only inspector built for the Base ecosystem. It is meant for fast validation on **Base Sepolia**: confirm your network context, verify wallet connectivity, and generate Basescan references for deployed contracts—without submitting transactions.

## Why this repo exists

Aurora is useful when you want to:
- sanity-check that your environment is pointed at Base Sepolia
- confirm the expected chainId is in use (84532)
- quickly inspect wallet balances, nonces, and whether an address contains bytecode
- cross-check onchain state via Basescan (deployment + “Code” tab links)
- run an optional ABI-free `eth_call` selector probe for tooling compatibility

## Network targets

Primary:
- Base Sepolia
- chainId (decimal): 84532
- Explorer: https://sepolia.basescan.org

Reference (documentation context only):
- Base Mainnet chainId (decimal): 8453

## What the script prints

Aurora outputs:
- connected wallet address, balance (ETH), and tx count (nonce)
- a compact network snapshot (latest block + gas metrics)
- a probe report for a small set of testnet contract addresses, including Basescan links
- an optional raw `eth_call` selector read (no ABI) for quick compatibility testing

All outputs are designed to be independently verifiable on Basescan.

## Repository structure

- app/
  - aurora.ts  
  Read-only script for wallet connection + Base Sepolia inspection.

- contracts/  
  Solidity contracts deployed to Base Sepolia for testnet validation:
  - BaseTimeLockVault.sol — a timelock vault contract that allows users to deposit ETH and lock it until a specified unlock timestamp


- config/  
  - sepolia.network.json — RPC + explorer + chainId configuration used by local scripts

- docs/  
  - quickstart.md — practical notes for running Aurora locally and interpreting output
  - aa-primer.md — short overview of Base account abstraction concepts used in validation

- scripts/  
  - addressbook.json — saved addresses used during repeatable inspections
  - export-report.ts — converts console-style output into a small JSON report (optional helper)

- reports/  
  - latest.json — example output format for CI or manual review

- logs/  
  - run.log — sample execution log captured from a validation run

- LICENSE  
  MIT license text.

- package.json  
  Dependency manifest with Base + Coinbase references.

## Installation and running

Install dependencies with your preferred Node package manager, then run the script in an environment where a wallet connection prompt can be shown. Approve the Coinbase Wallet request when prompted.

Aurora is read-only by design:
- it does not call `eth_sendTransaction`
- it does not sign messages
- it only uses standard RPC reads and `eth_call`

## License

MIT

## Testnet Deployment (Base Sepolia)

As part of pre-production validation, one or more contracts may be deployed to the Base Sepolia test network to confirm correct behavior and tooling compatibility.

Network: Base Sepolia  
chainId (decimal): 84532  
Explorer: https://sepolia.basescan.org  

Contract BaseTimeLockVault.sol address:  
0x3E9A7D2C8F5B6A1E4D0C9B7F2A6E8D5C1F4A9B0E

Deployment and verification:
- https://sepolia.basescan.org/address/0x3E9A7D2C8F5B6A1E4D0C9B7F2A6E8D5C1F4A9B0E
- https://sepolia.basescan.org/0x3E9A7D2C8F5B6A1E4D0C9B7F2A6E8D5C1F4A9B0E/0#code  

These testnet deployments provide a controlled environment for validating Base tooling, account abstraction flows, and read-only onchain interactions prior to Base Mainnet usage.

## Author

GitHub: https://github.com/flunky-totems

Email: flunky_totems.0p@icloud.com
