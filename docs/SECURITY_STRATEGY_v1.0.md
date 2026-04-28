# HERO Wallet — Comprehensive Security Strategy v1.0

**Classification**: CONFIDENTIAL — Internal Use Only
**Author**: Manus Security Engineering
**Date**: 2026-04-28
**Version**: 1.0
**Status**: ACTIVE

---

## Executive Summary

The HERO Wallet is a multi-chain cryptocurrency wallet handling real user funds across PulseChain, Base, Ethereum, and Arbitrum. This document defines the complete security strategy covering architecture, threat modeling, defense-in-depth controls, operational security, and incident response.

The strategy follows a **military-grade defense-in-depth** approach: multiple independent security layers ensure that no single point of failure can compromise user funds.

---

## 1. Security Architecture Overview

### 1.1 Defense-in-Depth Layers

```
Layer 7: User Interface    → Input validation, CSP, anti-phishing
Layer 6: Application Logic → Business rule enforcement, rate limiting
Layer 5: Guardian Agent    → Autonomous anomaly detection, emergency freeze
Layer 4: Cryptographic     → ZK proofs, encrypted storage, key derivation
Layer 3: Network           → TLS 1.3, RPC failover, DDoS mitigation
Layer 2: Infrastructure    → Hardened VDS, firewall, SSH key-only
Layer 1: Physical          → Contabo datacenter security, geographic redundancy
```

### 1.2 Trust Boundaries

| Boundary | Trust Level | Controls |
|----------|-------------|----------|
| User ↔ Wallet UI | Untrusted | Input validation, CSRF protection, CSP |
| Wallet UI ↔ Backend API | Semi-trusted | JWT auth, rate limiting, request signing |
| Backend ↔ Blockchain RPC | External | Multi-RPC failover, response validation |
| Backend ↔ Railgun Engine | Internal | Process isolation, memory encryption |
| Guardian ↔ All Systems | Privileged | Separate process, audit logging |
| Admin ↔ Infrastructure | Highly Privileged | SSH keys, 2FA, IP allowlist |

---

## 2. Threat Model (STRIDE Analysis)

### 2.1 Spoofing

| Threat | Impact | Mitigation |
|--------|--------|------------|
| Phishing wallet UI | Fund theft | Domain verification, CSP headers, anti-phishing warnings |
| Fake RPC endpoints | Transaction manipulation | Hardcoded trusted RPCs, response validation |
| Impersonated Telegram alerts | Social engineering | Signed messages, unique alert IDs |

### 2.2 Tampering

| Threat | Impact | Mitigation |
|--------|--------|------------|
| Modified transaction data | Wrong recipient/amount | Client-side signing, pre-sign verification display |
| Tampered RPC responses | False balance/state | Multi-RPC consensus (2-of-3 agreement) |
| Modified wallet binary | Backdoor | Code signing, integrity checks, reproducible builds |

### 2.3 Repudiation

| Threat | Impact | Mitigation |
|--------|--------|------------|
| Denied transactions | Dispute resolution | Immutable blockchain records, local tx log |
| Denied admin actions | Accountability | Audit trail on VDS, Guardian Agent logging |

### 2.4 Information Disclosure

| Threat | Impact | Mitigation |
|--------|--------|------------|
| Private key exposure | Complete fund loss | AES-256-GCM encryption at rest, memory wiping |
| Transaction graph analysis | Privacy loss | Railgun ZK shielding, bridge-to-privacy routing |
| RPC metadata leakage | IP/activity correlation | Tor-compatible RPC option, VPN recommendation |

### 2.5 Denial of Service

| Threat | Impact | Mitigation |
|--------|--------|------------|
| RPC endpoint overload | Wallet unusable | Multi-RPC failover (3+ endpoints per chain) |
| Guardian Agent crash | Security blind spot | Watchdog auto-restart, Telegram crash alerts |
| DDoS on wallet.herobase.io | Service unavailable | Cloudflare proxy, rate limiting, geo-blocking |

### 2.6 Elevation of Privilege

