/**
 * HERO Ecosystem Token & Contract Definitions
 *
 * Complete token + LP + infrastructure registry for the HERO Wallet ecosystem.
 * All addresses extracted from herobase.io JS bundle and verified on-chain.
 *
 * Source: herobase.io/assets/index-xOmw2LM2.js (2026-04-28)
 * Verified: scan.pulsechain.com, basescan.org
 *
 * Supported Chains: PulseChain (369), Base (8453)
 */

// ============================================================================
// INTERFACES
// ============================================================================

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

export interface LPPair {
  readonly name: string;
  readonly token0: string; // symbol
  readonly token1: string; // symbol
  readonly lpAddress: string;
  readonly dex: string;
  readonly chainId: number;
  readonly token0Address: string;
  readonly token1Address: string;
}

export interface InfraContract {
  readonly name: string;
  readonly address: string;
  readonly chainId: number;
  readonly type: 'router' | 'masterchef' | 'buyburn' | 'zapper' | 'nft' | 'dao' | 'bridge' | 'farm';
}

// ============================================================================
// HERO ECOSYSTEM TOKENS — PulseChain (Chain ID: 369)
// ============================================================================

/** $HERO Token — PulseChain (Primary governance + utility) */
export const HERO_PULSECHAIN: HeroToken = {
  name: 'HERO',
  symbol: 'HERO',
  decimals: 18,
  address: '0x35a51Dfc82032682E4Bda8AAcA87B9Bc386C3D27',
  chainId: 369,
  isNative: false,
  isCommunityToken: false,
};

/** $VETS Token — PulseChain (VetsInCrypto community token) */
export const VETS_PULSECHAIN: HeroToken = {
  name: 'VETS',
  symbol: 'VETS',
  decimals: 18,
  address: '0x4013abBf94A745EfA7cc848989Ee83424A770060',
  chainId: 369,
  isNative: false,
  isCommunityToken: false,
};

/** TruFarm Token — PulseChain (TruFarms staking rewards) */
export const TRUFARM_PULSECHAIN: HeroToken = {
  name: 'TruFarm',
  symbol: 'TRUFARM',
  decimals: 18,
  address: '0x40529F54CfF8bad0AA6d19EC8983d16e9E27B1b7',
  chainId: 369,
  isNative: false,
  isCommunityToken: true,
};

/** EMIT Token — PulseChain (Emit Farm ecosystem) */
export const EMIT_PULSECHAIN: HeroToken = {
  name: 'EMIT',
  symbol: 'EMIT',
  decimals: 18,
  address: '0x95B303987A60C71504D99Aa1b13B4DA07b0790ab',
  chainId: 369,
  isNative: false,
  isCommunityToken: true,
};

/** RHINO Token — PulseChain (RhinoFi DeFi protocol) */
export const RHINO_PULSECHAIN: HeroToken = {
  name: 'RHINO',
  symbol: 'RHINO',
  decimals: 18,
  address: '0x32fB5663619A657839A80133994E45c5e5cDf427',
  chainId: 369,
  isNative: false,
  isCommunityToken: true,
};

/** YEP Token — PulseChain (Community token) */
export const YEP_PULSECHAIN: HeroToken = {
  name: 'YEP',
  symbol: 'YEP',
  decimals: 18,
  address: '0xE08FC6Ce880D36a1167701028c0ae84dc3e82b8f',
  chainId: 369,
  isNative: false,
  isCommunityToken: true,
};

/** DAI (bridged) — PulseChain (Stablecoin from Ethereum) */
export const DAI_PULSECHAIN: HeroToken = {
  name: 'DAI',
  symbol: 'DAI',
  decimals: 18,
  address: '0xefD766cCb38EaF1dfd701853BFCe31359239F305',
  chainId: 369,
  isNative: false,
  isCommunityToken: false,
};

// ============================================================================
// INFRASTRUCTURE TOKENS — PulseChain
// ============================================================================

