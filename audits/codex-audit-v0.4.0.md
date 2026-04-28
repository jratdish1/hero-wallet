# HERO Wallet — Codex Security Audit v0.4.0

**Date**: 2026-04-28
**Auditor**: Manus Codex (Automated)
**Scope**: New files added in Phase 5
**Status**: PASS (Conditional)

---

## Files Audited

| # | File | Lines | Risk Level |
|---|------|-------|------------|
| 1 | `src/hero/privacy/railgun-engine.ts` | 395 | HIGH |
| 2 | `src/hero/security/guardian-agent.ts` | 520 | HIGH |
| 3 | `src/hero/index.ts` (additions) | 35 | LOW |
| 4 | `tests/hero-wallet.test.ts` | 480 | LOW |
| 5 | `docs/RAILGUN_DEPLOYMENT_RESEARCH.md` | 80 | INFO |

---

## Findings

### CRITICAL — None Found ✅

### HIGH — 0 Issues

### MEDIUM — 2 Issues

#### M-1: Placeholder Transaction Logic (railgun-engine.ts)

**Location**: Lines 285-340 (`executeDirectPrivateTransfer`, `executeBridgeAndPrivateTransfer`, `executeTransparentTransfer`)

**Description**: All three transfer methods return placeholder data (`0x_placeholder_tx_hash`). This is expected for a scaffold but MUST be replaced before any live deployment.

**Risk**: If deployed without replacing placeholders, users could believe transactions succeeded when they did not.

**Recommendation**: Add runtime guards that throw `Error('NOT_IMPLEMENTED')` in production mode. Add environment variable `HERO_WALLET_MODE` with values `scaffold` | `production`.

**Status**: ACCEPTED — Expected for scaffold phase. Will be addressed when Railgun SDK is fully wired.

---

#### M-2: Telegram Alert Credentials in Memory (guardian-agent.ts)

**Location**: Lines 45-50 (`GuardianConfig` interface)

**Description**: Telegram bot token and chat ID are stored in plain text in the config object. While this is standard for server-side code, the credentials should be loaded from environment variables, not hardcoded.

**Recommendation**: Document that `telegramBotToken` and `telegramChatId` MUST come from `process.env`, never from source code. Add validation that rejects tokens that look hardcoded (e.g., matching known test patterns).

**Status**: ACCEPTED — Config interface is correct; usage documentation will enforce env vars.

---

### LOW — 3 Issues

#### L-1: No Rate Limit on Wallet Creation (railgun-engine.ts)

**Location**: `createWallet()` method

**Description**: No rate limiting on wallet creation. An attacker could spam wallet creation to exhaust memory/disk.

**Recommendation**: Add a configurable `maxWalletsPerMinute` limit.

**Status**: DEFERRED — Will be addressed in deployment hardening phase.

---

#### L-2: Anomaly History Unbounded Growth (guardian-agent.ts)

**Location**: `recordAnomaly()` method, line with `MAX_ANOMALY_HISTORY = 1000`

**Description**: While there's a cap at 1000 entries, each entry contains `rawData: Record<string, unknown>` which could be arbitrarily large.

**Recommendation**: Add size validation on `rawData` (max 10KB per entry). Consider using a circular buffer instead of array splice.

**Status**: ACCEPTED — Will add size limit in next iteration.

---

#### L-3: Missing Input Sanitization on Memo Field (railgun-engine.ts)

**Location**: `PrivateTransferParams.memo` field

**Description**: The optional `memo` field has no length or content validation. Could be used to inject oversized data into transactions.

**Recommendation**: Add `maxMemoLength = 256` validation before proof generation.

**Status**: ACCEPTED — Will add validation.

---

### INFORMATIONAL — 2 Notes

#### I-1: Test Framework is Custom (tests/hero-wallet.test.ts)

**Description**: Tests use a custom lightweight framework instead of Jest/Vitest. This is fine for the scaffold phase but should migrate to a standard framework before production.

**Recommendation**: Migrate to Vitest when the project matures.

---

#### I-2: Bridge Target Hardcoded (railgun-engine.ts)

**Description**: `HERO_DIRECT_CHAINS` hardcodes bridge targets (PulseChain → Ethereum, Base → Arbitrum). These should be configurable for future flexibility.

**Recommendation**: Make bridge targets configurable in `RailgunEngineConfig`.

---

## Summary

| Severity | Count | Status |
|----------|-------|--------|
| Critical | 0 | — |
| High | 0 | — |
| Medium | 2 | Accepted (scaffold) |
| Low | 3 | 2 Accepted, 1 Deferred |
| Info | 2 | Noted |

## Verdict: **CONDITIONAL PASS** ✅

All new code passes security review for the scaffold phase. No critical or high-severity issues found. Medium issues are expected placeholders that will be resolved when Railgun SDK integration goes live.

**Conditions for Production Deployment:**
1. Replace all placeholder transaction logic with real SDK calls
2. Add `HERO_WALLET_MODE` environment guard
3. Add memo length validation
4. Add wallet creation rate limiting
5. Add rawData size cap in Guardian anomaly recording

---

*Audit performed per HERO Wallet SOP: Every code change requires Codex audit before GitHub push.*
