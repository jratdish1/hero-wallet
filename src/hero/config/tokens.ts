/**
 * HERO Ecosystem Token Definitions
 *
 * Complete token registry for the HERO Wallet ecosystem.
 * All addresses verified from on-chain explorers and official sources.
 *
 * Supported: $HERO, $VETS, TruFarm, EMIT, RhinoFi, YEP, WPLS, HEX, WETH, PLS, ETH
 */

export interface HeroToken {
  readonly name: string;
  readonly symbol: string;
  readonly decimals: number;
  readonly address: string;
  readonly chainId: number;
  readonly logoURI?: string;
  readonly isNative: boolean;
  readonly isCommunityToken: boolean;
}

// ============================================================================
// HERO ECOSYSTEM TOKENS — PulseChain (Chain ID: 369)
// ============================================================================

/**
 * $HERO Token — PulseChain
 * Primary governance and utility token of the HERO ecosystem.
 * Source: herobase.io → scan.pulsechain.com
 */
export const HERO_PULSECHAIN: HeroToken = {
  name: 'HERO',
  symbol: 'HERO',
  decimals: 18,
  address: '0x35a51Dfc82032682E4Bda8AAcA87B9Bc386C3D27',
  chainId: 369,
  isNative: false,
  isCommunityToken: false,
};

/**
 * $VETS Token — PulseChain
 * Community token for the VetsInCrypto ecosystem.
 * Source: herobase.io → scan.pulsechain.com
 */
export const VETS_PULSECHAIN: HeroToken = {
  name: 'VETS',
  symbol: 'VETS',
  decimals: 18,
  address: '0x4013abBf94A745EfA7cc848989Ee83424A770060',
  chainId: 369,
  isNative: false,
  isCommunityToken: false,
};

/**
 * TruFarm Token — PulseChain
 * Reward token for TruFarms staking platform.
 * Source: scan.pulsechain.com/address/0xCA942990EF21446Db490532E66992eD1EF76A82b
 */
export const TRUFARM_PULSECHAIN: HeroToken = {
  name: 'TruFarm',
  symbol: 'TRUFARM',
  decimals: 18,
  address: '0xCA942990EF21446Db490532E66992eD1EF76A82b',
  chainId: 369,
  isNative: false,
  isCommunityToken: true,
};

/**
 * EMIT Token — PulseChain
 * Emit Farm ecosystem token.
 * Source: emit.farm official
 */
export const EMIT_PULSECHAIN: HeroToken = {
  name: 'EMIT',
  symbol: 'EMIT',
  decimals: 18,
  address: '0x32fB5663619A657839A80133994E45c5e5cDf427',
  chainId: 369,
  isNative: false,
  isCommunityToken: true,
};

/**
 * RhinoFi Token — PulseChain
 * RhinoFi DeFi protocol token.
 * Source: scan.pulsechain.com
 */
export const RHINOFI_PULSECHAIN: HeroToken = {
  name: 'RhinoFi',
  symbol: 'RHINOFI',
  decimals: 18,
  address: '0x6C6D7De6C5f366a1995ed5f1e273C5B3760C6043',
  chainId: 369,
  isNative: false,
  isCommunityToken: true,
};

/**
 * YEP Token — PulseChain
 * Community token.
 * Source: User-provided CA (verified)
 */
export const YEP_PULSECHAIN: HeroToken = {
  name: 'YEP',
  symbol: 'YEP',
  decimals: 18,
  address: '0xE08FC6Ce880D36a1167701028c0ae84dc3e82b8f',
  chainId: 369,
  isNative: false,
  isCommunityToken: true,
};

// ============================================================================
// INFRASTRUCTURE TOKENS — PulseChain
// ============================================================================

/**
 * Wrapped PLS (WPLS) — PulseChain
 * Source: 9inch gitbook
 */
export const WPLS_PULSECHAIN: HeroToken = {
  name: 'Wrapped Pulse',
  symbol: 'WPLS',
  decimals: 18,
  address: '0xA1077a294dDE1B09bB078844df40758a5D0f9a27',
  chainId: 369,
  isNative: false,
  isCommunityToken: false,
};

/**
 * HEX Token — PulseChain
 * Source: 9inch gitbook
 */
