# HERO Wallet — Architecture Blueprint v0.3

**Document Version:** 0.3.0
**Last Updated:** April 28, 2026
**Author:** Manus AI / VetsInCrypto
**Status:** Active Development

---

## Executive Summary

HERO Wallet is a privacy-first, multi-chain cryptocurrency wallet powered by the Railgun SDK for zero-knowledge shielded transactions. It serves as the primary gateway into the HERO ecosystem on PulseChain and Base, with planned expansion to 8+ chains. The wallet integrates directly with herobase.io for all swap, DAO, and farming operations, while maintaining its own rewards engine, gamification system, and autonomous security monitoring.

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    HERO WALLET ECOSYSTEM                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐     │
│  │  Web Frontend │    │  Mobile App  │    │  Telegram Bot │     │
│  │  wallet.      │    │  iOS/Android │    │  Notifications│     │
│  │  herobase.io  │    │  React Native│    │  & Commands   │     │
│  └──────┬───────┘    └──────┬───────┘    └──────┬───────┘     │
│         │                    │                    │              │
│  ┌──────┴────────────────────┴────────────────────┴──────┐     │
│  │              HERO WALLET BACKEND API                    │     │
│  │         (Dedicated Contabo VDS S Server)                │     │
│  ├────────────────────────────────────────────────────────┤     │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌──────────┐   │     │
│  │  │ Rewards │ │  Swap   │ │ Security│ │  Grok AI │   │     │
│  │  │ Engine  │ │ Router  │ │ Watchdog│ │  Scanner │   │     │
│  │  └─────────┘ └─────────┘ └─────────┘ └──────────┘   │     │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌──────────┐   │     │
│  │  │ Claim   │ │  Buy &  │ │ NFT     │ │ Guardian │   │     │
│  │  │ Handler │ │  Burn   │ │ Checker │ │  Agent   │   │     │
│  │  └─────────┘ └─────────┘ └─────────┘ └──────────┘   │     │
│  └────────────────────────────────────────────────────────┘     │
│                              │                                   │
│  ┌───────────────────────────┴───────────────────────────┐     │
│  │              BLOCKCHAIN LAYER                          │     │
│  ├────────────────────────────────────────────────────────┤     │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌──────────┐   │     │
│  │  │PulseChain│ │  Base   │ │Ethereum │ │ Arbitrum │   │     │
│  │  │ (369)   │ │ (8453)  │ │  (1)    │ │ (42161)  │   │     │
│  │  └─────────┘ └─────────┘ └─────────┘ └──────────┘   │     │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌──────────┐   │     │
│  │  │ Polygon │ │   BSC   │ │Avalanche│ │ Optimism │   │     │
│  │  │  (137)  │ │  (56)   │ │ (43114) │ │   (10)   │   │     │
│  │  └─────────┘ └─────────┘ └─────────┘ └──────────┘   │     │
│  └────────────────────────────────────────────────────────┘     │
│                              │                                   │
│  ┌───────────────────────────┴───────────────────────────┐     │
│  │              PRIVACY LAYER (Railgun SDK)               │     │
│  │  • ZK-SNARK Proofs  • Shielded Balances               │     │
│  │  • Private Swaps    • Anonymous Transfers              │     │
│  └────────────────────────────────────────────────────────┘     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Fee Structure (v0.3.0)

| Allocation | Percentage | Destination | Purpose |
|-----------|-----------|-------------|---------|
| HERO Treasury | 70% | Treasury multisig | Charities via VIC Foundation 501(c)(3) |
| Rewards Pool | 20% | Rewards contract | Distributed to users (HERO or USDC) |
| Wallet Overhead | 5% | Operations wallet | Server costs, maintenance, development |
| Buy & Burn | 5% | Dead address | Deflationary pressure on $HERO supply |

**NFT Discount:** HERO NFT holders receive 2% off all fees.

---

## Token Registry (Hardcoded)

| Symbol | Chain | Contract Address | Status |
|--------|-------|-----------------|--------|
| HERO | PulseChain | `0x35a51Dfc82032682E4Bda8AAcA87B9Bc386C3D27` | Verified |
| VETS | PulseChain | `0x4013abBf94A745EfA7cc848989Ee83424A770060` | Verified |
| TruFarm | PulseChain | `0xCA942990EF21446Db490532E66992eD1EF76A82b` | Verified |
| EMIT | PulseChain | `0x32fB5663619A657839A80133994E45c5e5cDf427` | Verified |
| RhinoFi | PulseChain | `0x6C6D7De6C5f366a1995ed5f1e273C5B3760C6043` | Verified |
| YEP | PulseChain | `0xE08FC6Ce880D36a1167701028c0ae84dc3e82b8f` | Verified |
| HEX | PulseChain | `0x2b591e99afe9f32eaa6214f7b7629768c40eeb39` | Verified |
| WPLS | PulseChain | `0xA1077a294dDE1B09bB078844df40758a5D0f9a27` | Verified |
| WETH | PulseChain | `0x02DcdD04e3F455D838cd1249292C58f3B79e3C3C` | Verified |
| PLS | PulseChain | Native | Active |