| Threat | Impact | Mitigation |
|--------|--------|------------|
| Admin key compromise | Full system access | Separate admin keys, time-locked operations |
| Smart contract exploit | Fund drain | Audited contracts, upgrade timelock, emergency freeze |
| Server root access | Data exfiltration | SSH key-only, fail2ban, no password auth |

---

## 3. Key Management Strategy

### 3.1 User Key Hierarchy

```
Master Seed (BIP-39 Mnemonic)
├── HD Derivation Path: m/44'/60'/0'/0/x (EVM standard)
├── Encryption: AES-256-GCM with user password
├── Storage: Encrypted in LevelDB on device/VDS
└── Backup: User-managed (12/24 word mnemonic)
```

### 3.2 System Key Hierarchy

```
Infrastructure Keys
├── VDS SSH Key (Ed25519, 4096-bit)
├── Telegram Bot Token (env var, never in code)
├── RPC API Keys (env var, rotated quarterly)
├── Guardian Agent Signing Key (for alert verification)
└── Deployment Keys (GitHub Actions, CI/CD)
```

### 3.3 Key Rotation Schedule

| Key Type | Rotation Frequency | Trigger Events |
|----------|-------------------|----------------|
| User wallet keys | Never (user-controlled) | Compromise suspected |
| SSH keys | Annually | Staff change, compromise |
| API keys | Quarterly | Exposure, staff change |
| Telegram bot token | Annually | Compromise |
| JWT signing secret | Monthly | Routine |
| RPC API keys | Quarterly | Rate limit issues |

### 3.4 Key Storage Rules

1. **NEVER** store private keys in source code
2. **NEVER** log private keys or mnemonics
3. **ALWAYS** use environment variables for secrets
4. **ALWAYS** encrypt keys at rest with AES-256-GCM
5. **ALWAYS** wipe key material from memory after use
6. **ALWAYS** use hardware-backed key storage when available

---

## 4. Guardian Agent Security Model

### 4.1 Autonomous Threat Response

The Guardian Agent operates as an independent security process with the authority to:

| Action | Trigger | Reversibility |
|--------|---------|---------------|
| Alert (Telegram) | Any anomaly detected | N/A |
| Rate limit | TX count exceeds threshold | Auto-resets after window |
| Block transaction | High-value + unknown recipient | Manual override required |
| Emergency freeze | Critical threat detected | Admin authorization to lift |
| Self-heal (restart) | Service degradation | Automatic |

### 4.2 Guardian Configuration Hardening

```typescript
// PRODUCTION GUARDIAN CONFIG
{
  maxTxAmountUsd: 10_000,      // Alert on transfers > $10k
  maxTxPerHour: 50,             // Rate limit at 50 tx/hour
  maxGasMultiplier: 3.0,        // Alert if gas > 3x average
  enableEmergencyFreeze: true,  // Circuit breaker enabled
  monitorIntervalMs: 30_000,    // Check every 30 seconds
  enableSelfHealing: true,      // Auto-restart on failure
}
```

### 4.3 Guardian Isolation

- Runs as separate process (not in wallet process space)
- Has READ-ONLY access to blockchain state
- WRITE access limited to: freeze flag, alert system, log files
- Cannot sign transactions or access private keys
- Monitored by Watchdog (guardian-of-the-guardian)

---

## 5. Privacy Strategy (Railgun Integration)

### 5.1 Privacy Levels

| Level | Description | Use Case |
|-------|-------------|----------|
| Transparent | Standard on-chain TX | Everyday swaps, small amounts |
| Shielded | Railgun ZK proof | Large transfers, privacy-sensitive |
| Bridge-to-Privacy | Bridge → Shield → Transfer | PulseChain/Base privacy needs |

### 5.2 Privacy Routing Rules

```
IF chain has native Railgun (ETH, ARB, BSC, POLY):
  → Direct ZK shielded transfer
  
IF chain is PulseChain:
  → Bridge to Ethereum → Shield → Transfer → Unshield → Bridge back
  
IF chain is Base:
  → Bridge to Arbitrum → Shield → Transfer → Unshield → Bridge back
  
IF user selects "Transparent":
  → Standard EVM transfer (no privacy overhead)
```

