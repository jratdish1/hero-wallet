/**
 * HERO Wallet Module — v0.2.0
 *
 * Exports all HERO-specific configurations, tokens, wallet functionality,
 * rewards, gamification, multi-chain support, integrations, notifications,
 * and security systems.
 * 
 * @security CODEX-AUDIT-REQUIRED
 */

// ============================================================
// Chain Configurations (Original)
// ============================================================
export { PULSECHAIN_CONFIG, PULSECHAIN_TESTNET_CONFIG } from './config/pulsechain';
export { BASE_CONFIG, BASE_SEPOLIA_CONFIG } from './config/base';

// ============================================================
// Token Definitions
// ============================================================
export {
  HERO_PULSECHAIN,
  HERO_BASE,
  VETS_PULSECHAIN,
  HERO_TOKENS,
  ZERO_ADDRESS,
  isTokenConfigured,
  getHeroTokensByChain,
  getHeroToken,
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
// Rewards System
// ============================================================
export {
  HeroRewardsEngine,
  RewardCurrency,
  DEFAULT_REWARD_CONFIG,
  HERO_TREASURY_ADDRESS,
  REWARDS_POOL_ADDRESS,
} from './rewards/rewards-engine';
export type {
  RewardConfig,
  RewardDistribution,
  UserRewardPreference,
} from './rewards/rewards-engine';

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