---

## Module Function Layout

### 1. Rewards Engine (`src/hero/rewards/rewards-engine.ts`)

```
HeroRewardsEngine
├── constructor(config: RewardsConfig)
├── processTransactionFee(tx: Transaction)
│   ├── calculateFee() → applies NFT discount
│   ├── allocateTreasury(70%)
│   ├── allocateRewards(20%)
│   ├── allocateOverhead(5%)
│   └── executeBuyAndBurn(5%)
├── claimRewards(walletAddress, preference: HERO|USDC)
│   ├── mutex lock (prevent concurrent claims)
│   ├── validateWallet()
│   ├── calculatePendingRewards()
│   ├── routeAutoSwap() → if USDC selected
│   └── transferToWallet()
├── updateConfig(newConfig) → owner-only
├── getRewardsBalance(wallet)
├── getRankMultiplier(wallet)
└── executeBuyAndBurn() → owner/DAO-only
```

### 2. Claim Handler (`src/hero/rewards/claim-handler.ts`)

```
ClaimHandler
├── initiateClaim(wallet, rewardType)
│   ├── verifyEligibility()
│   ├── calculateAmount(base × rankMultiplier)
│   ├── routeSwap() → via AutoSwapRouter
│   └── executeTransfer()
├── getClaimHistory(wallet)
├── getPendingAmount(wallet)
└── estimateClaimGas(wallet)
```

### 3. Auto-Swap Router (`src/hero/rewards/auto-swap-router.ts`)

```
AutoSwapRouter
├── getQuote(tokenIn, tokenOut, amount)
│   ├── queryPulseX()
│   ├── query9inch()
│   ├── queryLibertySwap()
│   └── selectBestRoute()
├── executeSwap(route, slippage)
│   ├── validateMinAmountOut() → quote-based minimum
│   ├── buildTransaction()
│   └── submitToChain()
├── executeBuyAndBurnSwap(amount)
│   ├── getQuote(HERO → dead address)
│   └── executeWithSafeMinimum()
└── getSupportedPairs()
```

### 4. Gamification (`src/hero/gamification/rank-system.ts`)

```
RankSystem
├── getRank(wallet) → E-1 through O-1
├── getXP(wallet)
├── addXP(wallet, amount, action)
├── getMultiplier(rank) → 1.0x to 2.0x
├── getAchievements(wallet)
├── checkLevelUp(wallet)
└── getLeaderboard(limit)
```

### 5. Security Watchdog (`src/hero/security/watchdog.ts`)

```
HeroWalletWatchdog
├── startMonitoring()
├── recordTransaction(tx) → mutex-guarded
├── checkHealth()
│   ├── rpcLatency()
│   ├── contractStatus()
│   └── balanceThresholds()
├── detectAnomaly(tx)
│   ├── velocityCheck()
│   ├── amountThreshold()
│   └── patternAnalysis()
├── triggerCircuitBreaker()
├── selfHeal()
└── reportStatus() → Telegram
```

### 6. Grok AI Integration (`src/hero/integrations/grok-ai.ts`)

```
GrokAIScanner
├── scanContract(address)
├── analyzeMarket(token)
├── detectAnomalies(txHistory)
├── analyzeSecurityLogs(logs)
└── generateReport()
```

### 7. Herobase.io Connector (`src/hero/integrations/herobase-connector.ts`)

```
HerobaseConnector
├── getSwapQuote(params)
├── executeSwap(params)
├── getDAOProposals()
├── castVote(proposalId, vote)
├── getFarmingPools()
├── stakeLiquidity(pool, amount)
└── getPortfolio(wallet)
```

### 8. Telegram Alerts (`src/hero/notifications/telegram-alerts.ts`)

```
TelegramAlertService
├── sendSecurityAlert(message)
├── sendTransactionAlert(tx)
├── sendRankUpNotification(wallet, newRank)
├── sendSelfHealReport(action)
├── sendDailyDigest()
└── escapeMarkdown(text) → injection prevention
```

---

## Security Architecture

### Dedicated Infrastructure