### 5.3 Privacy Threat Mitigations

| Threat | Mitigation |
|--------|------------|
| Timing correlation | Random delay injection (1-30 min) |
| Amount correlation | Split into multiple shielded transfers |
| Bridge metadata | Use privacy-preserving bridges (when available) |
| RPC IP logging | Recommend VPN/Tor for privacy transactions |

---

## 6. Infrastructure Security

### 6.1 VDS Hardening Checklist

- [x] SSH key-only authentication (password disabled)
- [x] fail2ban configured (5 attempts → 1 hour ban)
- [x] UFW firewall (only ports 22, 80, 443 open)
- [x] Automatic security updates (unattended-upgrades)
- [x] Non-root service accounts for all processes
- [x] Log rotation configured (30-day retention)
- [ ] CrowdSec community blocklist (pending VDS S)
- [ ] Wireguard VPN for admin access (pending VDS S)

### 6.2 Network Security

```
Internet → Cloudflare (DDoS protection, WAF)
        → Nginx (reverse proxy, rate limiting, TLS termination)
        → Node.js API (application logic)
        → LevelDB (encrypted wallet data)
        → Blockchain RPCs (multi-endpoint failover)
```

### 6.3 Monitoring Stack

| Component | Tool | Alert Channel |
|-----------|------|---------------|
| Server health | apex_health_probe.sh | Telegram |
| Application errors | Guardian Agent | Telegram |
| Security events | fail2ban + Guardian | Telegram |
| Uptime | apex-health.timer (5 min) | Telegram |
| SSL expiry | Certbot auto-renew | Telegram on failure |

---

## 7. Smart Contract Security

### 7.1 Contract Interaction Rules

1. **NEVER** approve unlimited token allowances
2. **ALWAYS** verify contract addresses against known-good list
3. **ALWAYS** simulate transactions before signing
4. **ALWAYS** display human-readable transaction details to user
5. **NEVER** interact with unverified contracts without explicit user consent

### 7.2 Known-Good Contract Registry

All contract addresses are hardcoded in `src/hero/config/`:
- Token contracts (verified on-chain)
- Railgun proxy contracts (from official deployments repo)
- DEX router contracts (PulseX, Uniswap)
- Bridge contracts (when integrated)

### 7.3 Contract Verification

Before any contract interaction:
1. Check address against hardcoded registry
2. Verify contract is not a proxy pointing to malicious implementation
3. Check contract age (reject contracts < 7 days old for high-value TX)
4. Verify source code is verified on block explorer

---

## 8. Operational Security (OpSec)

### 8.1 Development Security

| Practice | Implementation |
|----------|---------------|
| Code review | All PRs require Codex audit |
| Dependency scanning | npm audit on every build |
| Secret scanning | Pre-commit hooks reject secrets |
| Branch protection | main branch requires signed commits |
| CI/CD security | GitHub Actions with minimal permissions |

### 8.2 Deployment Security

| Practice | Implementation |
|----------|---------------|
| Immutable deploys | Docker containers, no in-place updates |
| Rollback capability | Git-based deployment with instant rollback |
| Canary deploys | New versions to 10% traffic first |
| Health checks | Automated post-deploy verification |
| Audit trail | All deployments logged with timestamp + hash |

### 8.3 Incident Response Plan

**Severity Levels:**

| Level | Description | Response Time | Escalation |
|-------|-------------|---------------|------------|
| P0 | Active fund theft | Immediate | Emergency freeze + all hands |
| P1 | Vulnerability discovered | < 1 hour | Guardian freeze + investigation |
| P2 | Service degradation | < 4 hours | Self-healing + monitoring |
| P3 | Non-critical bug | < 24 hours | Normal fix cycle |

**P0 Response Procedure:**
1. Guardian Agent triggers EMERGENCY FREEZE (automatic)
2. Telegram alert sent to all admins
3. Identify attack vector (logs, blockchain analysis)
4. Assess damage (check all monitored addresses)
5. Patch vulnerability
6. Coordinate with community (if public)
7. Lift freeze after verification
8. Post-mortem within 24 hours

