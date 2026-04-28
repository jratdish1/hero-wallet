# AmbireTech Research Notes

**Date**: 2026-04-28
**Source**: https://github.com/AmbireTech

## Key Findings

### What Ambire Is
- **Self-custodial smart wallet** for EVM ecosystem
- **EIP-7702 ready** — next-gen account abstraction standard
- **Cross-platform**: Single codebase for browser extensions (Chrome, Firefox, Safari), mobile (iOS/Android), and web apps
- **Built with**: React Native + React Native Web (Expo bare workflow)
- **License**: GPL-3.0 (open source)
- **Team**: 21 people, Estonia/Bulgaria
- **Stars**: 62 (extension), 222 (wallet)
- **Releases**: 160+ (v6.5.1 latest)

### Architecture (Relevant to HERO Wallet)
- Uses `ambire-common` submodule for shared business logic across all platforms
- Hybrid React Native + React Native Web approach
- Webpack-based extension builds (webkit + gecko)
- LavaMoat + SES for security hardening of background service worker
- E2E tests with Playwright
- Source maps management for store releases

### Cross-Chain Features
- Supports all EVM networks
- Account abstraction (smart accounts)
- EIP-7702 support (delegate transactions)
- Multi-network gas management

### What's Useful for herobase.io
1. **Cross-chain architecture pattern** — Their shared business logic approach (ambire-common) mirrors our modular design
2. **Extension build pipeline** — Webpack configs for Chrome/Firefox/Safari builds
3. **LavaMoat security** — Hardened service worker (prevents supply chain attacks)
4. **React Native Web hybrid** — Same code for extension + mobile
5. **EIP-7702 support** — Future-proofing for account abstraction

### What to Adopt for HERO Wallet
- [ ] Study their extension manifest and build pipeline for Phase 7
- [ ] Evaluate LavaMoat for our extension security
- [ ] Consider React Native Web hybrid approach (matches our Phase 7 plan)
- [ ] Reference their store submission workflow (webkit/gecko builds)
- [ ] Their `ambire-common` pattern validates our `src/hero/` modular approach

### What NOT to Use
- Their full wallet implementation (too complex, different token ecosystem)
- Their GraphQL mesh (we don't need it)
- Their Uniswap fork (we use PulseX/9inch/LibertySwap)
