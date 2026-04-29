/**
 * HERO Wallet Extension — Popup UI Controller
 * Renders the wallet popup interface and handles user interactions.
 *
 * ARCHITECTURE NOTE: This is intentionally vanilla TS (no React/Vue) to keep
 * the extension bundle small (<500KB). Following ZKX Wallet's approach.
 * React can be added in Phase 7 if needed for complex UI.
 */

import { WalletState, ChainId, PrivacyMode, MilitaryRank, MessageType } from '../common/types';
import { sendToBackground } from '../common/messaging';
import { CHAINS } from '../common/chains';

// ============================================================
// State
// ============================================================

let currentState: WalletState = {
  isLocked: true,
  isInitialized: false,
  activeChain: ChainId.PULSECHAIN,
  activeAddress: null,
  balances: {},
  privacyMode: PrivacyMode.PUBLIC,
  xp: 0,
  rank: MilitaryRank.PRIVATE,
};

// ============================================================
// Initialization
// ============================================================

async function init(): Promise<void> {
  // Get current state from background
  const state = await sendToBackground<void, WalletState>(MessageType.GET_STATE, undefined);
  if (state) {
    currentState = state;
  }

  render();

  // Listen for state updates
  chrome.runtime.onMessage.addListener((message) => {
    if (message.type === MessageType.STATE_UPDATE) {
      currentState = message.payload;
      render();
    }
  });
}

// ============================================================
// Render Functions
// ============================================================

function render(): void {
  const app = document.getElementById('app');
  if (!app) return;

  if (!currentState.isInitialized) {
    app.innerHTML = renderWelcome();
    bindWelcomeEvents();
  } else if (currentState.isLocked) {
    app.innerHTML = renderLockScreen();
    bindLockEvents();
  } else {
    app.innerHTML = renderDashboard();
    bindDashboardEvents();
  }
}

function renderLockScreen(): string {
  return `
    <div class="lock-screen">
      <div style="font-size: 64px; margin-bottom: 16px;">🛡️</div>
      <h2>HERO Wallet</h2>
      <p>Enter your password to unlock</p>
      <input type="password" id="unlock-password" placeholder="Password" autocomplete="off" />
      <button id="unlock-btn">Unlock Wallet</button>
    </div>
  `;
}

function renderWelcome(): string {
  return `
    <div class="lock-screen">
      <div style="font-size: 64px; margin-bottom: 16px;">⭐</div>
      <h2>Welcome, Marine</h2>
      <p>Create a new wallet or import an existing one</p>
      <button id="create-btn" style="margin-bottom: 12px;">Create New Wallet</button>
      <button id="import-btn" style="background: transparent; border: 1px solid rgba(0,255,100,0.3); color: #00ff64;">Import Wallet</button>
    </div>
  `;
}