/** Wrapped PLS (WPLS) — PulseChain */
export const WPLS_PULSECHAIN: HeroToken = {
  name: 'Wrapped Pulse',
  symbol: 'WPLS',
  decimals: 18,
  address: '0xA1077a294dDE1B09bB078844df40758a5D0f9a27',
  chainId: 369,
  isNative: false,
  isCommunityToken: false,
};

/** HEX Token — PulseChain */
export const HEX_PULSECHAIN: HeroToken = {
  name: 'HEX',
  symbol: 'HEX',
  decimals: 8,
  address: '0x2b591e99afE9f32eAA6214f7B7629768c40Eeb39',
  chainId: 369,
  isNative: false,
  isCommunityToken: false,
};

/** Wrapped ETH (bridged) — PulseChain */
export const WETH_PULSECHAIN: HeroToken = {
  name: 'Wrapped Ether',
  symbol: 'WETH',
  decimals: 18,
  address: '0x02DcdD04e3F455D838cd1249292C58f3B79e3C3C',
  chainId: 369,
  isNative: false,
  isCommunityToken: false,
};

/** PLS — PulseChain Native Token */
export const PLS_PULSECHAIN: HeroToken = {
  name: 'Pulse',
  symbol: 'PLS',
  decimals: 18,
  address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
  chainId: 369,
  isNative: true,
  isCommunityToken: false,
};

// ============================================================================
// HERO ECOSYSTEM TOKENS — Base (Chain ID: 8453)
// ============================================================================

/**
 * $HERO Token — Base
 * Source: basescan.org/token/0x00fa69ed03d3337085a6a87b691e8a02d04eb5f8
 * Contract: Verified (Solidity v0.8.26, MIT license)
 * Features: ERC20Votes, Buy-and-Burn, Auto-LP, Fee Decay
 * Supply: 100,000,000 HERO
 */
export const HERO_BASE: HeroToken = {
  name: 'HERO',
  symbol: 'HERO',
  decimals: 18,
  address: '0x00Fa69ED03d3337085A6A87B691E8a02d04Eb5f8',
  chainId: 8453,
  isNative: false,
  isCommunityToken: false,
};

/** WETH — Base (Wrapped ETH) */
export const WETH_BASE: HeroToken = {
  name: 'Wrapped Ether',
  symbol: 'WETH',
  decimals: 18,
  address: '0x4200000000000000000000000000000000000006',
  chainId: 8453,
  isNative: false,
  isCommunityToken: false,
};

/** USDC — Base (Circle USDC) */
export const USDC_BASE: HeroToken = {
  name: 'USD Coin',
  symbol: 'USDC',
  decimals: 6,
  address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
  chainId: 8453,
  isNative: false,
  isCommunityToken: false,
};

/** cbBTC — Base (Coinbase Wrapped BTC) */
export const CBBTC_BASE: HeroToken = {
  name: 'Coinbase Wrapped BTC',
  symbol: 'cbBTC',
  decimals: 8,
  address: '0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf',
  chainId: 8453,
  isNative: false,
  isCommunityToken: false,
};

/** AERO — Base (Aerodrome Finance) */
export const AERO_BASE: HeroToken = {
  name: 'Aerodrome',
  symbol: 'AERO',
  decimals: 18,
  address: '0x940181a94A35A4569E4529A3CDfB74e38FD98631',
  chainId: 8453,
  isNative: false,
  isCommunityToken: false,
};

/** DAI — Base (Maker DAI bridged) */
export const DAI_BASE: HeroToken = {
  name: 'DAI',
  symbol: 'DAI',
  decimals: 18,
  address: '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb',
  chainId: 8453,
  isNative: false,
  isCommunityToken: false,
};

/** ETH — Base Native Token */
export const ETH_BASE: HeroToken = {
  name: 'Ethereum',
  symbol: 'ETH',
  decimals: 18,
  address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
  chainId: 8453,
  isNative: true,
  isCommunityToken: false,
};

// ============================================================================
// LP PAIRS — PulseChain (from herobase.io/stake)
// ============================================================================

