/**
 * HERO Wallet Extension — In-Page Provider (EIP-1193)
 * Injected into web pages to provide window.heroWallet
 * Also announces itself via EIP-6963 for modern DApp discovery
 *
 * This runs in the PAGE context, not the extension context.
 * All communication goes through window.postMessage to the content script.
 */

interface RequestArguments {
  method: string;
  params?: unknown[];
}

type EventHandler = (...args: unknown[]) => void;

let requestId = 0;
const pendingRequests = new Map<string, { resolve: Function; reject: Function }>();

// ============================================================
// EIP-1193 Provider
// ============================================================

class HeroWalletProvider {
  isHeroWallet = true;
  isMetaMask = false; // Don't impersonate MetaMask
  chainId: string | null = null;
  selectedAddress: string | null = null;
  private eventListeners: Map<string, Set<EventHandler>> = new Map();

  constructor() {
    // Listen for responses from content script
    window.addEventListener('message', (event) => {
      if (event.source !== window) return;
      const data = event.data;
      if (!data || data.target !== 'hero-wallet-inpage') return;

      if (data.id && pendingRequests.has(data.id)) {
        const { resolve, reject } = pendingRequests.get(data.id)!;
        pendingRequests.delete(data.id);

        if (data.error) {
          reject(new Error(data.error));
        } else {
          resolve(data.response);
        }
      }

      // Handle state updates
      if (data.type === 'stateUpdate') {
        this.handleStateUpdate(data.payload);
      }
    });
  }

  /** EIP-1193: Send JSON-RPC request */
  async request(args: RequestArguments): Promise<unknown> {
    const id = `hero-req-${Date.now()}-${++requestId}`;

    return new Promise((resolve, reject) => {
      pendingRequests.set(id, { resolve, reject });

      // Timeout after 30 seconds
      setTimeout(() => {
        if (pendingRequests.has(id)) {
          pendingRequests.delete(id);
          reject(new Error('Request timed out'));
        }
      }, 30000);

      window.postMessage({
        target: 'hero-wallet-content',
        type: 'DAPP_REQUEST',
        id,
        payload: {
          method: args.method,
          params: args.params || [],
          origin: window.location.origin,
        },
      }, '*');
    });
  }

  /** EIP-1193: Event emitter */
  on(event: string, handler: EventHandler): this {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(handler);
    return this;
  }

  removeListener(event: string, handler: EventHandler): this {
    this.eventListeners.get(event)?.delete(handler);
    return this;
  }

  private emit(event: string, ...args: unknown[]): void {
    this.eventListeners.get(event)?.forEach((handler) => {
      try {
        handler(...args);
      } catch (err) {
        console.error(`[HERO Wallet] Event handler error:`, err);
      }
    });
  }

  private handleStateUpdate(state: any): void {
    if (state.activeChain && state.activeChain !== this.chainId) {
      this.chainId = `0x${state.activeChain.toString(16)}`;
      this.emit('chainChanged', this.chainId);
    }
    if (state.activeAddress !== this.selectedAddress) {
      this.selectedAddress = state.activeAddress;
      this.emit('accountsChanged', state.activeAddress ? [state.activeAddress] : []);
    }
  }

  /** Legacy: enable() for older DApps */
  async enable(): Promise<string[]> {
    const accounts = await this.request({ method: 'eth_requestAccounts' });
    return accounts as string[];
  }
}

// ============================================================
// Install Provider
// ============================================================

const heroProvider = new HeroWalletProvider();

// Expose as window.heroWallet (primary)
Object.defineProperty(window, 'heroWallet', {
  value: heroProvider,
  writable: false,
  configurable: false,
});

// ============================================================
// EIP-6963: Provider Discovery
// ============================================================

const providerInfo = {
  uuid: 'hero-wallet-v1',
  name: 'HERO Wallet',
  icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><circle cx="16" cy="16" r="15" fill="%23111" stroke="%2300ff00" stroke-width="1"/><polygon points="16,6 20,14 28,14 22,20 24,28 16,24 8,28 10,20 4,14 12,14" fill="%2300ff00"/></svg>',
  rdns: 'io.herobase.wallet',
};

// Announce provider via EIP-6963
window.dispatchEvent(
  new CustomEvent('eip6963:announceProvider', {
    detail: Object.freeze({
      info: providerInfo,
      provider: heroProvider,
    }),
  })
);

// Respond to future discovery requests
window.addEventListener('eip6963:requestProvider', () => {
  window.dispatchEvent(
    new CustomEvent('eip6963:announceProvider', {
      detail: Object.freeze({
        info: providerInfo,
        provider: heroProvider,
      }),
    })
  );
});

console.log('[HERO Wallet] Provider injected — window.heroWallet ready');
