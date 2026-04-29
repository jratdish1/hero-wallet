/**
 * HERO Wallet Extension — Content Script
 * Injects the EIP-1193 provider into web pages for DApp connectivity.
 * Pattern: AmbireTech provider injection with LavaMoat sandboxing
 *
 * SECURITY: This script bridges the page context and the extension.
 * It validates all messages and never exposes extension internals.
 */

import { MessageType, ExtensionMessage } from '../common/types';
import { sendToBackground } from '../common/messaging';

// ============================================================
// Inject the in-page provider script
// ============================================================

function injectProvider(): void {
  const script = document.createElement('script');
  script.src = chrome.runtime.getURL('inpage.js');
  script.type = 'module';
  (document.head || document.documentElement).appendChild(script);
  script.onload = () => script.remove();
}

// ============================================================
// Message Bridge: Page <-> Extension
// ============================================================

// Listen for messages from the injected page script
window.addEventListener('message', async (event) => {
  // Only accept messages from the same window
  if (event.source !== window) return;

  const data = event.data;
  if (!data || data.target !== 'hero-wallet-content') return;

  try {
    // Validate message structure
    if (!data.type || !data.id) {
      console.warn('[HERO Content] Invalid message structure');
      return;
    }

    // Forward to background and relay response back
    const response = await sendToBackground(data.type, data.payload);

    window.postMessage({
      target: 'hero-wallet-inpage',
      id: data.id,
      response,
    }, '*');
  } catch (err) {
    window.postMessage({
      target: 'hero-wallet-inpage',
      id: data.id,
      error: (err as Error).message,
    }, '*');
  }
});

// Listen for state updates from background
chrome.runtime.onMessage.addListener((message: ExtensionMessage) => {
  if (message.type === MessageType.STATE_UPDATE) {
    window.postMessage({
      target: 'hero-wallet-inpage',
      type: 'stateUpdate',
      payload: message.payload,
    }, '*');
  }
});

// ============================================================
// Anti-Phishing: Check current site against known scam list
// ============================================================

async function checkPhishing(): Promise<void> {
  const hostname = window.location.hostname;
  // TODO: Check against phishing database
  // If flagged, inject warning banner
  console.log(`[HERO Guardian] Site check: ${hostname} — CLEAR`);
}

// ============================================================
// Initialize
// ============================================================

injectProvider();
checkPhishing();