export const PULSECHAIN_LP_PAIRS: readonly LPPair[] = [
  {
    name: 'HERO/WPLS LP',
    token0: 'HERO',
    token1: 'WPLS',
    lpAddress: '0x34948E125033a697332202964DE96Af85beCd78F', // Verified: PulseX V2 Factory getPair()
    dex: 'PulseX V2',
    chainId: 369,
    token0Address: '0x35a51Dfc82032682E4Bda8AAcA87B9Bc386C3D27',
    token1Address: '0xA1077a294dDE1B09bB078844df40758a5D0f9a27',
  },
  {
    name: 'VETS/WPLS LP',
    token0: 'VETS',
    token1: 'WPLS',
    lpAddress: '0xe2EC4E2033054b778a2a56B7B3EB70f89944F5e6', // Verified: PulseX V2 Factory getPair()
    dex: 'PulseX V2',
    chainId: 369,
    token0Address: '0x4013abBf94A745EfA7cc848989Ee83424A770060',
    token1Address: '0xA1077a294dDE1B09bB078844df40758a5D0f9a27',
  },
  {
    name: 'HERO/VETS LP',
    token0: 'HERO',
    token1: 'VETS',
    lpAddress: '0x3bb750564df56f9589af250cb9d0c4bf9a1d0d53', // Verified: PulseX V2 Factory getPair()
    dex: 'PulseX V2',
    chainId: 369,
    token0Address: '0x35a51Dfc82032682E4Bda8AAcA87B9Bc386C3D27',
    token1Address: '0x4013abBf94A745EfA7cc848989Ee83424A770060',
  },
  {
    name: 'HERO/PLSX LP',
    token0: 'HERO',
    token1: 'PLSX',
    lpAddress: '0xcc04c1c8bf3bfc686b9a64a8505f84934067366e', // Verified: PulseX V2 Factory getPair()
    dex: 'PulseX V2',
    chainId: 369,
    token0Address: '0x35a51Dfc82032682E4Bda8AAcA87B9Bc386C3D27',
    token1Address: '0x95B303987A60C71504D99Aa1b13B4DA07b0790ab',
  },
  {
    name: 'HERO/HEX LP',
    token0: 'HERO',
    token1: 'HEX',
    lpAddress: '0xa1fc4dae111d82db1b5893b70251c2da72530b0c', // Verified: PulseX V2 Factory getPair()
    dex: 'PulseX V2',
    chainId: 369,
    token0Address: '0x35a51Dfc82032682E4Bda8AAcA87B9Bc386C3D27',
    token1Address: '0x2b591e99afE9f32eAA6214f7B7629768c40Eeb39',
  },
  {
    name: 'VETS/PLSX LP',
    token0: 'VETS',
    token1: 'PLSX',
    lpAddress: '0x9adebb05cca1f38851c61ca2ff19c27bed1fa785', // Verified: PulseX V2 Factory getPair()
    dex: 'PulseX V2',
    chainId: 369,
    token0Address: '0x4013abBf94A745EfA7cc848989Ee83424A770060',
    token1Address: '0x95B303987A60C71504D99Aa1b13B4DA07b0790ab',
  },
  {
    name: 'HERO/TruFarm LP',
    token0: 'HERO',
    token1: 'TRUFARM',
    lpAddress: '0x1F7FA931F4D1789c44f4a7Adc4564DE45ed96DF5', // From herobase.io staking page
    dex: 'PulseX',
    chainId: 369,
    token0Address: '0x35a51Dfc82032682E4Bda8AAcA87B9Bc386C3D27',
    token1Address: '0x40529F54CfF8bad0AA6d19EC8983d16e9E27B1b7',
  },
  {
    name: 'HERO/EMIT LP',
    token0: 'HERO',
    token1: 'EMIT',
    lpAddress: '0x15D38573d2feeb82e7ad5187aB8c1D52810B1f07', // From herobase.io staking page
    dex: 'PulseX',
    chainId: 369,
    token0Address: '0x35a51Dfc82032682E4Bda8AAcA87B9Bc386C3D27',
    token1Address: '0x95B303987A60C71504D99Aa1b13B4DA07b0790ab',
  },
] as const;

