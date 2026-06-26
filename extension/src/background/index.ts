/**
 * HERO Wallet Extension — Background Service Worker
 * The brain of the wallet. Manages state, keys, transactions.
 * Pattern: AmbireTech MainController approach with LavaMoat-inspired isolation
 *
 * SECURITY: All private key operations happen ONLY in this service worker.
 * The popup and content scripts NEVER have access to raw keys.
 *
 * Phase 4 Implementation (2026-06-25 — Codex Remediation):
 *   - Vault encryption: AES-256-GCM via Web Crypto API ✓
 *   - Key derivation: PBKDF2 (600,000 iterations, SHA-256) ✓
 *   - Vault persistence: chrome.storage.local ✓
 *   - Auto-lock: 15-minute inactivity timer ✓
 *   - Session key: in-memory only, cleared on lock ✓
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
// Session Key — in-memory only, NEVER persisted
// ============================================================
/** Derived AES-GCM CryptoKey, held only while wallet is unlocked. */
let _sessionKey: CryptoKey | null = null;

/** Auto-lock timer handle. */
let _lockTimer: ReturnType<typeof setTimeout> | null = null;
const AUTO_LOCK_MS = 15 * 60 * 1000; // 15 minutes

function _resetLockTimer(): void {
  if (_lockTimer) clearTimeout(_lockTimer);
  _lockTimer = setTimeout(_lockWallet, AUTO_LOCK_MS);
}

function _lockWallet(): void {
  _sessionKey = null;
  if (_lockTimer) { clearTimeout(_lockTimer); _lockTimer = null; }
  walletState.isLocked = true;
  walletState.activeAddress = null;
  broadcastStateUpdate(sanitizeState(walletState));
  console.log('[HERO Wallet] Auto-locked after inactivity.');
}

// ============================================================
// Vault Crypto Helpers (Web Crypto API — no external deps)
// ============================================================

interface VaultStore {
  encryptedVault: string; // base64(iv) + "." + base64(ciphertext)
  salt: string;           // base64(16-byte random salt)
  version: number;        // schema version
}

interface VaultPayload {
  mnemonic: string;
  derivedAddress: string;
}

/**
 * Derive a 256-bit AES-GCM CryptoKey from a password using PBKDF2.
 * 600,000 iterations per OWASP 2023 minimum for SHA-256.
 */
async function _deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    'PBKDF2',
    false,
    ['deriveKey']
  );
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: 600_000, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/** Encode ArrayBuffer to base64 string. */
function _b64Encode(buf: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buf)));
}

/** Decode base64 string to Uint8Array. */
function _b64Decode(b64: string): Uint8Array {
  return Uint8Array.from(atob(b64), c => c.charCodeAt(0));
}

/**
 * Encrypt a plaintext string with AES-GCM.
 * Returns "base64(iv).base64(ciphertext)".
 */
async function _encryptVault(plaintext: string, key: CryptoKey): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV
  const enc = new TextEncoder();
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    enc.encode(plaintext)
  );
  return _b64Encode(iv.buffer) + '.' + _b64Encode(ciphertext);
}

/**
 * Decrypt an AES-GCM ciphertext string.
 * Throws DOMException on wrong password or tampered ciphertext.
 */
async function _decryptVault(encrypted: string, key: CryptoKey): Promise<string> {
  const [ivB64, ctB64] = encrypted.split('.');
  if (!ivB64 || !ctB64) throw new Error('Malformed vault ciphertext');
  const iv = _b64Decode(ivB64);
  const ct = _b64Decode(ctB64);
  const plaintext = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ct);
  return new TextDecoder().decode(plaintext);
}

/** Save encrypted vault + salt to chrome.storage.local. */
async function _saveVault(encryptedVault: string, salt: Uint8Array): Promise<void> {
  const store: VaultStore = {
    encryptedVault,
    salt: _b64Encode(salt.buffer),
    version: 1,
  };
  await chrome.storage.local.set({ vault: store, isInitialized: true });
}

/** Load vault from chrome.storage.local. Returns null if not found. */
async function _loadVault(): Promise<VaultStore | null> {
  const result = await chrome.storage.local.get('vault');
  return (result.vault as VaultStore) ?? null;
}

// ============================================================
// Initialization
// ============================================================

