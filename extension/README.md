# HERO Wallet — Chrome Extension

Privacy-first Web3 wallet for PulseChain, Base, and Ethereum. Built by veterans, for everyone.

## Architecture

The extension follows the **AmbireTech ambire-common** pattern with a shared module approach and **LavaMoat-inspired** security isolation.

| Module | Purpose | Context |
|--------|---------|---------|
| `src/background/` | Wallet controller, key management, transaction signing | Service Worker (isolated) |
| `src/popup/` | User interface (360x600px popup) | Extension popup |
| `src/content/` | DApp bridge, provider injection, anti-phishing | Web page (sandboxed) |
| `src/common/` | Shared types, chain configs, messaging utilities | Imported by all modules |

### Security Model

Private keys **never** leave the background service worker. The popup and content scripts communicate via Chrome's message passing API. All messages are typed and validated.

### Provider Standards

The extension implements **EIP-1193** (Ethereum Provider) and **EIP-6963** (Provider Discovery) for DApp connectivity. DApps can access the wallet via `window.heroWallet`.

## Build

```bash
cd extension
npm install
npm run build    # Production build → dist/
npm run dev      # Development build with watch
npm run zip      # Package for Chrome Web Store
```

## Load in Chrome (Development)

1. Run `npm run build`
2. Open `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked"
5. Select the `dist/` directory

## Features (v0.1.0 — BETA)

| Feature | Status |
|---------|--------|
| Wallet create/import | Scaffold |
| Password lock/unlock | Scaffold |
| PulseChain support | Scaffold |
| Base support | Scaffold |
| Ethereum support | Scaffold |
| Shield/Unshield (Railgun) | Scaffold |
| Swap (herobase.io redirect) | Working |
| Bridge | Scaffold |
| XP/Rank display | Working |
| DApp connection (EIP-1193) | Scaffold |
| Provider discovery (EIP-6963) | Working |
| Guardian Agent alerts | Scaffold |
| Anti-phishing | Scaffold |

## Manifest V3

Uses Chrome Manifest V3 with:
- Service worker background (no persistent background page)
- Content Security Policy for extension pages
- Web accessible resources for in-page provider injection

## Token Addresses

All token and LP pair addresses are sourced from herobase.io and verified on-chain (2026-04-28). See `src/common/chains.ts` for the complete list.

## License

Private — VetsInCrypto / HeroBase
