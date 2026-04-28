/**
 * HERO Wallet Module
 *
 * Exports all HERO-specific configurations, tokens, and wallet functionality.
 */

// Chain configurations
export { PULSECHAIN_CONFIG, PULSECHAIN_TESTNET_CONFIG } from './config/pulsechain';
export { BASE_CONFIG, BASE_SEPOLIA_CONFIG } from './config/base';

// Token definitions
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

// Wallet
export {
  HeroWallet,
  createHeroWallet,
} from './wallet/hero-wallet';
export type {
  HeroChainName,
  HeroWalletOptions,
} from './wallet/hero-wallet';