function renderDashboard(): string {
  const chain = CHAINS[currentState.activeChain];
  const isShielded = currentState.privacyMode === PrivacyMode.SHIELDED;
  const address = currentState.activeAddress
    ? `${currentState.activeAddress.slice(0, 6)}...${currentState.activeAddress.slice(-4)}`
    : 'Not Connected';

  return `
    <div class="header">
      <div class="header-logo">
        <div style="width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,#00ff64,#00d4ff);display:flex;align-items:center;justify-content:center;font-size:14px;">⭐</div>
        <span>HERO</span>
      </div>
      <div class="chain-selector" id="chain-selector">
        <div class="chain-dot" style="background:${chain.iconColor}"></div>
        ${chain.name}
        <span style="font-size:10px;">▼</span>
      </div>
    </div>

    <div class="balance-card">
      <div class="balance-label">Total Balance</div>
      <div class="balance-amount">$0.00</div>
      <div class="balance-usd">${address}</div>
    </div>

    <div class="privacy-bar">
      <span class="shield-icon">${isShielded ? '🛡️' : '👁️'}</span>
      <span class="status">${isShielded ? 'Shielded' : 'Public'}</span>
      <div class="privacy-toggle ${isShielded ? 'active' : ''}" id="privacy-toggle"></div>
    </div>

    <div class="actions">
      <div class="action-btn send" id="btn-send">
        <div class="icon">↑</div>
        <span class="label">Send</span>
      </div>
      <div class="action-btn receive" id="btn-receive">
        <div class="icon">↓</div>
        <span class="label">Receive</span>
      </div>
      <div class="action-btn swap" id="btn-swap">
        <div class="icon">⇄</div>
        <span class="label">Swap</span>
      </div>
      <div class="action-btn bridge" id="btn-bridge">
        <div class="icon">🌉</div>
        <span class="label">Bridge</span>
      </div>
    </div>

    <div class="xp-bar">
      <div class="xp-header">
        <span class="xp-rank">⭐ ${currentState.rank}</span>
        <span class="xp-amount">${currentState.xp} XP</span>
      </div>
      <div class="xp-progress">
        <div class="xp-fill" style="width: ${Math.min((currentState.xp / 1000) * 100, 100)}%"></div>
      </div>
    </div>

    <div class="token-list">
      <div class="token-list-header">Tokens</div>
      <div class="token-item">
        <div class="token-left">
          <div class="token-icon" style="background:linear-gradient(135deg,#00ff64,#00d4ff);color:#0a0e17;">H</div>
          <div>
            <div class="token-name">$HERO</div>
            <div class="token-chain">${chain.name}</div>
          </div>
        </div>
        <div class="token-right">
          <div class="token-balance">0.00</div>
          <div class="token-value">$0.00</div>
        </div>
      </div>
      <div class="token-item">
        <div class="token-left">
          <div class="token-icon" style="background:linear-gradient(135deg,#ffa500,#ff6b00);color:#0a0e17;">V</div>
          <div>
            <div class="token-name">$VETS</div>
            <div class="token-chain">${chain.name}</div>
          </div>
        </div>
        <div class="token-right">
          <div class="token-balance">0.00</div>
          <div class="token-value">$0.00</div>
        </div>
      </div>
      <div class="token-item">
        <div class="token-left">
          <div class="token-icon" style="background:rgba(255,255,255,0.1);color:#e0e6ed;">${chain.symbol[0]}</div>
          <div>
            <div class="token-name">${chain.symbol}</div>
            <div class="token-chain">${chain.name} (Native)</div>
          </div>
        </div>
        <div class="token-right">
          <div class="token-balance">0.00</div>
          <div class="token-value">$0.00</div>
        </div>
      </div>
    </div>
  `;
}

// ============================================================
// Event Bindings
// ============================================================

function bindLockEvents(): void {
  const unlockBtn = document.getElementById('unlock-btn');
  const passwordInput = document.getElementById('unlock-password') as HTMLInputElement;

  unlockBtn?.addEventListener('click', async () => {
    const password = passwordInput?.value;
    if (!password) return;
    await sendToBackground(MessageType.UNLOCK_WALLET, { password });
  });

  passwordInput?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') unlockBtn?.click();
  });
}

function bindWelcomeEvents(): void {
  document.getElementById('create-btn')?.addEventListener('click', () => {
    // TODO: Generate mnemonic and show to user
    alert('Create wallet flow — coming in next release');
  });

  document.getElementById('import-btn')?.addEventListener('click', () => {
    // TODO: Show mnemonic import form
    alert('Import wallet flow — coming in next release');
  });
}

function bindDashboardEvents(): void {
  document.getElementById('privacy-toggle')?.addEventListener('click', async () => {
    if (currentState.privacyMode === PrivacyMode.SHIELDED) {
      await sendToBackground(MessageType.UNSHIELD_TOKENS, undefined);
    } else {
      await sendToBackground(MessageType.SHIELD_TOKENS, undefined);
    }
  });

  document.getElementById('chain-selector')?.addEventListener('click', () => {
    // TODO: Show chain selection dropdown
    const chains = [ChainId.PULSECHAIN, ChainId.BASE, ChainId.ETHEREUM];
    const currentIdx = chains.indexOf(currentState.activeChain);
    const nextChain = chains[(currentIdx + 1) % chains.length];
    sendToBackground(MessageType.SWITCH_CHAIN, { chainId: nextChain });
  });

  document.getElementById('btn-send')?.addEventListener('click', () => {
    alert('Send flow — coming in next release');
  });

  document.getElementById('btn-receive')?.addEventListener('click', () => {
    alert('Receive — address copied to clipboard');
  });

  document.getElementById('btn-swap')?.addEventListener('click', () => {
    // Open herobase.io swap in new tab
    chrome.tabs.create({ url: 'https://herobase.io/swap' });
  });

  document.getElementById('btn-bridge')?.addEventListener('click', () => {
    alert('Bridge flow — coming in next release');
  });
}

// ============================================================
// Boot
// ============================================================

document.addEventListener('DOMContentLoaded', init);
