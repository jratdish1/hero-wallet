# SOP: Mandatory Codex Security Audit for Financial Code

**Classification:** FIRM DIRECTIVE — NO EXCEPTIONS
**Effective:** April 28, 2026
**Applies to:** ALL code that touches finances, wallets, tokens, trading, or fund transfers

---

## 1. SCOPE

This SOP applies to:
- HERO Wallet (all repos)
- Any wallet, DEX, or DeFi code
- Trading bot code changes that affect order placement, fund movement, or balance logic
- Smart contracts
- Any code that handles private keys, API keys with trading permissions, or fund transfers

---

## 2. AUDIT PROCESS (MANDATORY)

### Step 1: Write Code
- Develop the feature/fix in a branch (never directly to main)

### Step 2: Codex Security Audit (FIRST PASS)
- Submit ALL changed files to ChatGPT 5.5 Codex for security audit
- Audit prompt must include:
  ```
  SECURITY AUDIT — FINANCIAL CODE
  Audit the following code for:
  1. Reentrancy vulnerabilities
  2. Integer overflow/underflow
  3. Unchecked external calls
  4. Access control issues
  5. Front-running vulnerabilities
  6. Private key exposure
  7. Incorrect fund routing (wrong addresses)
  8. Missing input validation
  9. Race conditions
  10. Dependency vulnerabilities
  Provide: SEVERITY (Critical/High/Medium/Low), LOCATION (file:line), DESCRIPTION, FIX
  ```

### Step 3: Fix All Findings
- Address ALL Critical and High severity findings
- Document Medium/Low findings with justification if not fixed

### Step 4: Codex Re-Audit (SECOND PASS)
- Submit the FIXED code for a second audit
- This audit checks:
  - All previous findings are resolved
  - No new vulnerabilities introduced by fixes
  - Code logic correctness

### Step 5: Push to GitHub
- ONLY after SECOND PASS comes back clean (no Critical/High findings)
- Commit message MUST include: `[CODEX-AUDITED]` tag
- Include audit report hash in commit

---

## 3. TEST TRANSACTION PROTOCOL

For ANY code that moves funds:
1. Deploy to testnet first (if applicable)
2. Execute $5 test transaction
3. Verify TX receipt on BOTH ends (sender and recipient)
4. Confirm balances changed correctly
5. ONLY THEN proceed with production deployment

---

## 4. VERSION CONTROL

- Every audit generates a report saved to `/audits/` directory in the repo
- Reports named: `audit_v{VERSION}_{DATE}.md`
- Git tags: `v{VERSION}-audited`
- Changelog must reference audit report

---

## 5. EMERGENCY HOTFIX EXCEPTION

If a critical production bug requires immediate fix:
1. Fix the bug
2. Deploy the fix
3. Run Codex audit WITHIN 1 HOUR of deployment
4. If audit finds issues, roll back and re-fix
5. Document the emergency in the audit report

---

## 6. ENFORCEMENT

- **NO code touching finances goes to GitHub without Codex audit**
- **NO exceptions for "small changes" — every edit, every time**
- Failsafe watchdog monitors for unaudited commits
- Manus API escalation if unaudited code is detected

---

*This SOP is permanent and irrevocable. It exists because $784 was lost due to not verifying function parameters before execution. Never again.*
