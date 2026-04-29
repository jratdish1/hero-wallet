/**
 * HERO Wallet Extension — Shared Types
 * Pattern: AmbireTech ambire-common submodule approach
 * All shared types live here to maintain DRY across popup/background/content
 */

// ============================================================
// Chain Configuration
// ============================================================

export enum ChainId {
  PULSECHAIN = 369,
  BASE = 8453,
  ETHEREUM = 1,
  ARBITRUM = 42161,
}

export interface ChainConfig {
  id: ChainId;
  name: string;
  symbol: string;
  rpcUrls: string[];
  explorerUrl: string;
  iconColor: string;
}

// ============================================================
// Wallet State
// ============================================================

export interface WalletState {
  isLocked: boolean;
  isInitialized: boolean;
  activeChain: ChainId;
  activeAddress: string | null;
  balances: Record<string, TokenBalance>;
  privacyMode: PrivacyMode;
  xp: number;
  rank: MilitaryRank;
}

export interface TokenBalance {
  symbol: string;
  address: string;
  balance: string;
  decimals: number;
  usdValue?: number;
  isShielded: boolean;
}

export enum PrivacyMode {
  PUBLIC = 'PUBLIC',
  SHIELDED = 'SHIELDED',
  MIXED = 'MIXED',
}

// ============================================================
// Military Rank System
// ============================================================

export enum MilitaryRank {
  PRIVATE = 'Private',
  PFC = 'Private First Class',
  LANCE_CORPORAL = 'Lance Corporal',
  CORPORAL = 'Corporal',
  SERGEANT = 'Sergeant',
  STAFF_SERGEANT = 'Staff Sergeant',
  GUNNERY_SERGEANT = 'Gunnery Sergeant',
  MASTER_SERGEANT = 'Master Sergeant',
  FIRST_SERGEANT = 'First Sergeant',
  SERGEANT_MAJOR = 'Sergeant Major',
}

// ============================================================
// Message Passing (Background <-> Popup <-> Content)
// ============================================================

export enum MessageType {
  // Wallet lifecycle
  INIT_WALLET = 'INIT_WALLET',
  UNLOCK_WALLET = 'UNLOCK_WALLET',
  LOCK_WALLET = 'LOCK_WALLET',
  GET_STATE = 'GET_STATE',
  STATE_UPDATE = 'STATE_UPDATE',

  // Transactions
  SEND_TX = 'SEND_TX',
  SIGN_TX = 'SIGN_TX',
  SIGN_MESSAGE = 'SIGN_MESSAGE',
  TX_RESULT = 'TX_RESULT',

  // Privacy
  SHIELD_TOKENS = 'SHIELD_TOKENS',
  UNSHIELD_TOKENS = 'UNSHIELD_TOKENS',

  // Swap
  GET_SWAP_QUOTE = 'GET_SWAP_QUOTE',
  EXECUTE_SWAP = 'EXECUTE_SWAP',

  // DApp connection
  CONNECT_DAPP = 'CONNECT_DAPP',
  DISCONNECT_DAPP = 'DISCONNECT_DAPP',
  DAPP_REQUEST = 'DAPP_REQUEST',
  DAPP_RESPONSE = 'DAPP_RESPONSE',

  // Chain
  SWITCH_CHAIN = 'SWITCH_CHAIN',
}

export interface ExtensionMessage<T = unknown> {
  type: MessageType;
  payload: T;
  id: string;
  timestamp: number;
}

// ============================================================
// DApp Connection (EIP-1193 Provider)
// ============================================================

export interface DAppConnection {
  origin: string;
  name: string;
  icon?: string;
  chainId: ChainId;
  connectedAt: number;
  permissions: DAppPermission[];
}

export enum DAppPermission {
  VIEW_BALANCE = 'VIEW_BALANCE',
  SEND_TX = 'SEND_TX',
  SIGN_MESSAGE = 'SIGN_MESSAGE',
}

// ============================================================
// Guardian Agent Alerts
// ============================================================

export interface GuardianAlert {
  id: string;
  severity: 'info' | 'warning' | 'critical';
  message: string;
  timestamp: number;
  action?: 'freeze' | 'notify' | 'block';
}
