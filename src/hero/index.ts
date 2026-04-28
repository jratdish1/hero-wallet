/**
 * HERO Wallet Module — v0.3.0
 *
 * Exports all HERO-specific configurations, tokens, wallet functionality,
 * rewards (70/20/5/5 split), gamification, multi-chain support, integrations,
 * notifications, and security systems.
 *
 * Fee Structure:
 *   70% → HERO Treasury (charities)
 *   20% → Rewards Pool (user claims)
 *    5% → Wallet Overhead (infrastructure)
 *    5% → Buy & Burn ($HERO deflationary)
 *
 * @security CODEX-AUDIT-REQUIRED
 */

// ============================================================
// Chain Configurations
// ============================================================
export { PULSECHAIN_CONFIG, PULSECHAIN_TESTNET_CONFIG } from './config/pulsechain';
export { BASE_CONFIG, BASE_SEPOLIA_CONFIG } from './config/base';

// ============================================================
// Token Definitions (All Community Tokens Hardcoded)
// ============================================================
export {
  HERO_PULSECHAIN,
  HERO_BASE,
  VETS_PULSECHAIN,
  TRUFARM_PULSECHAIN,
  EMIT_PULSECHAIN,
  RHINOFI_PULSECHAIN,
  YEP_PULSECHAIN,
  WPLS_PULSECHAIN,
  HEX_PULSECHAIN,
  WETH_PULSECHAIN,
  PLS_PULSECHAIN,
  ETH_BASE,
  HERO_TOKENS,
  COMMUNITY_TOKENS,
  ZERO_ADDRESS,
  NATIVE_TOKEN_ADDRESS,
  isTokenConfigured,
  isNativeToken,
  getHeroTokensByChain,
  getHeroToken,
  getTokenByAddress,
} from './config/tokens';
export type { HeroToken } from './config/tokens';

// ============================================================
// Wallet
// ============================================================
export {
  HeroWallet,
  createHeroWallet,
} from './wallet/hero-wallet';
export type {
  HeroChainName,
  HeroWalletOptions,
} from './wallet/hero-wallet';

// ============================================================
// Rewards System (70/20/5/5 Split + Buy & Burn + NFT Discount)
// ============================================================
export {
  HeroRewardsEngine,
  RewardCurrency,
  DEFAULT_REWARD_CONFIG,
  HERO_TREASURY_ADDRESS,
  REWARDS_POOL_ADDRESS,
  WALLET_OVERHEAD_ADDRESS,
  BUY_AND_BURN_ADDRESS,
  HERO_NFT_CONTRACT_ADDRESS,
} from './rewards/rewards-engine';
export type {
  RewardConfig,
  RewardDistribution,
  UserRewardPreference,
  ClaimableRewards,
  ClaimResult,
  BuyAndBurnEvent,
} from './rewards/rewards-engine';

// ============================================================
// Claim Handler (Backend API for Reward Claims)
// ============================================================
export {
  HeroClaimHandler,
  ClaimAPI,
} from './rewards/claim-handler';
export type {
  SwapQuote as ClaimSwapQuote,
  SwapRoute as ClaimSwapRoute,
  ClaimRequest,
  ClaimStatus,
} from './rewards/claim-handler';

// ============================================================
// Auto-Swap Router (Multi-DEX Routing)
// ============================================================
export {
  HeroAutoSwapRouter,
  SupportedDex,
} from './rewards/auto-swap-router';
export type {
  SwapParams,
  SwapResult,
  RouteStep,
  DexQuote,
} from './rewards/auto-swap-router';

// ============================================================
// Gamification & Rank System
// ============================================================
export {
  HeroRankEngine,
  HERO_RANKS,
  XP_REWARDS,
  ACHIEVEMENTS,
  XPActivity,
} from './gamification/rank-system';
export type {
  HeroRank,
  XPEvent,
  UserProfile,
  Achievement,
} from './gamification/rank-system';

// ============================================================
// Multi-Chain Support
// ============================================================
export {
  SUPPORTED_CHAINS,
  PULSECHAIN,
  BASE,
  ETHEREUM,
  ARBITRUM,
  POLYGON,
  BSC,
  AVALANCHE,
  OPTIMISM,
  PrivacyLevel,
  RolloutPhase,
  getChainConfig,
  getChainsByPhase,
  getPrivacyEnabledChains,
  getHeroEcosystemChains,
  hasPrivacy,
} from './chains/supported-chains';
export type { ChainConfig } from './chains/supported-chains';

// ============================================================
// Herobase.io Integration
// ============================================================
export {
  HerobaseConnector,
  HerobaseService,
  DEFAULT_HEROBASE_CONFIG,
  DEEP_LINKS,
} from './integrations/herobase-connector';
export type {
  HerobaseConfig,
  SwapQuote,
  DAOProposal,
  FarmPosition,
} from './integrations/herobase-connector';

// ============================================================
// Grok AI Integration
// ============================================================
export {
  HeroGrokAI,
  GrokFeature,
  DEFAULT_GROK_CONFIG,
} from './integrations/grok-ai';
export type {
  GrokConfig,
  GrokQuery,
  GrokResponse,
} from './integrations/grok-ai';

// ============================================================
// Telegram Notifications
// ============================================================
export {
  HeroTelegramAlerts,
  AlertPriority,
  AlertType,
} from './notifications/telegram-alerts';
export type {
  TelegramConfig,
  AlertPayload,
} from './notifications/telegram-alerts';

// ============================================================
// Security Watchdog & Failsafe
// ============================================================
export {
  HeroWatchdog,
  HealthStatus,
  WatchdogLoop,
  DEFAULT_WATCHDOG_CONFIG,
} from './security/watchdog';
export type {
  WatchdogConfig,
  ServiceHealth,
  AnomalyReport,
} from './security/watchdog';

// ============================================================
// Privacy Engine (Railgun ZK Integration)
// ============================================================
export {
  HeroPrivacyEngine,
  createPrivacyEngine,
  hasNativePrivacy,
  getPrivacyBridgeTarget,
  RAILGUN_SUPPORTED_CHAINS,
  HERO_DIRECT_CHAINS,
  PrivacyMode,
  EngineStatus,
} from './privacy/railgun-engine';
export type {
  RailgunEngineConfig,
  WalletCreationResult,
  PrivateTransferParams,
  PrivateTransactionResult,
  RailgunChainName,
  DirectChainName,
  AllChainName,
} from './privacy/railgun-engine';

// ============================================================
// Guardian Agent (Autonomous Security Monitor)
// ============================================================
export {
  HeroGuardianAgent,
  createGuardianAgent,
  ThreatLevel,
  MonitorTarget,
} from './security/guardian-agent';
export type {
  GuardianConfig,
  AnomalyDetection,
  GuardianHealthReport,
} from './security/guardian-agent';
