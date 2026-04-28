/**
 * Base Network Configuration for HERO Wallet
 * Chain ID: 8453
 *
 * Base is an Ethereum L2 built by Coinbase.
 * This config enables ZK privacy transactions on Base.
 */

export const BASE_CONFIG = {
  name: 'Base',
  chainId: 8453,
  rpcUrls: [
    'https://mainnet.base.org',
    'https://base-rpc.publicnode.com',
    'https://base.meowrpc.com',
  ],
  blockExplorer: 'https://basescan.org',
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  // RAILGUN contract addresses on Base
  // These need to be deployed for full ZK support
  contracts: {
    railgunProxy: '', // TBD: Deploy RAILGUN proxy on Base
    relayAdapt: '', // TBD: Deploy relay adapter
    poseidonT3: '', // TBD: Deploy Poseidon hash
    poseidonT4: '', // TBD: Deploy Poseidon hash
  },
} as const;

export const BASE_SEPOLIA_CONFIG = {
  name: 'Base Sepolia',
  chainId: 84532,
  rpcUrls: ['https://sepolia.base.org'],
  blockExplorer: 'https://sepolia.basescan.org',
  nativeCurrency: {
    name: 'Sepolia Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  contracts: {
    railgunProxy: '',
    relayAdapt: '',
    poseidonT3: '',
    poseidonT4: '',
  },
} as const;
