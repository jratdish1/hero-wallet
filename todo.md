# HERO Wallet — Master TODO

## Phase 1: Research & Specification ✅
- [x] Research ZKX Wallet (zkxwallet.com) for feature reference
- [x] Create comprehensive feature specification document
- [x] Create HERO Wallet roadmap with phases
- [x] Answer infrastructure questions (dedicated server, agent, Grok AI)

## Phase 2: Scaffold Updates ✅
- [x] Add rewards system (HERO token or USDC stablecoin option)
- [x] Add fee distribution: 70% HERO treasury / 20% rewards / 5% wallet ops / 5% buy & burn
- [x] Add gamification system for retention (military ranks, XP, achievements)
- [x] Add herobase.io integration (swaps, trading, DAO, farming)
- [x] Add multi-chain support (8 chains → HERO ecosystem on Base + PulseChain)
- [x] Add Grok AI bot integration
- [x] Add Telegram notifications system
- [x] Add failsafe/overwatch/hardening specs
- [x] Add buy & burn deflationary mechanism
- [x] Add HERO NFT 2% fee discount
- [x] Add claim handler with auto-swap routing
- [x] Add auto-swap router (multi-DEX aggregation)

## Phase 3: Audit & Push ✅
- [x] Run Codex security audit v0.2.0 (8 files audited)
- [x] Fix HIGH findings and re-audit v0.2.0
- [x] Run Codex security audit v0.3.0 (5 files audited)
- [x] Fix HIGH findings v0.3.0 (race condition, minAmountOut, access control)
- [x] Commit and push to GitHub with [CODEX-AUDITED] tag (v0.3.0-audited)

## Phase 4: Token & Infrastructure ✅ (In Progress)
- [x] Hardcode community tokens: TruFarm, EMIT, RhinoFi, YEP, HERO, VETS, WETH, PLS, WPLS, HEX
- [x] Set YEP CA: 0xE08FC6Ce880D36a1167701028c0ae84dc3e82b8f
- [x] Update fee structure to 70/20/5/5
- [x] Order dedicated Contabo VDS S ($49.22/mo with US-East) — PAID, awaiting provisioning
- [x] Build HERO Wallet web frontend (wallet.herobase.io preview)
- [x] Integrate all HERO branding images (logo, soldier, command center, miners, etc.)
- [x] Generate First Responder image (Police, Fire, Medical)
- [x] Add HERO Wallet quick-access button to Mining Ops sidebar

## Phase 5: Deployment & Hardening (Next)
- [ ] Receive VDS S confirmation and label "HERO Wallet VDS S"
- [ ] Execute Server Hardening SOP on new VDS
- [ ] Set up wallet.herobase.io subdomain (DNS + Nginx)
- [ ] Deploy wallet backend API on dedicated VDS
- [x] Build HERO Guardian Agent (autonomous security monitor) ✅ (2026-04-28, code ready)
- [ ] Deploy HERO Guardian Agent to VDS (awaiting VDS S provisioning)
- [x] Wire up Railgun engine integration in HeroWallet.initialize() ✅ (2026-04-28)
- [ ] Deploy/bridge RAILGUN contracts on PulseChain & Base (BLOCKED: Railgun not on PulseChain/Base — using bridge-to-privacy strategy)

## Phase 6: Testing & QA
- [x] Write unit tests for all modules ✅ (2026-04-28, 56/56 passing)
- [ ] $5 test transaction on testnet per SOP
- [ ] End-to-end claim flow test (rewards → auto-swap → wallet load)
- [ ] Security penetration test

## Phase 7: Mobile & Extensions
- [ ] Build React Native mobile wrapper (iOS + Android)
- [ ] TestFlight onboarding for iOS beta
- [ ] Android APK distribution
- [ ] Chrome browser extension (HERO Wallet Web3 Extension)
- [ ] Firefox browser extension
- [ ] Edge browser extension
- [ ] Extension features: connect to dApps, sign transactions, quick swap, balance view

## Phase 8: Cross-Chain & Finalization
- [ ] Cross-chain swap aggregation (all popular chains)
- [ ] Bridge integration (PulseChain ↔ Base ↔ Ethereum ↔ Arbitrum ↔ etc.)
- [ ] Final Codex audit on complete codebase
- [ ] Generate HERO Wallet Whitepaper (auto-trigger when finalized)
- [ ] Publish to Chrome Web Store, Firefox Add-ons, Edge Add-ons

## Reminders
- Whitepaper auto-generates when all placeholder addresses are replaced
- Every code change requires Codex audit before GitHub push (SOP)
- Dedicated server: Contabo Cloud VDS S ($49.22/mo, US-East, 3 cores, 24GB RAM, 180GB NVMe)
- Browser extension roadmap: Chrome → Firefox → Edge (Manifest V3)
- HERO logo (attached by user) is the primary branding for all platforms
- First Responder image available for community/charity section of wallet