---

## 9. Compliance & Privacy

### 9.1 Data Handling

| Data Type | Storage | Encryption | Retention |
|-----------|---------|------------|-----------|
| Private keys | Local/VDS | AES-256-GCM | Until user deletes |
| Transaction history | Blockchain (public) | N/A (public) | Permanent |
| User preferences | Local storage | Optional | Until cleared |
| Health metrics | VDS logs | At rest | 30 days |
| Alert history | Guardian memory | In transit (TLS) | 1000 entries max |

### 9.2 Privacy Principles

1. **Minimal data collection** — Only store what's needed for wallet function
2. **User sovereignty** — Users own their keys, we never have custody
3. **Right to privacy** — Railgun integration provides opt-in privacy
4. **No tracking** — No analytics, no user profiling, no data sales
5. **Transparency** — Open source code (herobase.io repo)

---

## 10. Security Testing Schedule

| Test Type | Frequency | Tool/Method |
|-----------|-----------|-------------|
| Unit tests | Every commit | Custom test framework (133 tests) |
| Integration tests | Every PR | Full test suite |
| Dependency audit | Weekly | npm audit + Snyk |
| Codex security audit | Every release | Automated + manual review |
| Penetration test | Quarterly | External auditor |
| Chaos engineering | Monthly | Random service kills, RPC failures |
| Social engineering | Annually | Phishing simulation |

---

## 11. Security Metrics & KPIs

| Metric | Target | Current |
|--------|--------|---------|
| Test pass rate | 100% | 100% (133/133) |
| Critical vulnerabilities | 0 | 0 |
| Mean time to detect (MTTD) | < 30 seconds | 30s (Guardian interval) |
| Mean time to respond (MTTR) | < 5 minutes | Automatic (freeze) |
| Code coverage | > 80% | ~85% (estimated) |
| Dependency vulnerabilities | 0 critical | TBD (npm audit pending) |
| Uptime target | 99.9% | N/A (pre-deployment) |

---

## 12. Security Roadmap

### Phase 1 (Current — Scaffold)
- [x] Guardian Agent built with emergency freeze
- [x] Input validation on all modules
- [x] Rate limiting implemented
- [x] Security test suite (133 tests passing)
- [x] Codex audit completed

### Phase 2 (VDS Deployment)
- [ ] Deploy Guardian Agent to dedicated VDS
- [ ] Enable Cloudflare WAF
- [ ] Configure CrowdSec
- [ ] Set up Wireguard admin VPN
- [ ] Enable encrypted backups

### Phase 3 (Production Hardening)
- [ ] External penetration test
- [ ] Bug bounty program launch
- [ ] Hardware security module (HSM) for server keys
- [ ] Multi-sig admin operations
- [ ] Formal verification of critical paths

### Phase 4 (Ongoing Operations)
- [ ] Quarterly security reviews
- [ ] Annual third-party audit
- [ ] Continuous dependency monitoring
- [ ] Red team exercises
- [ ] Community security bounties

---

## Appendix A: Security Contacts

| Role | Contact | Method |
|------|---------|--------|
| Security Lead | VETS (Founder) | Telegram (private) |
| Guardian Agent | Automated | Telegram bot |
| Emergency Freeze | Guardian (auto) + Admin (manual) | Telegram + VDS |

---

## Appendix B: Approved Security Tools

| Tool | Purpose | License |
|------|---------|---------|
| Railgun SDK | ZK privacy proofs | Open source |
| ethers.js | Blockchain interaction | MIT |
| LevelDB | Encrypted key storage | BSD |
| fail2ban | Brute force protection | GPL |
| UFW | Firewall management | GPL |
| Certbot | TLS certificate management | Apache 2.0 |
| Cloudflare | DDoS protection, WAF | Commercial |

---

*This document is a living security strategy. It MUST be updated whenever new threats are identified, architecture changes, or security incidents occur.*

**Next Review Date**: 2026-07-28 (Quarterly)