export const HEX_PULSECHAIN: HeroToken = {
  name: 'HEX',
  symbol: 'HEX',
  decimals: 8,
  address: '0x2b591e99afe9f32eaa6214f7b7629768c40eeb39',
  chainId: 369,
  isNative: false,
  isCommunityToken: false,
};

/**
 * Wrapped ETH (bridged) — PulseChain
 * Source: 9inch gitbook
 */
export const WETH_PULSECHAIN: HeroToken = {
  name: 'Wrapped Ether',
  symbol: 'WETH',
  decimals: 18,
  address: '0x02DcdD04e3F455D838cd1249292C58f3B79e3C3C',
  chainId: 369,
  isNative: false,
  isCommunityToken: false,
};

/**
 * PLS — PulseChain Native Token
 */
export const PLS_PULSECHAIN: HeroToken = {
  name: 'Pulse',
  symbol: 'PLS',
  decimals: 18,
  address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE', // Native token sentinel
  chainId: 369,
  isNative: true,
  isCommunityToken: false,
};

// ============================================================================
// HERO ECOSYSTEM TOKENS — Base (Chain ID: 8453)
// ============================================================================

/**
 * $HERO Token — Base
 * HERO Token for Veterans on Base L2.
 * Source: basescan.org/token/0x00fa69ed03d3337085a6a87b691e8a02d04eb5f8
 * Contract: Verified (Solidity v0.8.26, MIT license)
 * Features: ERC20Votes, Buy-and-Burn, Auto-LP, Fee Decay
 * Supply: 100,000,000 HERO
 */
export const HERO_BASE: HeroToken = {
  name: 'HERO',
  symbol: 'HERO',
  decimals: 18,
  address: '0x00fa69ed03d3337085a6a87b691e8a02d04eb5f8',
  chainId: 8453,
  isNative: false,
  isCommunityToken: false,
};

/**
 * ETH — Base Native Token
 */
export const ETH_BASE: HeroToken = {
  name: 'Ethereum',
  symbol: 'ETH',
  decimals: 18,
  address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE', // Native token sentinel
  chainId: 8453,
  isNative: true,
  isCommunityToken: false,
};

// ============================================================================
// TOKEN UTILITIES
// ============================================================================

/** Sentinel value for placeholder addresses */
export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

/** Sentinel value for native token addresses */
export const NATIVE_TOKEN_ADDRESS = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';

/** Check if a token has a real (non-placeholder) address */
export const isTokenConfigured = (token: HeroToken): boolean => {
  return token.address !== ZERO_ADDRESS && token.address.length === 42;
};

/** Check if token is native (PLS or ETH) */
export const isNativeToken = (token: HeroToken): boolean => {
  return token.address === NATIVE_TOKEN_ADDRESS;
};

// ============================================================================
// TOKEN REGISTRY
// ============================================================================

/** All HERO ecosystem tokens */
export const HERO_TOKENS: readonly HeroToken[] = [
  // Core ecosystem
  HERO_PULSECHAIN,
  HERO_BASE,
  VETS_PULSECHAIN,
  // Community tokens
  TRUFARM_PULSECHAIN,
  EMIT_PULSECHAIN,
  RHINOFI_PULSECHAIN,
  YEP_PULSECHAIN,
  // Infrastructure tokens
  WPLS_PULSECHAIN,
  HEX_PULSECHAIN,
  WETH_PULSECHAIN,
  PLS_PULSECHAIN,
  ETH_BASE,
] as const;

/** Community tokens only */
export const COMMUNITY_TOKENS: readonly HeroToken[] = HERO_TOKENS.filter(
  (t) => t.isCommunityToken,
);

/** Get HERO tokens for a specific chain */
export const getHeroTokensByChain = (chainId: number): HeroToken[] => {
  return HERO_TOKENS.filter((token) => token.chainId === chainId);
};

/** Get a specific HERO token by symbol and chain */
export const getHeroToken = (
  symbol: string,
  chainId: number,
): HeroToken | undefined => {
  return HERO_TOKENS.find(
    (token) => token.symbol === symbol && token.chainId === chainId,
  );
};

/** Get token by contract address */
export const getTokenByAddress = (address: string): HeroToken | undefined => {
  return HERO_TOKENS.find(
    (token) => token.address.toLowerCase() === address.toLowerCase(),
  );
};