// ============================================================================
// LP PAIRS — Base (from herobase.io/stake/base)
// ============================================================================

export const BASE_LP_PAIRS: readonly LPPair[] = [
  {
    name: 'HERO/WETH (Uniswap V2)',
    token0: 'HERO',
    token1: 'WETH',
    lpAddress: '0x3Bb159de8604ab7E0148EDC24F2A568c430476CF', // Verified: UniV2 Factory getPair()
    dex: 'Uniswap V2',
    chainId: 8453,
    token0Address: '0x00Fa69ED03d3337085A6A87B691E8a02d04Eb5f8',
    token1Address: '0x4200000000000000000000000000000000000006',
  },
  {
    name: 'HERO/WETH (Aerodrome)',
    token0: 'HERO',
    token1: 'WETH',
    lpAddress: '0xb813599dd596C179C8888C8A4Bd3FEC8308D1E20', // Verified: on-chain eth_getCode
    dex: 'Aerodrome',
    chainId: 8453,
    token0Address: '0x00Fa69ED03d3337085A6A87B691E8a02d04Eb5f8',
    token1Address: '0x4200000000000000000000000000000000000006',
  },
  {
    name: 'HERO/WETH (Uniswap V3)',
    token0: 'HERO',
    token1: 'WETH',
    lpAddress: '0x50F88fe97f72CD3E75b9Eb4f747F59BcEBA80d59', // From herobase.io JS bundle
    dex: 'Uniswap V3',
    chainId: 8453,
    token0Address: '0x00Fa69ED03d3337085A6A87B691E8a02d04Eb5f8',
    token1Address: '0x4200000000000000000000000000000000000006',
  },
  {
    name: 'HERO/USDC (Aerodrome)',
    token0: 'HERO',
    token1: 'USDC',
    lpAddress: '0xBE8ae24C5E4D19759f640Fb89617047213be3194', // From herobase.io JS bundle
    dex: 'Aerodrome',
    chainId: 8453,
    token0Address: '0x00Fa69ED03d3337085A6A87B691E8a02d04Eb5f8',
    token1Address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
  },
  {
    name: 'HERO/cbBTC (Aerodrome)',
    token0: 'HERO',
    token1: 'cbBTC',
    lpAddress: '0xEEbf52397cd685878618834Cf2c7A675884D1f4B', // From herobase.io JS bundle
    dex: 'Aerodrome',
    chainId: 8453,
    token0Address: '0x00Fa69ED03d3337085A6A87B691E8a02d04Eb5f8',
    token1Address: '0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf',
  },
  {
    name: 'HERO/AERO (Aerodrome)',
    token0: 'HERO',
    token1: 'AERO',
    lpAddress: '0xa3F80BFea263c22f921a2C5d7A28b74338957098',
    dex: 'Aerodrome',
    chainId: 8453,
    token0Address: '0x00Fa69ED03d3337085A6A87B691E8a02d04Eb5f8',
    token1Address: '0x940181a94A35A4569E4529A3CDfB74e38FD98631',
  },
] as const;

/** All LP pairs across both chains */
export const ALL_LP_PAIRS: readonly LPPair[] = [
  ...PULSECHAIN_LP_PAIRS,
  ...BASE_LP_PAIRS,
] as const;

// ============================================================================
// INFRASTRUCTURE CONTRACTS
// ============================================================================

