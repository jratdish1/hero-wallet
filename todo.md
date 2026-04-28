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

## Phase 5: Deployment & Hardening (Current)
- [x] Full test suite expanded to 133/133 tests ✅ (2026-04-28)
- [x] Complete security strategy document (7-layer defense-in-depth) ✅ (2026-04-28)
- [x] Full security audit report (0 Critical, 0 High, 3 Medium) ✅ (2026-04-28)
- [x] Replace $HERO Base placeholder with real CA: 0x00fa69ed03d3337085a6a87b691e8a02d04eb5f8 ✅ (2026-04-28)
- [x] Research AmbireTech (EIP-7702 wallet, cross-chain architecture) ✅ (2026-04-28)
- [x] Research LibertySwap/ZKX Wallet (direct competitor analysis) ✅ (2026-04-28)
- [x] Create BETA disclaimer document ✅ (2026-04-28)
- [x] Create explainer video storyboard/plan ✅ (2026-04-28)

## Phase 5b: Deployment & Hardening (Blocked — Awaiting VDS S)
- [ ] Receive VDS S confirmation and label "HERO Wallet VDS S"
- [ ] Execute Server Hardening SOP on new VDS
- [ ] Set up wallet.herobase.io subdomain (DNS + Nginx)
- [ ] Deploy wallet backend API on dedicated VDS
- [x] Build HERO Guardian Agent (autonomous security monitor) ✅ (2026-04-28, code ready)
- [ ] Deploy HERO Guardian Agent to VDS (awaiting VDS S provisioning)
- [x] Wire up Railgun engine integration in HeroWallet.initialize() ✅ (2026-04-28)
- [ ] Deploy/bridge RAILGUN contracts on PulseChain & Base (BLOCKED: using bridge-to-privacy strategy)

## Phase 6: Testing & QA
- [x] Write unit tests for all modules ✅ (2026-04-28, 133/133 passing)
- [ ] $5 test transaction on testnet per SOP
- [ ] End-to-end claim flow test (rewards → auto-swap → wallet load)
- [ ] Security penetration test
- [ ] External pen test (quarterly schedule)

## Phase 7: Mobile & Extensions
- [ ] Build React Native mobile wrapper (iOS + Android)
- [ ] TestFlight onboarding for iOS beta
- [ ] Android APK distribution
- [ ] Chrome browser extension (HERO Wallet Web3 Extension) — Reference: ZKX Wallet (15 MiB, Manifest V3)
- [ ] Firefox browser extension
- [ ] Edge browser extension
- [ ] Extension features: connect to dApps, sign transactions, quick swap, balance view
- [ ] Study AmbireTech extension build pipeline (webpack, LavaMoat security)
- [ ] Evaluate React Native Web hybrid approach (single codebase for extension + mobile)
- [ ] Chrome Web Store developer account ($5 one-time)
- [ ] 5 promotional screenshots for store listing

## Phase 8: Cross-Chain & Finalization
- [ ] Cross-chain swap aggregation (all popular chains)
- [ ] Bridge integration (PulseChain ↔ Base ↔ Ethereum ↔ Arbitrum ↔ etc.)
- [ ] Evaluate AmbireTech ambire-common pattern for shared cross-chain logic
- [ ] LibertySwap/Bridge2Pulse integration for PulseChain bridging
- [ ] Final Codex audit on complete codebase
- [ ] Generate HERO Wallet Whitepaper (auto-trigger when finalized)
- [ ] Publish to Chrome Web Store, Firefox Add-ons, Edge Add-ons

## Phase 9: Marketing & Launch
- [ ] Produce HERO Wallet explainer video (see docs/VIDEO_EXPLAINER_PLAN.md)
- [ ] Generate reference images for video (HERO soldier logo, UI mockups)
- [ ] Generate video clips (8 clips, 45-60s total)
- [ ] Distribute video: Telegram, X/Twitter, herobase.io, YouTube
- [ ] BETA launch announcement with disclaimer
- [ ] Community beta testing program (Telegram group)

## Competitive Intelligence
- **ZKX Wallet** (by LibertySwap): LIVE on Chrome Web Store as of 2026-04-28
  - Features: Shield/Unshield, Swap & Bridge, PulseChain + EVM, Non-Custodial, Open Source
  - 9 users, 0 ratings (just launched same day)
  - Our advantages: Gamification, Buy-and-Burn, Guardian Agent, Community loyalty
- **AmbireTech**: EIP-7702 smart wallet, 222 stars, GPL-3.0
  - Useful patterns: ambire-common submodule, LavaMoat security, hybrid RN/Web
  - NOT a direct competitor (different ecosystem)

## Reminders
- $HERO Base CA: 0x00fa69ed03d3337085a6a87b691e8a02d04eb5f8 (VERIFIED on BaseScan)
- $HERO PulseChain CA: 0x35a51Dfc82032682E4Bda8AAcA87B9Bc386C3D27
- $VETS PulseChain CA: 0x4013abBf94A745EfA7cc848989Ee83424A770060
- Whitepaper auto-generates when all placeholder addresses are replaced (✅ ALL REPLACED)
- Every code change requires Codex audit before GitHub push (SOP)
- Dedicated server: Contabo Cloud VDS S ($49.22/mo, US-East, 3 cores, 24GB RAM, 180GB NVMe)
- Browser extension roadmap: Chrome → Firefox → Edge (Manifest V3)
- HERO logo (attached by user) is the primary branding for all platforms
- First Responder image available for community/charity section of wallet
- BETA disclaimer: docs/BETA_DISCLAIMER.md (ready for deployment)
- Video plan: docs/VIDEO_EXPLAINER_PLAN.md (ready for production)
