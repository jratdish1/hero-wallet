# HERO Wallet — Feature Specification & Roadmap v1.0

**Author:** VetsInCrypto (JR) | Manus AI  
**Date:** April 28, 2026  
**Status:** DRAFT — Pending Community Review  
**Repository:** [github.com/jratdish1/hero-wallet](https://github.com/jratdish1/hero-wallet)  
**License:** MIT (Open Source)

---

## 1. Executive Summary

HERO Wallet is a zero-knowledge privacy wallet built on the Railgun SDK, designed to serve the HERO ecosystem across PulseChain and Base networks. Unlike generic privacy wallets, HERO Wallet integrates a **rewards economy**, **gamification layer**, and **direct connection to herobase.io** for all DeFi operations including swaps, trading, DAO governance, and yield farming.

The wallet's fee model directs **80% of collected fees to the HERO Treasury** to support charitable causes, while the remaining **20% sustains the wallet rewards ecosystem** — creating a self-reinforcing flywheel where using the wallet funds both community good and user incentives.

This specification draws architectural inspiration from ZKX Wallet [1] (also built on Railgun SDK architecture) while adding HERO-specific innovations in tokenomics, gamification, and ecosystem integration.

---

## 2. Core Privacy Features

HERO Wallet inherits the full Railgun privacy stack and extends it with HERO-specific functionality. The table below maps ZKX Wallet's proven feature set to HERO Wallet's implementation plan.

| Feature | ZKX Reference | HERO Wallet Implementation |
|---------|--------------|---------------------------|
| **Shield** | Transform public assets to private with single tap | Shield any ERC-20 into HERO's ZK privacy pool via Railgun engine |
| **Unshield** | Exit privacy pool to interact with public dApps | One-tap unshield to interact with herobase.io and external dApps |
| **Private Send** | Send assets without trace on public scanners | ZK-SNARK private transfers across all supported chains |
| **Stealth Receive** | Generate one-time stealth addresses | Stealth address generation for receiving without exposing main wallet |
| **Swap & Bridge** | Integrated best-rate aggregators | Route through herobase.io for best-rate swaps; cross-chain bridging |
| **Public/Private Toggle** | UI toggle between modes | Privacy is default; public mode opt-in for dApp interaction |
| **Gas Tank** | Prepaid gas abstraction | Gas abstraction via relayer network; no native gas needed for private txs |
| **Multi-Chain** | Full EVM ecosystem support | PulseChain, Base, Ethereum, Arbitrum, Polygon, BSC + expansion |

### 2.1 Privacy Architecture

The wallet operates on a **"private by default, public by choice"** paradigm. All transactions within the HERO Wallet use ZK-SNARK proofs to validate without revealing sender, recipient, or amount. The Railgun engine handles Poseidon hashing, Merkle tree management, and Proof of Innocence (POI) verification.

> **Non-custodial guarantee:** HERO Wallet never touches user funds. Private keys are generated and stored locally on the user's device. The wallet SDK provides the cryptographic tooling; custody remains with the user at all times.

---

## 3. Rewards System

### 3.1 Dual Reward Option

Users earn rewards for every transaction conducted through HERO Wallet. At the point of reward distribution, users choose their preferred reward currency:

| Reward Option | Description | Use Case |
|--------------|-------------|----------|
| **$HERO Token** | Native ecosystem governance and utility token | Users who want to accumulate governance power and ecosystem participation |
| **USDC Stablecoin** | USD-pegged stablecoin | Users who prefer stable, predictable value |

The reward rate scales with the user's **HERO Rank** (see Section 4: Gamification). Base reward rate starts at 0.5% of transaction value, scaling up to 2.0% at the highest rank.

### 3.2 Fee Distribution Model

Every transaction through HERO Wallet generates a small fee (configurable, starting at 0.3% of transaction value). This fee is split according to a fixed, transparent, on-chain ratio:

| Allocation | Percentage | Destination | Purpose |
|-----------|-----------|-------------|---------|
| **HERO Treasury** | 80% | Treasury multisig address | Fund charitable initiatives, ecosystem grants, community development |
| **Rewards Pool** | 20% | Rewards contract | Sustain user reward payouts and ecosystem incentives |

The 20% rewards allocation is used to purchase either $HERO tokens or USDC (depending on user preference) from the open market via herobase.io's DEX, creating natural buy pressure for $HERO while ensuring reward sustainability.

### 3.3 Treasury Transparency

The HERO Treasury address is publicly visible on-chain. A real-time dashboard on herobase.io displays total fees collected, charitable distributions, and reward payouts — full transparency, no black boxes.

---

## 4. Gamification System

To drive retention and engagement, HERO Wallet implements a rank-based gamification system inspired by military service tiers (fitting the VetsInCrypto brand).

### 4.1 HERO Rank System

| Rank | Title | XP Required | Reward Multiplier | Perks |
|------|-------|------------|-------------------|-------|
| E-1 | Recruit | 0 | 1.0x (0.5%) | Basic wallet features |
| E-3 | Lance Corporal | 500 XP | 1.2x (0.6%) | Custom wallet themes |
| E-5 | Sergeant | 2,000 XP | 1.5x (0.75%) | Priority relayer access |
| E-7 | Gunnery Sergeant | 10,000 XP | 2.0x (1.0%) | DAO voting weight bonus |
| E-9 | Sergeant Major | 50,000 XP | 3.0x (1.5%) | Governance proposal rights |
| O-1 | Lieutenant | 100,000 XP | 4.0x (2.0%) | Treasury allocation voting |

### 4.2 XP Earning Activities

Users earn experience points (XP) through productive wallet usage, not speculation:

| Activity | XP Earned | Cooldown |
|----------|----------|----------|
| Shield tokens (first time per token) | 100 XP | Once per token |
| Complete a private send | 25 XP | None |
| Complete a swap via herobase.io | 50 XP | None |
| Bridge assets cross-chain | 75 XP | None |
| Hold shielded balance for 7+ days | 200 XP | Weekly |
| Refer a new wallet user | 500 XP | None |
| Participate in DAO vote | 150 XP | Per proposal |
| Complete daily login streak (7 days) | 100 XP | Weekly |

### 4.3 Achievements & Badges

Special one-time achievements unlock commemorative NFT badges stored in the user's shielded wallet:

- **First Shield** — Shield your first token
- **Privacy Pioneer** — Complete 100 private transactions
- **Chain Hopper** — Use 3+ different chains
- **Diamond Hands** — Hold shielded balance for 90+ days
- **Community Hero** — Refer 10 users
- **Governance Warrior** — Vote on 10 DAO proposals

---

## 5. Herobase.io Integration

HERO Wallet is not a standalone product — it is the **gateway to the entire HERO ecosystem** hosted at herobase.io. The wallet connects directly to herobase.io for all primary DeFi operations.

### 5.1 Integration Points

| Function | Integration | Description |
|----------|------------|-------------|
| **Swaps** | herobase.io DEX | All token swaps route through herobase.io's aggregator for best rates |
| **Trading** | herobase.io Trading | Limit orders, market orders, and advanced trading features |
| **DAO** | herobase.io Governance | Vote on proposals, submit governance actions, view treasury |
| **Farming** | herobase.io Farms | Stake LP tokens, earn yield, compound rewards |
| **Portfolio** | herobase.io Dashboard | Unified view of all positions across chains |

### 5.2 Subdomain: wallet.herobase.io

The web version of HERO Wallet will be hosted at **wallet.herobase.io**, providing browser-based access to the full wallet experience. This subdomain serves as the primary entry point for new users and the web-based companion to the mobile apps.

### 5.3 Deep Linking

The mobile app supports deep links to herobase.io functions, enabling seamless transitions between the wallet and the DeFi platform without re-authentication.

---

## 6. Multi-Chain Support

HERO Wallet supports all major EVM chains, enabling users to swap from any popular chain into the HERO ecosystem on PulseChain and Base.

### 6.1 Supported Chains

| Chain | Chain ID | Privacy Level | Status |
|-------|---------|--------------|--------|
| **PulseChain** | 369 | Bridge-based (via Railgun on Ethereum) | Phase 1 |
| **Base** | 8453 | Pending native Railgun deployment | Phase 1 |
| **Ethereum** | 1 | Full native Railgun privacy | Phase 1 |
| **Arbitrum** | 42161 | Full native Railgun privacy | Phase 1 |
| **Polygon** | 137 | Full native Railgun privacy | Phase 1 |
| **BSC** | 56 | Full native Railgun privacy | Phase 1 |
| **Avalanche** | 43114 | Standard (no ZK) | Phase 2 |
| **Optimism** | 10 | Standard (no ZK) | Phase 2 |
| **Solana** | N/A | Bridge only | Phase 3 |

### 6.2 Cross-Chain Flow

The primary use case is enabling users on any chain to enter the HERO ecosystem:

```
Any Chain → Bridge → PulseChain/Base → herobase.io → $HERO/$VETS
```

For privacy-enabled chains (Ethereum, Arbitrum, Polygon, BSC), the full shield/unshield flow is available. For non-Railgun chains, standard bridging is used with privacy applied on the destination chain.

---

## 7. Grok AI Integration

HERO Wallet integrates Grok (xAI) as an embedded AI assistant for real-time market intelligence and wallet guidance.

### 7.1 Grok Features in HERO Wallet

| Feature | Description |
|---------|-------------|
| **Market Analysis** | Real-time price analysis, trend detection, and sentiment for $HERO, $VETS, and portfolio tokens |
| **Transaction Advisor** | AI-powered suggestions for optimal swap timing, gas optimization, and route selection |
| **Security Scanner** | Analyze token contracts before interaction — flag honeypots, rug pulls, and suspicious contracts |
| **Portfolio Insights** | Natural language portfolio summaries, P&L analysis, and rebalancing suggestions |
| **Help & Onboarding** | Conversational help for new users learning privacy features |

The Grok integration uses the xAI API (key stored securely on the wallet server, never exposed to client) and communicates via the wallet's backend API.

---

## 8. Notifications, Failsafes & Security Hardening

### 8.1 Telegram Notifications

| Alert Type | Trigger | Priority |
|-----------|---------|----------|
| Large transaction (>$100) | Shield/unshield/send exceeding threshold | High |
| Failed transaction | Any tx failure or revert | Critical |
| Reward earned | Reward distribution event | Low |
| Rank up | XP milestone reached | Medium |
| Security alert | Suspicious activity detected | Critical |
| Daily digest | Portfolio summary, P&L, rewards earned | Low |

### 8.2 Failsafe Architecture

The HERO Wallet backend implements the same failsafe pattern proven on the trading infrastructure:

| Component | Function |
|-----------|----------|
| **Health Monitor** | Checks wallet backend, relayer, and RPC endpoints every 60 seconds |
| **Self-Heal** | Auto-restarts crashed services, switches to backup RPCs on failure |
| **Watchdog** | Independent process monitors the health monitor itself |
| **Manus API Escalation** | If self-heal fails 3x, escalates to Manus API for human-in-the-loop intervention |
| **Circuit Breaker** | Halts all transactions if anomalous patterns detected (e.g., rapid drain) |

### 8.3 Security Hardening Checklist

The wallet server and all components undergo the following hardening:

| Category | Measure |
|----------|---------|
| **Network** | UFW firewall (only required ports), fail2ban, DDoS protection |
| **SSH** | Key-only auth, non-standard port, rate limiting |
| **Secrets** | All keys in encrypted env files, never in code or logs |
| **Dependencies** | Weekly `npm audit`, automated CVE scanning |
| **Code** | Mandatory Codex audit per SOP before every push |
| **Monitoring** | 24/7 uptime monitoring, anomaly detection, log aggregation |
| **Backup** | Daily encrypted backups to separate location |
| **Updates** | Automated security patches, manual review for major updates |

### 8.4 Autonomous Security Agent

A dedicated AI agent (powered by Claude Code or Manus API) continuously monitors the HERO Wallet ecosystem:

| Function | Description |
|----------|-------------|
| **Code Review** | Scans for new vulnerabilities in dependencies and codebase |
| **Log Analysis** | Monitors transaction logs for anomalous patterns |
| **Threat Intel** | Tracks known exploit vectors and proactively patches |
| **Incident Response** | Auto-generates incident reports and initiates containment |
| **Compliance** | Ensures POI (Proof of Innocence) compliance across all transactions |

---

## 9. Mobile Application

### 9.1 Technology Stack

| Component | Technology |
|-----------|-----------|
| **Framework** | React Native (cross-platform: iOS + Android) |
| **Privacy Engine** | Railgun SDK (TypeScript, compatible with React Native) |
| **State Management** | Zustand or Redux Toolkit |
| **Navigation** | React Navigation |
| **Secure Storage** | react-native-keychain (biometric-protected) |
| **Push Notifications** | Firebase Cloud Messaging + Telegram Bot API |

### 9.2 Distribution

| Platform | Method | Timeline |
|----------|--------|----------|
| **iOS** | TestFlight (beta) → App Store (production) | Phase 4 |
| **Android** | Direct APK (beta) → Google Play (production) | Phase 4 |
| **Web** | wallet.herobase.io (PWA) | Phase 2 |
| **Browser Extension** | Chrome Web Store | Phase 3 |

---

## 10. Development Roadmap

### Phase 1: Foundation (Current — Q2 2026)

| Task | Status | Notes |
|------|--------|-------|
| Fork Railgun SDK | DONE | github.com/jratdish1/hero-wallet |
| Scaffold HERO module | DONE | PulseChain, Base, tokens, wallet class |
| Codex security audit | DONE | v0.1.0 — PASS |
| Feature specification | DONE | This document |
| Rewards system scaffold | IN PROGRESS | See Phase 2 code |
| Gamification scaffold | IN PROGRESS | See Phase 2 code |

### Phase 2: Core Features (Q3 2026)

| Task | Target |
|------|--------|
| Rewards contract design | July 2026 |
| Gamification engine | July 2026 |
| herobase.io API integration | August 2026 |
| wallet.herobase.io subdomain | August 2026 |
| Multi-chain bridge integration | August 2026 |
| Grok AI integration | September 2026 |
| Web wallet MVP | September 2026 |

### Phase 3: Security & Infrastructure (Q4 2026)

| Task | Target |
|------|--------|
| Dedicated wallet server deployment | October 2026 |
| Telegram notification system | October 2026 |
| Failsafe/watchdog/overwatch | October 2026 |
| Autonomous security agent | November 2026 |
| Security hardening audit | November 2026 |
| Browser extension (Chrome) | December 2026 |

### Phase 4: Mobile & Launch (Q1 2027)

| Task | Target |
|------|--------|
| React Native mobile app | January 2027 |
| TestFlight beta (iOS) | February 2027 |
| Android APK beta | February 2027 |
| App Store / Google Play submission | March 2027 |
| Whitepaper publication | March 2027 |
| Public launch | March 2027 |

---

## 11. Known Dependencies & Blockers

| Blocker | Impact | Mitigation |
|---------|--------|-----------|
| Railgun contracts not deployed on PulseChain | No native ZK privacy on PulseChain | Use bridge-based approach via Ethereum Railgun (like LibertySwap) [2] |
| Railgun contracts not deployed on Base | No native ZK privacy on Base | Lobby Railgun community for Base deployment; use bridge in interim |
| $HERO/$VETS contract addresses are placeholders | Cannot test token-specific features | Set real addresses when available; all code validates for zero-address |
| Railgun engine integration is TODO | Wallet cannot perform actual ZK operations | Scaffold is ready; wire up when contract addresses confirmed |

---

## References

[1]: https://zkxwallet.com/ "ZKX Wallet — Private & Secure Crypto Wallet"
[2]: https://docs.libertyswap.finance/liberty-swap-2.0/privacy-features/railgun-private-mode "LibertySwap RAILGUN Private Mode Documentation"
[3]: https://docs.railgun.org/wiki/learn/integrating-railgun "Railgun SDK Integration Documentation"
[4]: https://github.com/Railgun-Community/wallet "Railgun Community Wallet SDK Repository"

---

*This specification is a living document. Updates will be tracked in the hero-wallet repository under `docs/`. All changes require Codex security audit per SOP.*