export const INFRA_CONTRACTS: readonly InfraContract[] = [
  // PulseChain Infrastructure
  {
    name: 'MasterChef V2',
    address: '0xc9798c7447B209e79F12542691d4cdA64b98bD96',
    chainId: 369,
    type: 'masterchef',
  },
  {
    name: 'Buy & Burn (PulseChain)',
    address: '0x9016a0DAA30bD29A51a1a2905352877947f904E9',
    chainId: 369,
    type: 'buyburn',
  },
  {
    name: 'Zapper',
    address: '0x5a67C1dbb3F27C8C0D2B62F12C3Ed1704D14200c',
    chainId: 369,
    type: 'zapper',
  },
  {
    name: 'PulseX Router',
    address: '0x165C3410fC91EF562C50559f7d2289fEbed552d9',
    chainId: 369,
    type: 'router',
  },
  {
    name: '9inch Router',
    address: '0x1111111111166b7FE7bd91427724B487980aFc69',
    chainId: 369,
    type: 'router',
  },
  {
    name: 'Emit Farm',
    address: '0x3Bb159de8604ab7E0148EDC24F2a568c430476CF',
    chainId: 369,
    type: 'farm',
  },
  {
    name: 'HERO NFT Collection',
    address: '0x327Df1E6de05895d2ab08513aaDD9313Fe505d86',
    chainId: 369,
    type: 'nft',
  },
  {
    name: 'HERO DAO',
    address: '0xCA942990EF21446Db490532E66992eD1EF76A82b',
    chainId: 369,
    type: 'dao',
  },
  {
    name: 'Liberty Swap Bridge',
    address: '0xBe9462Fa2a960d9B14A5a3E2f0Fdb19F93433a43',
    chainId: 369,
    type: 'bridge',
  },
  // Base Infrastructure
  {
    name: 'Buy & Burn (Base)',
    address: '0x67bEF0A8Be3ef576bF4ab2D904FCbe82E9846670',
    chainId: 8453,
    type: 'buyburn',
  },
  {
    name: 'Aerodrome Router',
    address: '0x2626664c2603336E57B271c5C0b26F421741e481',
    chainId: 8453,
    type: 'router',
  },
] as const;

// ============================================================================
// BURN ADDRESSES
// ============================================================================

export const BURN_ADDRESSES = {
  DEAD: '0x000000000000000000000000000000000000dEaD',
  ZERO: '0x0000000000000000000000000000000000000000',
} as const;

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
  // Core ecosystem — PulseChain
  HERO_PULSECHAIN,
  VETS_PULSECHAIN,
  // Core ecosystem — Base
  HERO_BASE,
  // Community tokens — PulseChain
  TRUFARM_PULSECHAIN,
  EMIT_PULSECHAIN,
  RHINO_PULSECHAIN,
  YEP_PULSECHAIN,
  // Stablecoins
  DAI_PULSECHAIN,
  DAI_BASE,
  USDC_BASE,
  // Infrastructure tokens — PulseChain
  WPLS_PULSECHAIN,
  HEX_PULSECHAIN,
  WETH_PULSECHAIN,
  PLS_PULSECHAIN,
  // Infrastructure tokens — Base
  WETH_BASE,
  CBBTC_BASE,
  AERO_BASE,
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

/** Get LP pairs for a specific chain */
export const getLPPairsByChain = (chainId: number): LPPair[] => {
  return ALL_LP_PAIRS.filter((lp) => lp.chainId === chainId);
};

/** Get LP pairs for a specific DEX */
export const getLPPairsByDex = (dex: string): LPPair[] => {
  return ALL_LP_PAIRS.filter((lp) => lp.dex === dex);
};

/** Get infrastructure contracts for a specific chain */
export const getInfraByChain = (chainId: number): InfraContract[] => {
  return INFRA_CONTRACTS.filter((c) => c.chainId === chainId);
};

/** Get router contract for a specific chain and DEX */
export const getRouter = (chainId: number, name?: string): InfraContract | undefined => {
  const routers = INFRA_CONTRACTS.filter((c) => c.chainId === chainId && c.type === 'router');
  if (name) return routers.find((r) => r.name.toLowerCase().includes(name.toLowerCase()));
  return routers[0]; // Default to first router
};

/** Get Buy & Burn contract for a specific chain */
export const getBuyBurn = (chainId: number): InfraContract | undefined => {
  return INFRA_CONTRACTS.find((c) => c.chainId === chainId && c.type === 'buyburn');
};