| Component | Specification | Purpose |
|-----------|--------------|---------|
| Server | Contabo VDS S | Isolated wallet backend |
| CPU | 3 Physical Cores (AMD EPYC) | Compute-intensive ZK proofs |
| RAM | 24 GB | Railgun engine + monitoring |
| Storage | 180 GB NVMe | Fast state access |
| Network | 250 Mbit/s + DDoS Protection | Resilient connectivity |
| Region | US-East | Low latency |

### Security Layers

1. **Network:** UFW firewall, fail2ban, DDoS protection (Contabo built-in)
2. **Access:** SSH key-only, no root login, 2FA for admin
3. **Application:** Rate limiting, input validation, mutex locks
4. **Privacy:** Railgun ZK-SNARK shielded transactions
5. **Monitoring:** Watchdog + Guardian Agent (Claude Code) + Grok AI
6. **Audit:** Every code change runs through Codex audit SOP
7. **Alerts:** Telegram escalation for all anomalies

---

## Roadmap

### Phase 1 — Scaffold (COMPLETE)
- [x] Core wallet class with input validation
- [x] PulseChain + Base network configs
- [x] Token registry (10 community tokens)
- [x] Rewards engine (70/20/5/5)
- [x] Gamification rank system
- [x] Multi-chain support (8 chains)
- [x] Herobase.io connector
- [x] Grok AI integration
- [x] Telegram notifications
- [x] Security watchdog
- [x] Codex audit (all PASS)
- [x] Web frontend (wallet.herobase.io)

### Phase 2 — Infrastructure (IN PROGRESS)
- [x] Order Contabo VDS S (awaiting provisioning)
- [ ] Harden server (UFW, fail2ban, SSH keys)
- [ ] Deploy wallet backend API
- [ ] Set up wallet.herobase.io subdomain
- [ ] Deploy Guardian Agent (Claude Code)
- [ ] Wire up Telegram bot

### Phase 3 — Integration
- [ ] Deploy/bridge Railgun contracts to PulseChain
- [ ] Wire up Railgun engine in HeroWallet.initialize()
- [ ] Connect to herobase.io live API
- [ ] Implement cross-chain swap aggregation
- [ ] $5 test transaction on testnet

### Phase 4 — Mobile & Launch
- [ ] React Native mobile app (iOS + Android)
- [ ] TestFlight beta onboarding
- [ ] HERO NFT collection launch
- [ ] Whitepaper publication
- [ ] Public launch

---

## Herobase.io Integration Points

| Feature | URL | Integration |
|---------|-----|-------------|
| Primary Swaps | herobase.io/swap | Deep link from wallet |
| DAO Voting | herobase.io/dao | Embedded iframe or deep link |
| Farming | herobase.io/farm | Stake/unstake via connector |
| Portfolio | herobase.io/portfolio | Shared wallet state |
| Wallet | wallet.herobase.io | Dedicated subdomain |

---

## Answers to Infrastructure Questions

### Q: Do we want a dedicated HERO Wallet server?
**A: YES.** Absolutely. A dedicated server limits the blast radius of any security incident. The wallet handles private keys and financial transactions — it must be isolated from trading bots, mining ops, and other workloads. The Contabo VDS S ($37.12/mo base + $12.10 US-East = $49.22/mo) provides dedicated physical cores (not shared vCPU), 24GB RAM, and built-in DDoS protection.

### Q: Contabo recommendation for scalability and security?
**A: Cloud VDS S** is the sweet spot. Physical cores ensure consistent performance for ZK proof generation. 24GB RAM handles the Railgun engine comfortably. The 12-month term locks in pricing. If traffic scales beyond capacity, Contabo allows vertical upgrades to VDS M/L without migration.

### Q: Autonomous agent overlooking the ecosystem?
**A: YES — the HERO Guardian Agent.** A Claude Code-powered autonomous agent running 24/7 on the dedicated VDS. It monitors code for vulnerabilities, watches on-chain activity, scans dependencies for CVEs, and escalates via Telegram. Combined with Grok AI for real-time contract scanning and market anomaly detection.

---

## SOP Directives (Permanent)

1. Every code change requires Codex security audit before GitHub push
2. HERO Wallet VDS S is SOLELY dedicated to the wallet — no other workloads
3. Server must be hardened per the Server Hardening SOP
4. All transactions are ZK-shielded via Railgun by default
5. Guardian Agent monitors 24/7 with Telegram escalation
6. Whitepaper auto-generates when wallet is finalized

---

*Document maintained in: `hero-wallet/docs/BLUEPRINT_v0.3.md`*
*GitHub: https://github.com/jratdish1/hero-wallet*
