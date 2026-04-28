/**
 * HERO Ecosystem Token Definitions
 *
 * Native token support for $HERO and $VETS across PulseChain and Base.
 * These tokens are pre-configured for ZK shielding and private transfers.
 */

export interface HeroToken {
  readonly name: string;
  readonly symbol: string;
  readonly decimals: number;
  readonly address: string;
  readonly chainId: number;
  readonly logoURI?: string;
  readonly isNative: boolean;
}

/**
 * $HERO Token — PulseChain
 * The primary governance and utility token of the HERO ecosystem.
 */
export const HERO_PULSECHAIN: HeroToken = {
  name: 'HERO',
  symbol: 'HERO',
  decimals: 18,
  // PLACEHOLDER — MUST replace with actual deployed contract before production
  // Zero address will cause transactions to FAIL. Do NOT send funds to this address.
  address: '0x0000000000000000000000000000000000000000',
  chainId: 369,
  isNative: false,
};

/**
 * $HERO Token — Base
 * HERO token bridged to Base L2.
 */
export const HERO_BASE: HeroToken = {
  name: 'HERO',
  symbol: 'HERO',
  decimals: 18,
  // PLACEHOLDER — MUST replace with actual deployed contract before production
  // Zero address will cause transactions to FAIL. Do NOT send funds to this address.
  address: '0x0000000000000000000000000000000000000000',
  chainId: 8453,
  isNative: false,
};

/**
 * $VETS Token — PulseChain
 * Community token for the VetsInCrypto ecosystem.
 */
export const VETS_PULSECHAIN: HeroToken = {
  name: 'VETS',
  symbol: 'VETS',
  decimals: 18,
  // PLACEHOLDER — MUST replace with actual deployed contract before production
  // Zero address will cause transactions to FAIL. Do NOT send funds to this address.
  address: '0x0000000000000000000000000000000000000000',
  chainId: 369,
  isNative: false,
};

/**
 * Sentinel value for placeholder addresses.
 * Use this to check if a token address has been configured.
 */
export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

/**
 * Check if a token has a real (non-placeholder) address
 */
export const isTokenConfigured = (token: HeroToken): boolean => {
  return token.address !== ZERO_ADDRESS && token.address.length === 42;
};

/**
 * All HERO ecosystem tokens
 */
export const HERO_TOKENS: readonly HeroToken[] = [
  HERO_PULSECHAIN,
  HERO_BASE,
  VETS_PULSECHAIN,
] as const;

/**
 * Get HERO tokens for a specific chain
 */
export const getHeroTokensByChain = (chainId: number): HeroToken[] => {
  return HERO_TOKENS.filter((token) => token.chainId === chainId);
};

/**
 * Get a specific HERO token by symbol and chain
 */
export const getHeroToken = (
  symbol: string,
  chainId: number,
): HeroToken | undefined => {
  return HERO_TOKENS.find(
    (token) => token.symbol === symbol && token.chainId === chainId,
  );
};
