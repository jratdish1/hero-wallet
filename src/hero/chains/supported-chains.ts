/**
 * HERO Wallet — Multi-Chain Support Configuration
 * 
 * Defines all supported chains for the HERO ecosystem.
 * Users can swap from any popular chain into HERO on PulseChain and Base.
 * 
 * Privacy levels:
 * - FULL: Native Railgun contracts deployed (shield/unshield/private send)
 * - BRIDGE: Privacy via Railgun on Ethereum, then bridge to target chain
 * - STANDARD: No ZK privacy, standard bridging only
 * 
 * @module hero/chains
 * @version 0.2.0
 * @security CODEX-AUDIT-REQUIRED
 */

// ============================================================
// TYPES
// ============================================================

export enum PrivacyLevel {
  /** Native Railgun contracts deployed on this chain */
  FULL = 'FULL',
  /** Privacy via bridge through Railgun on Ethereum */
  BRIDGE = 'BRIDGE',
  /** Standard chain, no ZK privacy available */
  STANDARD = 'STANDARD',
}

export enum RolloutPhase {
  PHASE_1 = 1,
  PHASE_2 = 2,
  PHASE_3 = 3,
}

export interface ChainConfig {
  chainId: number;
  name: string;
  shortName: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrls: string[];
  blockExplorerUrl: string;
  privacyLevel: PrivacyLevel;
  rolloutPhase: RolloutPhase;
  isHeroEcosystem: boolean;
  /** Railgun contract address on this chain (empty if not deployed) */
  railgunContractAddress: string;
}

// ============================================================
// VALIDATION
// ============================================================

function validateChainId(chainId: number): void {
  if (!Number.isInteger(chainId) || chainId <= 0) {
    throw new Error(`Invalid chain ID: ${chainId}. Must be a positive integer.`);
  }
}

function validateRpcUrl(url: string): void {
  try {
    const parsed = new URL(url);
    if (!['http:', 'https:', 'wss:'].includes(parsed.protocol)) {
      throw new Error(`Invalid RPC URL protocol: ${parsed.protocol}`);
    }
  } catch {
    throw new Error(`Invalid RPC URL: ${url}`);
  }
}

// ============================================================
// CHAIN DEFINITIONS
// ============================================================

/**
 * PulseChain — Primary HERO ecosystem chain.
 * Privacy: Bridge-based via Railgun on Ethereum (LibertySwap approach).
 */
export const PULSECHAIN: ChainConfig = {
  chainId: 369,
  name: 'PulseChain',
  shortName: 'PLS',
  nativeCurrency: { name: 'Pulse', symbol: 'PLS', decimals: 18 },
  rpcUrls: ['https://rpc.pulsechain.com', 'https://rpc-pulsechain.g4mm4.io'],
  blockExplorerUrl: 'https://scan.pulsechain.com',
  privacyLevel: PrivacyLevel.BRIDGE,
  rolloutPhase: RolloutPhase.PHASE_1,
  isHeroEcosystem: true,
  railgunContractAddress: '', // Not natively deployed — uses bridge via Ethereum
};

/**
 * Base — Secondary HERO ecosystem chain.
 * Privacy: Pending native Railgun deployment.
 */
export const BASE: ChainConfig = {
  chainId: 8453,
  name: 'Base',
  shortName: 'BASE',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: ['https://mainnet.base.org', 'https://base.meowrpc.com'],
  blockExplorerUrl: 'https://basescan.org',
  privacyLevel: PrivacyLevel.BRIDGE,
  rolloutPhase: RolloutPhase.PHASE_1,
  isHeroEcosystem: true,
  railgunContractAddress: '', // Pending deployment
};

/**
 * Ethereum — Full native Railgun privacy.
 * Primary privacy chain for cross-chain routing.
 */
export const ETHEREUM: ChainConfig = {
  chainId: 1,
  name: 'Ethereum',
  shortName: 'ETH',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: ['https://eth.llamarpc.com', 'https://rpc.ankr.com/eth'],
  blockExplorerUrl: 'https://etherscan.io',
  privacyLevel: PrivacyLevel.FULL,
  rolloutPhase: RolloutPhase.PHASE_1,
  isHeroEcosystem: false,
  railgunContractAddress: '0xfa7093cdd9ee6932b4eb2c9e1cde7ce00b1fa4b9', // Railgun Relay
};

/**
 * Arbitrum — Full native Railgun privacy.
 */
export const ARBITRUM: ChainConfig = {
  chainId: 42161,
  name: 'Arbitrum One',
  shortName: 'ARB',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: ['https://arb1.arbitrum.io/rpc', 'https://rpc.ankr.com/arbitrum'],
  blockExplorerUrl: 'https://arbiscan.io',
  privacyLevel: PrivacyLevel.FULL,
  rolloutPhase: RolloutPhase.PHASE_1,
  isHeroEcosystem: false,
  railgunContractAddress: '0xfa7093cdd9ee6932b4eb2c9e1cde7ce00b1fa4b9', // Railgun Relay
};

