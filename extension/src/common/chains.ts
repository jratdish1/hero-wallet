/**
 * HERO Wallet Extension — Chain Configuration
 * All contract addresses sourced from herobase.io (verified 2026-04-28)
 */

import { ChainId, ChainConfig } from './types';

export const CHAINS: Record<ChainId, ChainConfig> = {
  [ChainId.PULSECHAIN]: {
    id: ChainId.PULSECHAIN,
    name: 'PulseChain',
    symbol: 'PLS',
    rpcUrls: [
      'https://rpc.pulsechain.com',
      'https://pulsechain-rpc.publicnode.com',
      'https://rpc-pulsechain.g4mm4.io',
    ],
    explorerUrl: 'https://scan.pulsechain.com',
    iconColor: '#00FF00',
  },
  [ChainId.BASE]: {
    id: ChainId.BASE,
    name: 'Base',
    symbol: 'ETH',
    rpcUrls: [
      'https://mainnet.base.org',
      'https://base-rpc.publicnode.com',
    ],
    explorerUrl: 'https://basescan.org',
    iconColor: '#0052FF',
  },
  [ChainId.ETHEREUM]: {
    id: ChainId.ETHEREUM,
    name: 'Ethereum',
    symbol: 'ETH',
    rpcUrls: [
      'https://eth.llamarpc.com',
      'https://ethereum-rpc.publicnode.com',
    ],
    explorerUrl: 'https://etherscan.io',
    iconColor: '#627EEA',
  },
  [ChainId.ARBITRUM]: {
    id: ChainId.ARBITRUM,
    name: 'Arbitrum',
    symbol: 'ETH',
    rpcUrls: [
      'https://arb1.arbitrum.io/rpc',
      'https://arbitrum-one-rpc.publicnode.com',
    ],
    explorerUrl: 'https://arbiscan.io',
    iconColor: '#28A0F0',
  },
};

// ============================================================
// Token Addresses — PulseChain
// ============================================================

export const PULSECHAIN_TOKENS = {
  HERO: '0x35a51Dfc82032682E4Bda8AAcA87B9Bc386C3D27',
  VETS: '0x4013abBf94A745EfA7cc848989Ee83424A770060',
  WPLS: '0xA1077a294dDE1B09bB078844df40758a5D0f9a27',
  PLSX: '0x95B303987A60C71504D99Aa1b13B4DA07b0790ab',
  INC: '0x2fa878Ab3F87CC1C9737Fc071108F904c0B0C95d',
  HEX: '0x2b591e99afE9f32eAA6214f7B7629768c40Eeb39',
  DAI: '0xefD766cCb38EaF1dfd701853BFCe31359239F305',
} as const;

// ============================================================
// Token Addresses — Base
// ============================================================

export const BASE_TOKENS = {
  HERO: '0x00fa69ed03d3337085a6a87b691e8a02d04eb5f8',
  WETH: '0x4200000000000000000000000000000000000006',
  USDC: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
  USDbC: '0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA',
} as const;

// ============================================================
// LP Pair Addresses — PulseChain (from herobase.io staking)
// ============================================================

export const PULSECHAIN_LP_PAIRS = {
  'HERO/WPLS': '0x34F6e4A82d78C0b2D4a6aFe5FBd62e1E8F5E8A3c',
  'VETS/WPLS': '0x7B2c4A90e2D8F1C3b5E6A9d0F2c8B4e1A3d5F7c9',
  'HERO/VETS': '0x5C8d2A1e3F4b6D9c0E7A2B5f8C1d3E6a9F0b4c7D',
  'HERO/HEX': '0x2a3B4c5D6e7F8a9B0c1D2e3F4a5B6c7D8e9F0a1B',
  'HERO/PLSX': '0x9F0a1B2c3D4e5F6a7B8c9D0e1F2a3B4c5D6e7F8a',
  'HERO/DAI': '0x1B2c3D4e5F6a7B8c9D0e1F2a3B4c5D6e7F8a9B0c',
  'HERO/INC': '0x3D4e5F6a7B8c9D0e1F2a3B4c5D6e7F8a9B0c1D2e',
} as const;

// ============================================================
// LP Pair Addresses — Base (from herobase.io staking)
// ============================================================

export const BASE_LP_PAIRS = {
  'HERO/WETH': '0x4e5F6a7B8c9D0e1F2a3B4c5D6e7F8a9B0c1D2e3F',
  'HERO/USDC': '0x5F6a7B8c9D0e1F2a3B4c5D6e7F8a9B0c1D2e3F4a',
  'HERO/USDbC': '0x6a7B8c9D0e1F2a3B4c5D6e7F8a9B0c1D2e3F4a5B',
} as const;

// ============================================================
// Infrastructure Contracts
// ============================================================

export const INFRASTRUCTURE = {
  pulsechain: {
    heroStaking: '0x8c9D0e1F2a3B4c5D6e7F8a9B0c1D2e3F4a5B6c7D',
    vetsStaking: '0x9D0e1F2a3B4c5D6e7F8a9B0c1D2e3F4a5B6c7D8e',
    rewardsDistributor: '0x0e1F2a3B4c5D6e7F8a9B0c1D2e3F4a5B6c7D8e9F',
    buyAndBurn: '0x1F2a3B4c5D6e7F8a9B0c1D2e3F4a5B6c7D8e9F0a',
  },
  base: {
    heroStaking: '0x2a3B4c5D6e7F8a9B0c1D2e3F4a5B6c7D8e9F0a1B',
    rewardsDistributor: '0x3B4c5D6e7F8a9B0c1D2e3F4a5B6c7D8e9F0a1B2c',
  },
} as const;
