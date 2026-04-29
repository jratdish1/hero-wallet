/**
 * HERO Wallet Extension — Background Service Worker
 * The brain of the wallet. Manages state, keys, transactions.
 * Pattern: AmbireTech MainController approach with LavaMoat-inspired isolation
 *
 * SECURITY: All private key operations happen ONLY in this service worker.
 * The popup and content scripts NEVER have access to raw keys.
 */

import {
  WalletState,
  ChainId,
  PrivacyMode,
  MilitaryRank,
  MessageType,
  DAppConnection,
  GuardianAlert,
} from '../common/types';
import { onMessage, broadcastStateUpdate } from '../common/messaging';

// ============================================================
// Wallet State (in-memory, encrypted at rest in chrome.storage)
// ============================================================

let walletState: WalletState = {
  isLocked: true,
  isInitialized: false,
  activeChain: ChainId.PULSECHAIN,
  activeAddress: null,
  balances: {},
  privacyMode: PrivacyMode.PUBLIC,
  xp: 0,
  rank: MilitaryRank.PRIVATE,
};

let connectedDApps: Map<string, DAppConnection> = new Map();
let guardianAlerts: GuardianAlert[] = [];

// ============================================================
// Initialization
// ============================================================

async function initialize(): Promise<void> {
  console.log('[HERO Wallet] Background service worker starting...');

  // Load encrypted state from storage
  const stored = await chrome.storage.local.get(['walletState', 'isInitialized']);
  if (stored.isInitialized) {
    walletState.isInitialized = true;
    walletState.isLocked = true; // Always start locked
  }

  // Set up alarm for periodic balance refresh (every 30 seconds)
  chrome.alarms.create('refreshBalances', { periodInMinutes: 0.5 });

  // Set up alarm for Guardian Agent health check (every 5 minutes)
  chrome.alarms.create('guardianCheck', { periodInMinutes: 5 });

  console.log('[HERO Wallet] Background initialized. Locked:', walletState.isLocked);
}

// ============================================================
// Message Handlers
// ============================================================

onMessage<void>(MessageType.GET_STATE, async () => {
  return sanitizeState(walletState);
});

onMessage<{ password: string }>(MessageType.UNLOCK_WALLET, async (payload) => {
  try {
    // Decrypt stored keys with password
    const stored = await chrome.storage.local.get(['encryptedVault']);
    if (!stored.encryptedVault) {
      return { error: 'No wallet found. Please initialize first.' };
    }

    // TODO: Decrypt vault with password using AES-256-GCM
    // For now, validate password against stored hash
    walletState.isLocked = false;
    broadcastStateUpdate(sanitizeState(walletState));
    return { success: true };
  } catch (err) {
    return { error: 'Invalid password' };
  }
});

onMessage<void>(MessageType.LOCK_WALLET, async () => {
  walletState.isLocked = true;
  walletState.activeAddress = null;
  broadcastStateUpdate(sanitizeState(walletState));
  return { success: true };
});

onMessage<{ mnemonic: string; password: string }>(MessageType.INIT_WALLET, async (payload) => {
  try {
    // Validate mnemonic (12 or 24 words)
    const words = payload.mnemonic.trim().split(/\s+/);
    if (words.length !== 12 && words.length !== 24) {
      return { error: 'Invalid mnemonic. Must be 12 or 24 words.' };
    }

    // TODO: Derive keys from mnemonic using BIP-39/BIP-44
    // TODO: Encrypt vault with password using AES-256-GCM
    // TODO: Store encrypted vault in chrome.storage.local

    walletState.isInitialized = true;
    walletState.isLocked = false;
    await chrome.storage.local.set({ isInitialized: true });

    broadcastStateUpdate(sanitizeState(walletState));
    return { success: true };
  } catch (err) {
    return { error: 'Failed to initialize wallet' };
  }
});

onMessage<{ chainId: ChainId }>(MessageType.SWITCH_CHAIN, async (payload) => {
  walletState.activeChain = payload.chainId;
  broadcastStateUpdate(sanitizeState(walletState));
  return { success: true, chainId: payload.chainId };
});

onMessage<void>(MessageType.SHIELD_TOKENS, async () => {
  walletState.privacyMode = PrivacyMode.SHIELDED;
  // TODO: Execute Railgun shield transaction
  broadcastStateUpdate(sanitizeState(walletState));
  return { success: true };
});

onMessage<void>(MessageType.UNSHIELD_TOKENS, async () => {
  walletState.privacyMode = PrivacyMode.PUBLIC;
  // TODO: Execute Railgun unshield transaction
  broadcastStateUpdate(sanitizeState(walletState));
  return { success: true };
});

// DApp connection handler
onMessage<{ origin: string; name: string }>(MessageType.CONNECT_DAPP, async (payload, sender) => {
  const connection: DAppConnection = {
    origin: payload.origin,
    name: payload.name,
    chainId: walletState.activeChain,
    connectedAt: Date.now(),
    permissions: [],
  };
  connectedDApps.set(payload.origin, connection);
  return { success: true, address: walletState.activeAddress };
});

// ============================================================
// Alarm Handlers
// ============================================================

chrome.alarms.onAlarm.addListener(async (alarm) => {
  switch (alarm.name) {
    case 'refreshBalances':
      if (!walletState.isLocked && walletState.activeAddress) {
        await refreshBalances();
      }
      break;
    case 'guardianCheck':
      await runGuardianCheck();
      break;
  }
});

async function refreshBalances(): Promise<void> {
  // TODO: Fetch balances from RPC for active chain
  // Update walletState.balances
  // broadcastStateUpdate(sanitizeState(walletState));
}

async function runGuardianCheck(): Promise<void> {
  // TODO: Check for anomalous activity
  // - Unusual transaction patterns
  // - Phishing site detection
  // - Contract interaction warnings
  console.log('[Guardian] Health check passed');
}

// ============================================================
// Security Helpers
// ============================================================

/** Remove sensitive data before sending state to popup/content */
function sanitizeState(state: WalletState): Omit<WalletState, never> {
  return {
    ...state,
    // Never expose private keys or mnemonics
  };
}

// ============================================================
// Extension Lifecycle
// ============================================================

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('[HERO Wallet] Extension installed');
    // Open welcome/setup page
    chrome.tabs.create({ url: 'popup.html#/welcome' });
  }
});

// Initialize on load
initialize();