/**
 * Polygon — Full native Railgun privacy.
 */
export const POLYGON: ChainConfig = {
  chainId: 137,
  name: 'Polygon',
  shortName: 'MATIC',
  nativeCurrency: { name: 'POL', symbol: 'POL', decimals: 18 },
  rpcUrls: ['https://polygon-rpc.com', 'https://rpc.ankr.com/polygon'],
  blockExplorerUrl: 'https://polygonscan.com',
  privacyLevel: PrivacyLevel.FULL,
  rolloutPhase: RolloutPhase.PHASE_1,
  isHeroEcosystem: false,
  railgunContractAddress: '0xfa7093cdd9ee6932b4eb2c9e1cde7ce00b1fa4b9', // Railgun Relay
};

/**
 * BSC — Full native Railgun privacy.
 */
export const BSC: ChainConfig = {
  chainId: 56,
  name: 'BNB Smart Chain',
  shortName: 'BSC',
  nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
  rpcUrls: ['https://bsc-dataseed.binance.org', 'https://rpc.ankr.com/bsc'],
  blockExplorerUrl: 'https://bscscan.com',
  privacyLevel: PrivacyLevel.FULL,
  rolloutPhase: RolloutPhase.PHASE_1,
  isHeroEcosystem: false,
  railgunContractAddress: '0xfa7093cdd9ee6932b4eb2c9e1cde7ce00b1fa4b9', // Railgun Relay
};

/**
 * Avalanche — Standard chain, Phase 2.
 */
export const AVALANCHE: ChainConfig = {
  chainId: 43114,
  name: 'Avalanche C-Chain',
  shortName: 'AVAX',
  nativeCurrency: { name: 'Avalanche', symbol: 'AVAX', decimals: 18 },
  rpcUrls: ['https://api.avax.network/ext/bc/C/rpc'],
  blockExplorerUrl: 'https://snowtrace.io',
  privacyLevel: PrivacyLevel.STANDARD,
  rolloutPhase: RolloutPhase.PHASE_2,
  isHeroEcosystem: false,
  railgunContractAddress: '',
};

/**
 * Optimism — Standard chain, Phase 2.
 */
export const OPTIMISM: ChainConfig = {
  chainId: 10,
  name: 'Optimism',
  shortName: 'OP',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: ['https://mainnet.optimism.io', 'https://rpc.ankr.com/optimism'],
  blockExplorerUrl: 'https://optimistic.etherscan.io',
  privacyLevel: PrivacyLevel.STANDARD,
  rolloutPhase: RolloutPhase.PHASE_2,
  isHeroEcosystem: false,
  railgunContractAddress: '',
};

// ============================================================
// CHAIN REGISTRY
// ============================================================

/**
 * All supported chains, indexed by chain ID.
 */
export const SUPPORTED_CHAINS: ReadonlyMap<number, ChainConfig> = new Map([
  [PULSECHAIN.chainId, PULSECHAIN],
  [BASE.chainId, BASE],
  [ETHEREUM.chainId, ETHEREUM],
  [ARBITRUM.chainId, ARBITRUM],
  [POLYGON.chainId, POLYGON],
  [BSC.chainId, BSC],
  [AVALANCHE.chainId, AVALANCHE],
  [OPTIMISM.chainId, OPTIMISM],
]);

/**
 * Get chain config by chain ID.
 * Throws if chain is not supported.
 */
export function getChainConfig(chainId: number): ChainConfig {
  validateChainId(chainId);
  const config = SUPPORTED_CHAINS.get(chainId);
  if (!config) {
    throw new Error(`Chain ID ${chainId} is not supported by HERO Wallet.`);
  }
  return config;
}

/**
 * Get all chains for a specific rollout phase.
 */
export function getChainsByPhase(phase: RolloutPhase): ChainConfig[] {
  return Array.from(SUPPORTED_CHAINS.values()).filter(c => c.rolloutPhase === phase);
}

/**
 * Get all chains with full Railgun privacy support.
 */
export function getPrivacyEnabledChains(): ChainConfig[] {
  return Array.from(SUPPORTED_CHAINS.values()).filter(
    c => c.privacyLevel === PrivacyLevel.FULL,
  );
}

/**
 * Get HERO ecosystem chains (PulseChain + Base).
 */
export function getHeroEcosystemChains(): ChainConfig[] {
  return Array.from(SUPPORTED_CHAINS.values()).filter(c => c.isHeroEcosystem);
}

/**
 * Check if a chain has Railgun privacy (full or bridge).
 */
export function hasPrivacy(chainId: number): boolean {
  const config = getChainConfig(chainId);
  return config.privacyLevel !== PrivacyLevel.STANDARD;
}
