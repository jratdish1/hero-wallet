# Railgun Deployment Research — April 2026

## Current Railgun Supported Chains (Official Deployments)

| Chain | Deployed | Proxy Address |
|-------|----------|---------------|
| Ethereum | ✅ | 0xfa7093cdd9ee6932b4eb2c9e1cde7ce00b1fa4b9 |
| Arbitrum | ✅ | 0xFA7093CDD9EE6932B4eb2c9e1cde7CE00B1FA4b9 |
| BSC | ✅ | (check bsc.ts) |
| Polygon | ✅ | (check polygon.ts) |
| Sepolia (testnet) | ✅ | (check sepolia.ts) |
| **Base** | ❌ NOT DEPLOYED | — |
| **PulseChain** | ❌ NOT DEPLOYED | — |
| Optimism | ❌ NOT DEPLOYED | — |
| Avalanche | ❌ NOT DEPLOYED | — |

## Key Contract Addresses (Ethereum Reference)

- **Proxy (main entry)**: 0xfa7093cdd9ee6932b4eb2c9e1cde7ce00b1fa4b9
- **Implementation**: 0x321617e18be9ec7cfe5ab8856de2aabaa478e13b
- **Delegator**: 0xb6d513f6222ee92fff975e901bd792e2513fb53b
- **Treasury Proxy**: 0xE8A8B458BcD1Ececc6b6b58F80929b29cCecFF40
- **RAIL Token**: 0xe76c6c83af64e4c60245d8c7de953df673a7a33d
- **Staking**: 0xee6a649aa3766bd117e12c161726b693a1b2ee20

## Implications for HERO Wallet

### Option A: Deploy Railgun Contracts on Base + PulseChain (Complex)
- Requires deploying full Railgun contract suite (proxy, implementation, poseidon hashes, relay adapt)
- Gas costs: Significant (multiple contract deployments)
- Governance: Would need DAO approval or fork
- Timeline: Weeks to months
- Risk: High — untested on these chains

### Option B: Use Existing Railgun Chains + Bridge (Recommended for MVP)
- Use Railgun on Ethereum/Arbitrum for ZK privacy
- Bridge assets to/from PulseChain and Base
- Privacy happens on Ethereum/Arbitrum, then bridge back
- Timeline: Days to implement
- Risk: Low — uses battle-tested contracts

### Option C: Privacy-Lite (Stealth Addresses Only)
- Implement EIP-5564 stealth addresses on Base + PulseChain
- No full ZK proofs, but provides address privacy
- Much simpler to deploy
- Timeline: 1-2 weeks
- Risk: Medium — less privacy than full Railgun

## Decision: Option B for MVP, Option A for v2.0

For HERO Wallet v1.0:
1. Wire up Railgun SDK with Ethereum + Arbitrum (where contracts exist)
2. Use bridge integration for PulseChain ↔ Ethereum and Base ↔ Ethereum
3. Privacy transactions route through Ethereum/Arbitrum Railgun contracts
4. Non-private transactions work directly on PulseChain/Base

For HERO Wallet v2.0:
1. Deploy Railgun contracts on Base (once Railgun DAO approves or we fork)
2. Deploy on PulseChain (community deployment)
3. Full native ZK privacy on all chains

## SDK Integration Notes

The Railgun Wallet SDK (`@railgun-community/wallet`) handles:
- Engine initialization with chain configs
- Wallet creation/import (mnemonic → spending/viewing keys)
- Private balance scanning (UTXO model)
- Transaction proof generation
- Broadcasting via relayers (no direct on-chain footprint)

Key SDK packages:
- `@railgun-community/wallet` — Main wallet SDK
- `@railgun-community/engine` — ZK proof engine
- `@railgun-community/deployments` — Contract addresses
- `@railgun-community/shared-models` — Type definitions
