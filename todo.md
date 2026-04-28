# HERO Wallet — Master TODO

## Phase 1: Research & Specification ✅
- [x] Research ZKX Wallet (zkxwallet.com) for feature reference
- [x] Create comprehensive feature specification document
- [x] Create HERO Wallet roadmap with phases
- [x] Answer infrastructure questions (dedicated server, agent, Grok AI)

## Phase 2: Scaffold Updates ✅
- [x] Add rewards system (HERO token or USDC stablecoin option)
- [x] Add fee distribution: 80% HERO treasury (charities) / 20% rewards ecosystem
- [x] Add gamification system for retention
- [x] Add herobase.io integration (swaps, trading, DAO, farming)
- [x] Add multi-chain support (popular chains → HERO ecosystem on Base + PulseChain)
- [x] Add Grok AI bot integration
- [x] Add Telegram notifications system
- [x] Add failsafe/overwatch/hardening specs

## Phase 3: Audit & Push ✅
- [x] Run Codex security audit on all new code (8 files audited)
- [x] Fix HIGH findings and re-audit (4 HIGH fixed, 2 PASS + 1 CONDITIONAL PASS)
- [x] Commit and push to GitHub with [CODEX-AUDITED] tag (v0.2.0-audited)

## Phase 4: Future (Post-Finalization)
- [ ] Deploy/bridge RAILGUN contracts on PulseChain
- [ ] Set real $HERO and $VETS contract addresses
- [ ] Wire up Railgun engine integration in HeroWallet.initialize()
- [ ] Write unit tests for all modules
- [ ] $5 test transaction on testnet per SOP
- [ ] Order dedicated Contabo VDS S for wallet server ($18/mo)
- [ ] Set up wallet.herobase.io subdomain
- [ ] Build wallet backend API
- [ ] Deploy autonomous security agent for wallet ecosystem
- [ ] Build mobile app (React Native — Android + iOS)
- [ ] TestFlight onboarding for iOS beta
- [ ] Cross-chain swap aggregation (all popular chains)
- [ ] Create HERO Wallet whitepaper (REMINDER: auto-generate when wallet finalized)

## Reminders
- Whitepaper auto-generates when all placeholder addresses are replaced
- Every code change requires Codex audit before GitHub push (SOP)
- Dedicated server recommendation: Contabo Cloud VDS S ($18/mo)
