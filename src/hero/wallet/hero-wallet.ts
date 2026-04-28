/**
 * HERO Wallet — High-Level Wallet API
 *
 * Provides a simplified interface for HERO ecosystem operations
 * on top of the Railgun Wallet SDK.
 *
 * SECURITY NOTE: This file handles wallet creation and private keys.
 * All changes MUST go through Codex security audit per SOP.
 *
 * AUDIT STATUS: v0.1.0 — Conditional Pass (2026-04-28)
 * - Placeholder addresses flagged (expected for scaffold)
 * - Input validation added per audit recommendation
 */

import { PULSECHAIN_CONFIG } from '../config/pulsechain';
import { BASE_CONFIG } from '../config/base';
import { HERO_TOKENS, getHeroToken, type HeroToken } from '../config/tokens';

// Constants for validation
const VALID_CHAIN_NAMES = ['pulsechain', 'base', 'ethereum', 'polygon', 'bsc', 'arbitrum'] as const;
const MAX_RPC_URL_LENGTH = 512;
const URL_PATTERN = /^https?:\/\/.+/;

/**
 * Supported chain identifiers for the HERO wallet
 */
export type HeroChainName = (typeof VALID_CHAIN_NAMES)[number];

/**
 * HERO Wallet initialization options
 */
export interface HeroWalletOptions {
  /** LevelDOWN compatible database instance */
  db: unknown;
  /** Chains to enable (default: ['pulsechain', 'base']) */
  chains?: HeroChainName[];
  /** Enable debug logging */
  debug?: boolean;
  /** Custom RPC URLs per chain */
  customRpcUrls?: Partial<Record<HeroChainName, string[]>>;
  /** POI node URLs for privacy proofs */
  poiNodeUrls?: string[];
}

/**
 * Chain configuration mapping
 */
const CHAIN_CONFIGS: Record<string, { chainId: number; name: string }> = {
  pulsechain: { chainId: PULSECHAIN_CONFIG.chainId, name: PULSECHAIN_CONFIG.name },
  base: { chainId: BASE_CONFIG.chainId, name: BASE_CONFIG.name },
  ethereum: { chainId: 1, name: 'Ethereum' },
  polygon: { chainId: 137, name: 'Polygon' },
  bsc: { chainId: 56, name: 'BNB Chain' },
  arbitrum: { chainId: 42161, name: 'Arbitrum' },
};

/**
 * Validate a URL string for safety
 * @throws Error if URL is malformed or exceeds length limit
 */
const validateUrl = (url: string, context: string): void => {
  if (typeof url !== 'string') {
    throw new Error(`[HERO Wallet] ${context}: URL must be a string`);
  }
  if (url.length > MAX_RPC_URL_LENGTH) {
    throw new Error(`[HERO Wallet] ${context}: URL exceeds maximum length of ${MAX_RPC_URL_LENGTH}`);
  }
  if (!URL_PATTERN.test(url)) {
    throw new Error(`[HERO Wallet] ${context}: URL must start with http:// or https://`);
  }
};

/**
 * Validate a token symbol string
 * @throws Error if symbol is invalid
 */
const validateTokenSymbol = (symbol: string): void => {
  if (typeof symbol !== 'string' || symbol.length === 0 || symbol.length > 20) {
    throw new Error(`[HERO Wallet] Invalid token symbol: must be 1-20 characters`);
  }
  if (!/^[A-Za-z0-9]+$/.test(symbol)) {
    throw new Error(`[HERO Wallet] Invalid token symbol: must be alphanumeric`);
  }
};

/**
 * Validate a chain name
 * @throws Error if chain name is not in the supported list
 */
const validateChainName = (chain: string): chain is HeroChainName => {
  if (!VALID_CHAIN_NAMES.includes(chain as HeroChainName)) {
    throw new Error(`[HERO Wallet] Unsupported chain: ${chain}. Valid chains: ${VALID_CHAIN_NAMES.join(', ')}`);
  }
  return true;
};

/**
 * HERO Wallet class
 *
 * Wraps the Railgun engine with HERO-specific defaults and
 * simplified methods for common operations.
 */
export class HeroWallet {
  private initialized = false;
  private enabledChains: HeroChainName[];
  private options: HeroWalletOptions;

  constructor(options: HeroWalletOptions) {
    // Validate options
    if (!options.db) {
      throw new Error('[HERO Wallet] db option is required');
    }

    // Validate chains
    const chains = options.chains ?? ['pulsechain', 'base'];
    for (const chain of chains) {
      validateChainName(chain);
    }

    // Validate custom RPC URLs if provided
    if (options.customRpcUrls) {
      for (const [chain, urls] of Object.entries(options.customRpcUrls)) {
        validateChainName(chain);
        if (Array.isArray(urls)) {
          for (const url of urls) {
            validateUrl(url, `customRpcUrls.${chain}`);
          }
        }
      }
    }

    // Validate POI node URLs if provided
    if (options.poiNodeUrls) {
      for (const url of options.poiNodeUrls) {
        validateUrl(url, 'poiNodeUrls');
      }
    }

    this.options = options;
    this.enabledChains = chains;
  }

  /**
   * Initialize the HERO wallet engine
   *
   * This must be called before any wallet operations.
   * Sets up the Railgun engine with HERO-specific chain configs.
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    // Validate chain configs have required contract addresses
    for (const chain of this.enabledChains) {
      const config = CHAIN_CONFIGS[chain];
      if (!config) {
        throw new Error(`[HERO Wallet] No configuration found for chain: ${chain}`);
      }
    }

    // TODO: Initialize Railgun engine with HERO configs
    // This requires deploying RAILGUN contracts on PulseChain and Base
    // For now, this scaffolds the integration points
    //
    // WARNING: PulseChain and Base contract addresses are PLACEHOLDERS.
    // ZK privacy features will NOT work until contracts are deployed.
    // See: src/hero/config/pulsechain.ts and src/hero/config/base.ts

    this.initialized = true;
  }

  /**
   * Get all supported HERO tokens for enabled chains
   */
  getSupportedTokens(): HeroToken[] {
    const chainIds = this.enabledChains.map(
      (chain) => CHAIN_CONFIGS[chain].chainId,
    );
    return HERO_TOKENS.filter((token) => chainIds.includes(token.chainId));
  }

  /**
   * Get enabled chain configurations
   */
  getEnabledChains(): Array<{ name: string; chainId: number }> {
    return this.enabledChains.map((chain) => CHAIN_CONFIGS[chain]);
  }

  /**
   * Look up a HERO token by symbol and chain
   * @param symbol - Token symbol (e.g., 'HERO', 'VETS')
   * @param chain - Chain name (e.g., 'pulsechain', 'base')
   */
  getToken(symbol: string, chain: HeroChainName): HeroToken | undefined {
    validateTokenSymbol(symbol);
    validateChainName(chain);
    const chainId = CHAIN_CONFIGS[chain]?.chainId;
    if (!chainId) return undefined;
    return getHeroToken(symbol, chainId);
  }

  /**
   * Check if the wallet engine is initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Shutdown the wallet engine gracefully
   */
  async shutdown(): Promise<void> {
    if (!this.initialized) return;
    // TODO: Call stopRailgunEngine()
    this.initialized = false;
  }
}

/**
 * Factory function to create and initialize a HERO wallet
 */
export const createHeroWallet = async (
  options: HeroWalletOptions,
): Promise<HeroWallet> => {
  const wallet = new HeroWallet(options);
  await wallet.initialize();
  return wallet;
};