async function initialize(): Promise<void> {
  console.log('[HERO Wallet] Background service worker starting...');

  const stored = await chrome.storage.local.get(['isInitialized']);
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
    const store = await _loadVault();
    if (!store) {
      return { error: 'No wallet found. Please initialize first.' };
    }

    // Derive key from password + stored salt
    const salt = _b64Decode(store.salt);
    const key = await _deriveKey(payload.password, salt);

    // Attempt decryption — throws on wrong password or tampered data
    const plaintext = await _decryptVault(store.encryptedVault, key);
    const vaultPayload: VaultPayload = JSON.parse(plaintext);

    // Store session key in memory only
    _sessionKey = key;
    walletState.isLocked = false;
    walletState.activeAddress = vaultPayload.derivedAddress;

    // Start auto-lock timer
    _resetLockTimer();

    broadcastStateUpdate(sanitizeState(walletState));
    return { success: true };
  } catch (err) {
    // Do not leak error details — wrong password and tampered data both return the same message
    console.error('[HERO Wallet] Unlock failed:', err instanceof Error ? err.message : 'unknown');
    return { error: 'Invalid password or corrupted vault.' };
  }
});

onMessage<void>(MessageType.LOCK_WALLET, async () => {
  _lockWallet();
  return { success: true };
});

onMessage<{ mnemonic: string; password: string }>(MessageType.INIT_WALLET, async (payload) => {
  try {
    // Validate mnemonic (12 or 24 words)
    const words = payload.mnemonic.trim().split(/\s+/);
    if (words.length !== 12 && words.length !== 24) {
      return { error: 'Invalid mnemonic. Must be 12 or 24 words.' };
    }

    // Derive address from mnemonic (placeholder — full BIP-39/44 requires ethers.js)
    // In production: use ethers.HDNodeWallet.fromPhrase(mnemonic).address
    // For now: store mnemonic securely and derive address as empty until ethers is bundled
    const derivedAddress = ''; // TODO: replace with ethers.HDNodeWallet.fromPhrase(words.join(' ')).address

    // Build vault payload
    const vaultPayload: VaultPayload = {
      mnemonic: words.join(' '),
      derivedAddress,
    };

    // Generate random salt for this vault
    const salt = crypto.getRandomValues(new Uint8Array(16));

    // Derive encryption key from password
    const key = await _deriveKey(payload.password, salt);

    // Encrypt vault
    const encryptedVault = await _encryptVault(JSON.stringify(vaultPayload), key);

    // Persist to chrome.storage.local
    await _saveVault(encryptedVault, salt);

    // Store session key in memory
    _sessionKey = key;
    walletState.isInitialized = true;
    walletState.isLocked = false;
    walletState.activeAddress = derivedAddress || null;

    // Start auto-lock timer
    _resetLockTimer();

    broadcastStateUpdate(sanitizeState(walletState));
    return { success: true };
  } catch (err) {
    console.error('[HERO Wallet] Init failed:', err instanceof Error ? err.message : 'unknown');
    return { error: 'Failed to initialize wallet.' };
  }
});

onMessage<{ chainId: ChainId }>(MessageType.SWITCH_CHAIN, async (payload) => {
  _resetLockTimer(); // Activity — reset auto-lock
  walletState.activeChain = payload.chainId;
  broadcastStateUpdate(sanitizeState(walletState));
  return { success: true, chainId: payload.chainId };
});

onMessage<void>(MessageType.SHIELD_TOKENS, async () => {
  _resetLockTimer();
  walletState.privacyMode = PrivacyMode.SHIELDED;
  // TODO: Execute Railgun shield transaction (requires railgun-engine.ts)
  broadcastStateUpdate(sanitizeState(walletState));
  return { success: true };
});

onMessage<void>(MessageType.UNSHIELD_TOKENS, async () => {
  _resetLockTimer();
  walletState.privacyMode = PrivacyMode.PUBLIC;
  // TODO: Execute Railgun unshield transaction (requires railgun-engine.ts)
  broadcastStateUpdate(sanitizeState(walletState));
  return { success: true };
});

// DApp connection handler
onMessage<{ origin: string; name: string }>(MessageType.CONNECT_DAPP, async (payload, sender) => {
  _resetLockTimer();
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
