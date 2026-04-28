/**
 * PulseChain Network Configuration for HERO Wallet
 * Chain ID: 369
 *
 * PulseChain is an EVM-compatible blockchain forked from Ethereum.
 * This config enables ZK privacy transactions on PulseChain.
 */

export const PULSECHAIN_CONFIG = {
  name: 'PulseChain',
  chainId: 369,
  rpcUrls: [
    'https://rpc.pulsechain.com',
    'https://pulsechain-rpc.publicnode.com',
    'https://rpc-pulsechain.g4mm4.io',
  ],
  blockExplorer: 'https://scan.pulsechain.com',
  nativeCurrency: {
    name: 'Pulse',
    symbol: 'PLS',
    decimals: 18,
  },
  // RAILGUN contract addresses on PulseChain
  // These need to be deployed or bridged for full ZK support
  contracts: {
    railgunProxy: '', // TBD: Deploy RAILGUN proxy on PulseChain
    relayAdapt: '', // TBD: Deploy relay adapter
    poseidonT3: '', // TBD: Deploy Poseidon hash
    poseidonT4: '', // TBD: Deploy Poseidon hash
  },
} as const;

export const PULSECHAIN_TESTNET_CONFIG = {
  name: 'PulseChain Testnet V4',
  chainId: 943,
  rpcUrls: ['https://rpc.v4.testnet.pulsechain.com'],
  blockExplorer: 'https://scan.v4.testnet.pulsechain.com',
  nativeCurrency: {
    name: 'Test Pulse',
    symbol: 'tPLS',
    decimals: 18,
  },
  contracts: {
    railgunProxy: '',
    relayAdapt: '',
    poseidonT3: '',
    poseidonT4: '',
  },
} as const;
