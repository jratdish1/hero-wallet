# HERO Wallet SDK

**ZK Privacy Wallet for PulseChain & Base** | Built on [Railgun SDK](https://github.com/Railgun-Community/wallet) | Open Source

---

## Overview

HERO Wallet is a zero-knowledge privacy wallet SDK designed for the HERO ecosystem on PulseChain and Base chains. It enables private transactions with full ZK-SNARK privacy, shielded balances, and cross-chain support.

Built on the battle-tested Railgun Wallet SDK (MIT License), HERO Wallet adds:
- **Native $HERO and $VETS token support** on PulseChain and Base
- **PulseChain network integration** (Chain ID: 369)
- **Base network integration** (Chain ID: 8453)
- **ZK privacy** for all transactions out of the box

The repo is written in TypeScript, and compatible with node.js and modern web browsers.

## Use Cases

HERO Wallet SDK enables developers to:

- [Shield ERC-20 tokens](https://railgun-privacy.gitbook.io/developer-guide/wallet/transactions/shielding/) including $HERO and $VETS
- Manage [shielded balances](https://railgun-privacy.gitbook.io/developer-guide/wallet/shielded-balances/) across PulseChain, Base, Ethereum, Polygon, and BSC
- [Transfer tokens](https://railgun-privacy.gitbook.io/developer-guide/wallet/transactions/private-transfers) privately
- [Interact with any smart contract](https://railgun-privacy.gitbook.io/developer-guide/wallet/transactions/cross-contract-calls) privately

## Supported Chains

| Chain | ID | Status |
|-------|-----|--------|
| PulseChain | 369 | Supported |
| Base | 8453 | Supported |
| Ethereum | 1 | Supported (upstream) |
| Arbitrum | 42161 | Supported (upstream) |
| Polygon | 137 | Supported (upstream) |
| BSC | 56 | Supported (upstream) |

## Important: Scaffold Status (v0.1.0)

> **WARNING:** This is a scaffold release. RAILGUN contract addresses on PulseChain and Base are **PLACEHOLDERS** (empty strings / 0x000...). ZK privacy features will NOT work until contracts are deployed on these chains. Token contract addresses for $HERO and $VETS are also placeholders that must be set to actual deployed addresses before production use. **DO NOT use this version with real funds.**

## Security

**ALL code changes go through mandatory ChatGPT 5.5 Codex security audit before merging.**

See `audits/` directory for audit reports. Commits tagged with `[CODEX-AUDITED]`.

### Audit History

| Version | Date | Result | Report |
|---------|------|--------|--------|
| v0.1.0 | 2026-04-28 | Conditional Pass | `audits/audit_v0.1.0_20260428.md` |

## Developer Guide

Please see the [Railgun developer guide](https://railgun-privacy.gitbook.io/developer-guide/wallet) for base SDK implementation details.

## Credits

- Built on [Railgun Wallet SDK](https://github.com/Railgun-Community/wallet) by Railgun Community (MIT License)
- HERO ecosystem by VetsInCrypto

## License

MIT License — See [LICENSE](./LICENSE) for details.
