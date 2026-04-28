# HERO Wallet — Infrastructure Recommendation

**Author:** Manus AI  
**Date:** April 28, 2026  
**For:** VetsInCrypto (JR)

---

## Question 1: Do We Want a Dedicated HERO Wallet Server?

**Answer: Yes, absolutely.** A dedicated server for the HERO Wallet ecosystem is the correct call for three reasons.

First, **threat vector isolation**. If the wallet backend shares a server with trading bots, websites, or other services, a compromise in any of those systems could cascade into the wallet infrastructure. A financial application handling user assets demands its own attack surface — period. The VDS currently runs trading bots, watchdogs, and multiple services. Mixing wallet relayer operations with those workloads is an unnecessary risk.

Second, **resource predictability**. ZK proof generation is CPU-intensive. When a user shields or unshields tokens, the Railgun engine generates SNARK proofs that can spike CPU usage. If a trading bot is simultaneously hammering the CPU for WebSocket processing, proof generation could timeout or fail. Dedicated resources eliminate this contention.

Third, **regulatory clarity**. If the HERO ecosystem ever needs to demonstrate compliance (for app store approval, for example), having a clean, auditable server dedicated solely to wallet operations makes that process dramatically simpler.

### Contabo Recommendation

Given your existing Contabo relationship (Client ID: INT-14422637), here is the recommended configuration:

| Tier | Product | Specs | Monthly Cost (est.) | Use Case |
|------|---------|-------|-------------------|----------|
| **Recommended** | Contabo Cloud VDS S | 6 vCPU, 16 GB RAM, 200 GB NVMe, 1 Gbps | ~$18/mo | Wallet backend, relayer, Grok API proxy, security agent |
| Upgrade Path | Contabo Cloud VDS M | 8 vCPU, 30 GB RAM, 400 GB NVMe, 1 Gbps | ~$30/mo | If user base exceeds 10k active wallets |
| Maximum | Contabo Dedicated Server | 8-core AMD, 64 GB RAM, 1 TB NVMe | ~$65/mo | Full bare-metal isolation for production launch |

**Why VDS over VPS?** The VDS (Virtual Dedicated Server) guarantees 100% dedicated CPU and RAM resources — no noisy neighbors. For a financial application, this consistency matters. The VPS tier shares physical resources with other tenants, which can cause unpredictable latency spikes during proof generation.

**Why not bare-metal immediately?** The VDS S tier is sufficient for the development and beta phases. Scaling to bare-metal makes sense at production launch (Phase 4, Q1 2027) when real user load is measurable. Premature over-provisioning wastes money.

### Server Hardening Checklist (Day 1)

The dedicated wallet server should be hardened on deployment day with the following measures, consistent with the existing VDS hardening SOP:

| Category | Action |
|----------|--------|
| OS | Ubuntu 22.04 LTS, unattended-upgrades enabled |
| Firewall | UFW — allow only SSH (non-standard port), HTTPS (443), and relayer port |
| SSH | Key-only authentication, disable password auth, fail2ban with 5-attempt lockout |
| Secrets | All API keys in encrypted `/root/.env_architecture`, synced to backup |
| Monitoring | Uptime monitoring via existing watchdog, Telegram alerts on anomaly |
| Backups | Daily encrypted snapshots to separate Contabo storage |
| SSL | Let's Encrypt auto-renewal for wallet.herobase.io |
| Updates | Automated security patches, manual review for Node.js major versions |

---

## Question 2: Do We Want an Autonomous Agent Overlooking the HERO Wallet Ecosystem?

**Answer: Yes.** This is not optional for a financial product — it is a requirement.

The autonomous security agent should run on the dedicated wallet server (or on the VDS as a secondary monitor) and perform the following functions continuously:

### Agent Architecture

The agent operates as a lightweight daemon process with three monitoring loops:

**Loop 1 — Code Security (runs daily)**

This loop monitors the hero-wallet GitHub repository and all dependencies for known vulnerabilities. It runs `npm audit` against the latest dependency tree, checks the National Vulnerability Database (NVD) for CVEs affecting any package in the dependency chain, and compares the current codebase hash against the last Codex-audited hash. If any new vulnerability is detected, it generates a Telegram alert with severity, affected package, and recommended action.

**Loop 2 — Runtime Health (runs every 60 seconds)**

This loop monitors the wallet backend process, relayer connectivity, RPC endpoint availability, and system resources (CPU, RAM, disk). If any health check fails, it attempts self-healing (restart service, switch to backup RPC). If self-healing fails three times, it escalates via Telegram and optionally triggers a Manus API task for investigation.

**Loop 3 — Transaction Anomaly Detection (runs on every transaction)**

This loop analyzes transaction patterns in real-time. It flags anomalies such as: unusually large transactions, rapid successive transactions from the same address, interactions with known malicious contracts, and attempts to drain the rewards pool or treasury. Flagged transactions trigger an immediate Telegram alert and can optionally pause the relayer pending manual review.

### Agent Technology

| Component | Technology | Rationale |
|-----------|-----------|-----------|
| Runtime | Node.js (same as wallet backend) | Shared dependency tree, single language |
| AI Engine | Grok API (xAI) for anomaly analysis | Already integrated, fast inference |
| Alerting | Telegram Bot API | Existing infrastructure, proven reliable |
| Escalation | Manus API | For complex issues requiring investigation |
| Scheduling | PM2 with cron | Proven process management |

---

## Question 3: Grok AI Bot Integration

**Answer: Yes, integrate Grok as the wallet's AI layer.**

The Grok integration serves two purposes: user-facing intelligence (market analysis, transaction advice, security scanning) and backend intelligence (anomaly detection, log analysis, threat assessment).

### User-Facing Grok Features

The wallet UI includes a chat interface (similar to the Grok app) where users can ask questions about their portfolio, get market analysis, and receive transaction recommendations. This runs through the wallet backend API, which proxies requests to the xAI API using the verified key.

### Backend Grok Features

The autonomous security agent uses Grok for natural language analysis of transaction logs, smart contract code review, and threat intelligence synthesis. This is the "brains" behind the anomaly detection loop described above.

### API Key Management

The xAI/Grok API key is already verified and locked in across all servers. For the dedicated wallet server, the key will be stored in `/root/.env_architecture` following the existing secrets management SOP. The wallet backend reads it from environment variables — never hardcoded, never in client-side code.

---

## Summary of Recommendations

| Question | Answer | Action |
|----------|--------|--------|
| Dedicated server? | **Yes** | Order Contabo Cloud VDS S ($18/mo) for wallet-only operations |
| Autonomous agent? | **Yes** | Deploy security daemon with 3 monitoring loops + Telegram alerts |
| Grok AI? | **Yes** | Integrate as both user-facing assistant and backend security intelligence |
| All popular chains? | **Yes** | Phase 1: ETH, PulseChain, Base, Arbitrum, Polygon, BSC. Phase 2+: Avalanche, Optimism, Solana |

---

*All infrastructure decisions are documented here for the architectural blueprint. This document should be stored on the knowledge base GitHub alongside server blueprints.*
