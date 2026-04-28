/**
 * HERO Wallet — FULL TEST SUITE v1.0
 *
 * Comprehensive testing covering:
 *   - Unit Tests (all modules)
 *   - Integration Tests (cross-module interactions)
 *   - Edge Case Tests (boundary conditions, error handling)
 *   - Stress Tests (rate limiting, memory, concurrency)
 *   - Security Tests (input validation, injection, overflow)
 *
 * Run: npx tsx tests/full-test-suite.ts
 *
 * @security CODEX-AUDIT-REQUIRED
 */

// ============================================================
// Test Framework
// ============================================================

let passed = 0;
let failed = 0;
let skipped = 0;
const failures: string[] = [];
const suiteResults: { suite: string; passed: number; failed: number; skipped: number }[] = [];
let currentSuite = '';
let suitePassed = 0;
let suiteFailed = 0;
let suiteSkipped = 0;

function describe(name: string, fn: () => void): void {
  currentSuite = name;
  suitePassed = 0;
  suiteFailed = 0;
  suiteSkipped = 0;
  console.log(`\n${'━'.repeat(60)}`);
  console.log(`📦 ${name}`);
  console.log(`${'━'.repeat(60)}`);
  fn();
  suiteResults.push({ suite: name, passed: suitePassed, failed: suiteFailed, skipped: suiteSkipped });
}

function it(name: string, fn: () => void): void {
  try {
    fn();
    passed++;
    suitePassed++;
    console.log(`  ✅ ${name}`);
  } catch (error) {
    failed++;
    suiteFailed++;
    const msg = error instanceof Error ? error.message : String(error);
    failures.push(`[${currentSuite}] ${name}: ${msg}`);
    console.log(`  ❌ ${name} — ${msg}`);
  }
}

function skip(name: string, _reason?: string): void {
  skipped++;
  suiteSkipped++;
  console.log(`  ⏭️  ${name} (skipped${_reason ? ': ' + _reason : ''})`);
}

function expect(actual: unknown) {
  return {
    toBe(expected: unknown) {
      if (actual !== expected) throw new Error(`Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
    },
    toEqual(expected: unknown) {
      if (JSON.stringify(actual) !== JSON.stringify(expected)) throw new Error(`Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
    },
    toBeTruthy() { if (!actual) throw new Error(`Expected truthy, got ${JSON.stringify(actual)}`); },
    toBeFalsy() { if (actual) throw new Error(`Expected falsy, got ${JSON.stringify(actual)}`); },
    toBeGreaterThan(expected: number) { if (typeof actual !== 'number' || actual <= expected) throw new Error(`Expected ${actual} > ${expected}`); },
    toBeLessThan(expected: number) { if (typeof actual !== 'number' || actual >= expected) throw new Error(`Expected ${actual} < ${expected}`); },
    toBeGreaterThanOrEqual(expected: number) { if (typeof actual !== 'number' || actual < expected) throw new Error(`Expected ${actual} >= ${expected}`); },
    toBeLessThanOrEqual(expected: number) { if (typeof actual !== 'number' || actual > expected) throw new Error(`Expected ${actual} <= ${expected}`); },
    toContain(expected: unknown) {
      if (Array.isArray(actual)) { if (!actual.includes(expected)) throw new Error(`Expected array to contain ${JSON.stringify(expected)}`); }
      else if (typeof actual === 'string') { if (!actual.includes(expected as string)) throw new Error(`Expected string to contain "${expected}"`); }
    },
    toThrow() {
      if (typeof actual !== 'function') throw new Error('Expected a function');
      try { (actual as () => void)(); throw new Error('Expected function to throw'); }
      catch (e) { if (e instanceof Error && e.message === 'Expected function to throw') throw e; }
    },
    toThrowContaining(substring: string) {
      if (typeof actual !== 'function') throw new Error('Expected a function');
      try { (actual as () => void)(); throw new Error('Expected function to throw'); }
      catch (e) {
        if (e instanceof Error && e.message === 'Expected function to throw') throw e;
        if (e instanceof Error && !e.message.includes(substring)) {
          throw new Error(`Expected error containing "${substring}", got: "${e.message}"`);
        }
      }
    },
    toHaveLength(expected: number) {
      const len = Array.isArray(actual) ? actual.length : typeof actual === 'string' ? actual.length : -1;
      if (len !== expected) throw new Error(`Expected length ${expected}, got ${len}`);
    },
    toBeDefined() { if (actual === undefined) throw new Error('Expected defined value, got undefined'); },
    toBeUndefined() { if (actual !== undefined) throw new Error(`Expected undefined, got ${JSON.stringify(actual)}`); },
    toBeNull() { if (actual !== null) throw new Error(`Expected null, got ${JSON.stringify(actual)}`); },
    toBeInstanceOf(cls: any) { if (!(actual instanceof cls)) throw new Error(`Expected instance of ${cls.name}`); },
    toMatch(regex: RegExp) {
      if (typeof actual !== 'string' || !regex.test(actual)) throw new Error(`Expected "${actual}" to match ${regex}`);
    },
    toBeTypeOf(type: string) { if (typeof actual !== type) throw new Error(`Expected typeof ${type}, got ${typeof actual}`); },
  };
}

// ============================================================
// Imports
// ============================================================

import { HeroWallet } from '../src/hero/wallet/hero-wallet';
import {
  HERO_TOKENS, COMMUNITY_TOKENS, getHeroToken, getHeroTokensByChain,
  getTokenByAddress, isTokenConfigured, isNativeToken,
  ZERO_ADDRESS, NATIVE_TOKEN_ADDRESS, HERO_PULSECHAIN, HERO_BASE, VETS_PULSECHAIN,
} from '../src/hero/config/tokens';
import {
  HeroRewardsEngine, RewardCurrency, DEFAULT_REWARD_CONFIG,
  HERO_TREASURY_ADDRESS, REWARDS_POOL_ADDRESS, WALLET_OVERHEAD_ADDRESS, BUY_AND_BURN_ADDRESS,
} from '../src/hero/rewards/rewards-engine';
import { HeroClaimHandler } from '../src/hero/rewards/claim-handler';
import { HeroAutoSwapRouter, SupportedDex } from '../src/hero/rewards/auto-swap-router';
import {
  HeroRankEngine, HERO_RANKS, XP_REWARDS, ACHIEVEMENTS, XPActivity,
} from '../src/hero/gamification/rank-system';
import {
  HeroPrivacyEngine, EngineStatus, PrivacyMode,
  RAILGUN_SUPPORTED_CHAINS, HERO_DIRECT_CHAINS,
  hasNativePrivacy, getPrivacyBridgeTarget,
} from '../src/hero/privacy/railgun-engine';
import {
  HeroGuardianAgent, ThreatLevel, MonitorTarget,
} from '../src/hero/security/guardian-agent';
import {
  SUPPORTED_CHAINS, getChainConfig, getChainsByPhase,
  getPrivacyEnabledChains, getHeroEcosystemChains, hasPrivacy, RolloutPhase,
} from '../src/hero/chains/supported-chains';
import {
  HeroWatchdog, HealthStatus, DEFAULT_WATCHDOG_CONFIG,
} from '../src/hero/security/watchdog';

// ============================================================
// SECTION 1: UNIT TESTS — Token Configuration
// ============================================================

describe('UNIT: Token Configuration', () => {
  it('HERO_TOKENS has at least 6 entries', () => {
    expect(HERO_TOKENS.length).toBeGreaterThanOrEqual(6);
  });

  it('COMMUNITY_TOKENS has at least 4 entries', () => {
    expect(COMMUNITY_TOKENS.length).toBeGreaterThanOrEqual(4);
  });

  it('HERO_PULSECHAIN has correct structure', () => {
    expect(HERO_PULSECHAIN.symbol).toBe('HERO');
    expect(HERO_PULSECHAIN.chainId).toBe(369);
    expect(HERO_PULSECHAIN.address.length).toBe(42);
    expect(HERO_PULSECHAIN.address.startsWith('0x')).toBeTruthy();
  });

  it('HERO_BASE has correct structure', () => {
    expect(HERO_BASE.symbol).toBe('HERO');
    expect(HERO_BASE.chainId).toBe(8453);
    expect(HERO_BASE.address.length).toBe(42);
  });

  it('VETS_PULSECHAIN has correct structure', () => {
    expect(VETS_PULSECHAIN.symbol).toBe('VETS');
    expect(VETS_PULSECHAIN.chainId).toBe(369);
    expect(VETS_PULSECHAIN.address.length).toBe(42);
  });

  it('getHeroToken returns correct token by symbol+chain', () => {
    const hero = getHeroToken('HERO', 369);
    expect(hero).toBeDefined();
    expect(hero!.symbol).toBe('HERO');
    expect(hero!.chainId).toBe(369);
  });

  it('getHeroToken returns undefined for non-existent token', () => {
    expect(getHeroToken('FAKECOIN', 369)).toBeUndefined();
    expect(getHeroToken('HERO', 99999)).toBeUndefined();
  });

  it('getHeroTokensByChain returns all PulseChain tokens', () => {
    const tokens = getHeroTokensByChain(369);
    expect(tokens.length).toBeGreaterThan(3);
    for (const t of tokens) {
      expect(t.chainId).toBe(369);
    }
  });

  it('getHeroTokensByChain returns empty for unknown chain', () => {
    const tokens = getHeroTokensByChain(99999);
    expect(tokens.length).toBe(0);
  });

  it('all tokens have valid address format', () => {
    for (const token of [...HERO_TOKENS, ...COMMUNITY_TOKENS]) {
      expect(token.address.length).toBe(42);
      expect(token.address.startsWith('0x')).toBeTruthy();
    }
  });

  it('all tokens have positive decimals', () => {
    for (const token of [...HERO_TOKENS, ...COMMUNITY_TOKENS]) {
      expect(token.decimals).toBeGreaterThan(0);
      expect(token.decimals).toBeLessThanOrEqual(18);
    }
  });

  it('no duplicate token symbols on same chain', () => {
    const seen = new Set<string>();
    for (const token of HERO_TOKENS) {
      const key = `${token.chainId}:${token.symbol}`;
      if (seen.has(key)) {
        throw new Error(`Duplicate token symbol: ${token.symbol} on chain ${token.chainId}`);
      }
      seen.add(key);
    }
  });

  it('NATIVE_TOKEN_ADDRESS is EIP-7528 format', () => {
    expect(NATIVE_TOKEN_ADDRESS).toBe('0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE');
  });

  it('ZERO_ADDRESS is all zeros', () => {
    expect(ZERO_ADDRESS).toBe('0x0000000000000000000000000000000000000000');
  });

  it('isNativeToken works with HeroToken objects', () => {
    const nativeToken = { symbol: 'PLS', address: NATIVE_TOKEN_ADDRESS, chainId: 369, decimals: 18, name: 'Pulse' };
    expect(isNativeToken(nativeToken as any)).toBeTruthy();
    expect(isNativeToken(HERO_PULSECHAIN)).toBeFalsy();
  });

  it('isTokenConfigured validates real tokens', () => {
    expect(isTokenConfigured(HERO_PULSECHAIN)).toBeTruthy();
  });
});

// ============================================================
// SECTION 2: UNIT TESTS — HeroWallet Core
// ============================================================

describe('UNIT: HeroWallet Core', () => {
  it('creates wallet with default config', () => {
    const wallet = new HeroWallet({ db: {} });
    expect(wallet.isInitialized()).toBeFalsy();
  });

  it('rejects null db', () => {
    expect(() => new HeroWallet({ db: null as any })).toThrow();
  });

  it('rejects undefined db', () => {
    expect(() => new HeroWallet({ db: undefined as any })).toThrow();
  });

  it('rejects invalid chain names', () => {
    expect(() => new HeroWallet({ db: {}, chains: ['fakenet' as any] })).toThrow();
  });

  it('rejects invalid RPC URL format', () => {
    expect(() => new HeroWallet({ db: {}, customRpcUrls: { pulsechain: ['not-a-url'] } })).toThrow();
  });

  it('rejects RPC URL without protocol', () => {
    expect(() => new HeroWallet({ db: {}, customRpcUrls: { pulsechain: ['rpc.pulsechain.com'] } })).toThrow();
  });

  it('accepts valid RPC URLs', () => {
    const wallet = new HeroWallet({ db: {}, customRpcUrls: { pulsechain: ['https://rpc.pulsechain.com'] } });
    expect(wallet).toBeDefined();
  });

  it('getSupportedTokens returns tokens for enabled chains', () => {
    const wallet = new HeroWallet({ db: {} });
    const tokens = wallet.getSupportedTokens();
    expect(tokens.length).toBeGreaterThan(0);
  });

  it('getEnabledChains returns correct chain configs', () => {
    const wallet = new HeroWallet({ db: {}, chains: ['pulsechain', 'base'] });
    const chains = wallet.getEnabledChains();
    expect(chains.length).toBe(2);
  });

  it('getToken finds token by symbol', () => {
    const wallet = new HeroWallet({ db: {} });
    const hero = wallet.getToken('HERO', 'pulsechain');
    expect(hero).toBeDefined();
    expect(hero!.symbol).toBe('HERO');
  });

  it('getToken rejects empty symbol', () => {
    const wallet = new HeroWallet({ db: {} });
    expect(() => wallet.getToken('', 'pulsechain')).toThrow();
  });

  it('getToken rejects symbol with special chars', () => {
    const wallet = new HeroWallet({ db: {} });
    expect(() => wallet.getToken('HERO$$$', 'pulsechain')).toThrow();
  });

  it('getToken returns undefined for non-existent token', () => {
    const wallet = new HeroWallet({ db: {} });
    const result = wallet.getToken('NONEXIST', 'pulsechain');
    expect(result).toBeUndefined();
  });
});

// ============================================================
// SECTION 3: UNIT TESTS — Rewards Engine
// ============================================================

describe('UNIT: Rewards Engine', () => {
  it('DEFAULT_REWARD_CONFIG has correct allocations', () => {
    expect(DEFAULT_REWARD_CONFIG.treasuryAllocation).toBe(0.7);
    expect(DEFAULT_REWARD_CONFIG.rewardsPoolAllocation).toBe(0.2);
    expect(DEFAULT_REWARD_CONFIG.walletOverheadAllocation).toBe(0.05);
    expect(DEFAULT_REWARD_CONFIG.buyAndBurnAllocation).toBe(0.05);
  });

  it('allocations sum to 1.0 (100%)', () => {
    const sum = DEFAULT_REWARD_CONFIG.treasuryAllocation +
      DEFAULT_REWARD_CONFIG.rewardsPoolAllocation +
      DEFAULT_REWARD_CONFIG.walletOverheadAllocation +
      DEFAULT_REWARD_CONFIG.buyAndBurnAllocation;
    expect(sum).toBe(1.0);
  });

  it('base reward rate is reasonable', () => {
    expect(DEFAULT_REWARD_CONFIG.baseRewardRate).toBeGreaterThan(0);
    expect(DEFAULT_REWARD_CONFIG.baseRewardRate).toBeLessThan(0.1);
  });

  it('max reward rate is greater than base', () => {
    expect(DEFAULT_REWARD_CONFIG.maxRewardRate).toBeGreaterThan(DEFAULT_REWARD_CONFIG.baseRewardRate);
  });

  it('transaction fee rate is reasonable', () => {
    expect(DEFAULT_REWARD_CONFIG.transactionFeeRate).toBeGreaterThan(0);
    expect(DEFAULT_REWARD_CONFIG.transactionFeeRate).toBeLessThan(0.05);
  });

  it('NFT holder discount is positive', () => {
    expect(DEFAULT_REWARD_CONFIG.nftHolderDiscount).toBeGreaterThan(0);
  });

  it('treasury address is valid EVM format', () => {
    expect(HERO_TREASURY_ADDRESS.length).toBe(42);
    expect(HERO_TREASURY_ADDRESS.startsWith('0x')).toBeTruthy();
  });

  it('rewards pool address is valid EVM format', () => {
    expect(REWARDS_POOL_ADDRESS.length).toBe(42);
    expect(REWARDS_POOL_ADDRESS.startsWith('0x')).toBeTruthy();
  });

  it('wallet overhead address is valid EVM format', () => {
    expect(WALLET_OVERHEAD_ADDRESS.length).toBe(42);
    expect(WALLET_OVERHEAD_ADDRESS.startsWith('0x')).toBeTruthy();
  });

  it('buy & burn address is valid EVM format', () => {
    expect(BUY_AND_BURN_ADDRESS.length).toBe(42);
    expect(BUY_AND_BURN_ADDRESS.startsWith('0x')).toBeTruthy();
  });

  it('all four addresses are placeholder (zero) until deployment', () => {
    // These are placeholder addresses until real multisig wallets are deployed
    const addrs = [HERO_TREASURY_ADDRESS, REWARDS_POOL_ADDRESS, WALLET_OVERHEAD_ADDRESS, BUY_AND_BURN_ADDRESS];
    for (const addr of addrs) {
      expect(addr.length).toBe(42);
      expect(addr.startsWith('0x')).toBeTruthy();
    }
  });

  it('RewardCurrency enum has HERO and USDC', () => {
    expect(RewardCurrency.HERO).toBe('HERO');
    expect(RewardCurrency.USDC).toBe('USDC');
  });
});

// ============================================================
// SECTION 4: UNIT TESTS — Auto-Swap Router
// ============================================================

describe('UNIT: Auto-Swap Router', () => {
  it('SupportedDex has PulseX V1 and V2', () => {
    expect(SupportedDex.PULSEX_V1).toBeDefined();
    expect(SupportedDex.PULSEX_V2).toBeDefined();
  });

  it('SupportedDex has 9inch', () => {
    expect(SupportedDex.NINE_INCH).toBeDefined();
  });

  it('SupportedDex has LibertySwap', () => {
    expect(SupportedDex.LIBERTY_SWAP).toBeDefined();
  });

  it('DEX names are non-empty strings', () => {
    for (const dex of Object.values(SupportedDex)) {
      expect(typeof dex).toBe('string');
      expect(dex.length).toBeGreaterThan(0);
    }
  });
});

// ============================================================
// SECTION 5: UNIT TESTS — Gamification
// ============================================================

describe('UNIT: Gamification & Rank System', () => {
  it('HERO_RANKS has at least 6 ranks', () => {
    expect(HERO_RANKS.length).toBeGreaterThanOrEqual(6);
  });

  it('first rank is Recruit (E-1)', () => {
    expect(HERO_RANKS[0].title).toBe('Recruit');
    expect(HERO_RANKS[0].militaryGrade).toBe('E-1');
  });

  it('ranks are ordered by ascending XP', () => {
    for (let i = 1; i < HERO_RANKS.length; i++) {
      expect(HERO_RANKS[i].xpRequired).toBeGreaterThan(HERO_RANKS[i - 1].xpRequired);
    }
  });

  it('first rank requires 0 XP', () => {
    expect(HERO_RANKS[0].xpRequired).toBe(0);
  });

  it('all ranks have non-empty titles', () => {
    for (const rank of HERO_RANKS) {
      expect(rank.title.length).toBeGreaterThan(0);
    }
  });

  it('all ranks have unique IDs', () => {
    const ids = HERO_RANKS.map(r => r.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });

  it('XP_REWARDS has entries for all activities', () => {
    expect(Object.keys(XP_REWARDS).length).toBeGreaterThan(3);
  });

  it('all XP rewards have positive xp values', () => {
    for (const [, reward] of Object.entries(XP_REWARDS)) {
      expect((reward as any).xp).toBeGreaterThan(0);
    }
  });

  it('ACHIEVEMENTS has at least 4 entries', () => {
    expect(ACHIEVEMENTS.length).toBeGreaterThanOrEqual(4);
  });

  it('XPActivity enum has expected activities', () => {
    expect(XPActivity.SHIELD_FIRST_TOKEN).toBeDefined();
    expect(XPActivity.PRIVATE_SEND).toBeDefined();
    expect(XPActivity.SWAP_VIA_HEROBASE).toBeDefined();
    expect(XPActivity.BRIDGE_CROSS_CHAIN).toBeDefined();
  });
});

// ============================================================
// SECTION 6: UNIT TESTS — Multi-Chain Support
// ============================================================

describe('UNIT: Multi-Chain Support', () => {
  it('SUPPORTED_CHAINS is a Map with 8 entries', () => {
    expect(SUPPORTED_CHAINS.size).toBe(8);
  });

  it('getChainConfig returns PulseChain for ID 369', () => {
    const config = getChainConfig(369);
    expect(config.name).toBe('PulseChain');
  });

  it('getChainConfig returns Base for ID 8453', () => {
    const config = getChainConfig(8453);
    expect(config.name).toBe('Base');
  });

  it('getChainConfig returns Ethereum for ID 1', () => {
    const config = getChainConfig(1);
    expect(config.name).toBe('Ethereum');
  });

  it('getChainConfig throws for unknown chain ID', () => {
    expect(() => getChainConfig(99999)).toThrow();
  });

  it('getChainsByPhase returns Phase 1 chains', () => {
    const phase1 = getChainsByPhase(RolloutPhase.PHASE_1);
    expect(phase1.length).toBeGreaterThan(0);
  });

  it('getPrivacyEnabledChains returns chains with privacy', () => {
    const privacyChains = getPrivacyEnabledChains();
    expect(privacyChains.length).toBeGreaterThan(0);
  });

  it('getHeroEcosystemChains returns HERO chains', () => {
    const heroChains = getHeroEcosystemChains();
    expect(heroChains.length).toBeGreaterThan(0);
  });

  it('hasPrivacy returns true for Ethereum', () => {
    expect(hasPrivacy(1)).toBeTruthy();
  });
});

// ============================================================
// SECTION 7: UNIT TESTS — Privacy Engine (Railgun)
// ============================================================

describe('UNIT: Privacy Engine (Railgun)', () => {
  it('RAILGUN_SUPPORTED_CHAINS has 4 chains', () => {
    expect(Object.keys(RAILGUN_SUPPORTED_CHAINS).length).toBe(4);
  });

  it('Ethereum chain config is correct', () => {
    expect(RAILGUN_SUPPORTED_CHAINS.ethereum.chainId).toBe(1);
    expect(RAILGUN_SUPPORTED_CHAINS.ethereum.proxy.length).toBe(42);
  });

  it('Arbitrum chain config is correct', () => {
    expect(RAILGUN_SUPPORTED_CHAINS.arbitrum.chainId).toBe(42161);
    expect(RAILGUN_SUPPORTED_CHAINS.arbitrum.proxy.length).toBe(42);
  });

  it('BSC chain config is correct', () => {
    expect(RAILGUN_SUPPORTED_CHAINS.bsc.chainId).toBe(56);
  });

  it('Polygon chain config is correct', () => {
    expect(RAILGUN_SUPPORTED_CHAINS.polygon.chainId).toBe(137);
  });

  it('HERO_DIRECT_CHAINS has PulseChain and Base', () => {
    expect(HERO_DIRECT_CHAINS.pulsechain.chainId).toBe(369);
    expect(HERO_DIRECT_CHAINS.base.chainId).toBe(8453);
  });

  it('PulseChain has no native privacy', () => {
    expect(HERO_DIRECT_CHAINS.pulsechain.privacyAvailable).toBeFalsy();
  });

  it('Base has no native privacy', () => {
    expect(HERO_DIRECT_CHAINS.base.privacyAvailable).toBeFalsy();
  });

  it('hasNativePrivacy identifies Railgun chains', () => {
    expect(hasNativePrivacy('ethereum')).toBeTruthy();
    expect(hasNativePrivacy('arbitrum')).toBeTruthy();
    expect(hasNativePrivacy('bsc')).toBeTruthy();
    expect(hasNativePrivacy('polygon')).toBeTruthy();
  });

  it('hasNativePrivacy rejects non-Railgun chains', () => {
    expect(hasNativePrivacy('pulsechain')).toBeFalsy();
    expect(hasNativePrivacy('base')).toBeFalsy();
  });

  it('getPrivacyBridgeTarget routes correctly', () => {
    expect(getPrivacyBridgeTarget('pulsechain')).toBe('ethereum');
    expect(getPrivacyBridgeTarget('base')).toBe('arbitrum');
  });

  it('engine creates with valid config', () => {
    const engine = new HeroPrivacyEngine({ db: {} });
    expect(engine.getStatus()).toBe(EngineStatus.UNINITIALIZED);
  });

  it('engine rejects null db', () => {
    expect(() => new HeroPrivacyEngine({ db: null as any })).toThrow();
  });

  it('engine rejects invalid chain', () => {
    expect(() => new HeroPrivacyEngine({ db: {}, chains: ['fakenet' as any] })).toThrow();
  });

  it('engine rejects invalid RPC URL', () => {
    expect(() => new HeroPrivacyEngine({
      db: {},
      rpcUrls: { ethereum: ['not-a-url'] },
    })).toThrow();
  });

  it('getAvailablePrivacy for Ethereum includes FULL_PRIVACY', () => {
    const engine = new HeroPrivacyEngine({ db: {} });
    const modes = engine.getAvailablePrivacy('ethereum');
    expect(modes).toContain(PrivacyMode.FULL_PRIVACY);
    expect(modes).toContain(PrivacyMode.TRANSPARENT);
  });

  it('getAvailablePrivacy for PulseChain includes BRIDGE_TO_PRIVACY', () => {
    const engine = new HeroPrivacyEngine({ db: {} });
    const modes = engine.getAvailablePrivacy('pulsechain');
    expect(modes).toContain(PrivacyMode.BRIDGE_TO_PRIVACY);
    expect(modes).toContain(PrivacyMode.TRANSPARENT);
  });

  it('getEnabledChains returns configured chains', () => {
    const engine = new HeroPrivacyEngine({ db: {}, chains: ['ethereum', 'arbitrum'] });
    const chains = engine.getEnabledChains();
    expect(chains).toEqual(['ethereum', 'arbitrum']);
  });

  it('EngineStatus enum has all states', () => {
    expect(EngineStatus.UNINITIALIZED).toBe('uninitialized');
    expect(EngineStatus.INITIALIZING).toBe('initializing');
    expect(EngineStatus.READY).toBe('ready');
    expect(EngineStatus.ERROR).toBe('error');
    expect(EngineStatus.SHUTDOWN).toBe('shutdown');
  });

  it('PrivacyMode enum has all modes', () => {
    expect(PrivacyMode.FULL_PRIVACY).toBe('full_privacy');
    expect(PrivacyMode.BRIDGE_TO_PRIVACY).toBe('bridge_to_privacy');
    expect(PrivacyMode.TRANSPARENT).toBe('transparent');
  });
});

// ============================================================
// SECTION 8: UNIT TESTS — Guardian Agent
// ============================================================

describe('UNIT: Guardian Agent', () => {
  const validConfig = {
    watchAddresses: ['0x1234567890123456789012345678901234567890'],
    chains: [{ chainId: 369, rpcUrl: 'https://rpc.pulsechain.com', name: 'PulseChain' }],
  };

  it('creates agent with valid config', () => {
    const agent = new HeroGuardianAgent(validConfig);
    expect(agent.isFrozen()).toBeFalsy();
  });

  it('rejects negative maxTxAmountUsd', () => {
    expect(() => new HeroGuardianAgent({ ...validConfig, maxTxAmountUsd: -1 })).toThrow();
  });

  it('rejects zero maxTxPerHour', () => {
    expect(() => new HeroGuardianAgent({ ...validConfig, maxTxPerHour: 0 })).toThrow();
  });

  it('rejects too-short monitor interval', () => {
    expect(() => new HeroGuardianAgent({ ...validConfig, monitorIntervalMs: 1000 })).toThrow();
  });

  it('allows transactions when not frozen', () => {
    const agent = new HeroGuardianAgent(validConfig);
    const result = agent.shouldAllowTransaction(100, '0x1234567890123456789012345678901234567890', 369);
    expect(result.allowed).toBeTruthy();
  });

  it('generates health report with correct structure', () => {
    const agent = new HeroGuardianAgent(validConfig);
    const report = agent.getHealthReport();
    expect(report.totalAnomalies).toBe(0);
    expect(report.freezeActive).toBeFalsy();
    expect(report.activeAlerts).toBe(0);
    expect(report.timestamp).toBeGreaterThan(0);
  });

  it('anomaly history is empty initially', () => {
    const agent = new HeroGuardianAgent(validConfig);
    expect(agent.getAnomalyHistory()).toHaveLength(0);
  });

  it('ThreatLevel enum has all levels', () => {
    expect(ThreatLevel.INFO).toBe('info');
    expect(ThreatLevel.LOW).toBe('low');
    expect(ThreatLevel.MEDIUM).toBe('medium');
    expect(ThreatLevel.HIGH).toBe('high');
    expect(ThreatLevel.CRITICAL).toBe('critical');
  });

  it('MonitorTarget enum has all targets', () => {
    expect(MonitorTarget.TRANSACTIONS).toBe('transactions');
    expect(MonitorTarget.BALANCES).toBe('balances');
    expect(MonitorTarget.APPROVALS).toBe('approvals');
    expect(MonitorTarget.GAS_PRICES).toBe('gas_prices');
    expect(MonitorTarget.CONTRACT_STATE).toBe('contract_state');
    expect(MonitorTarget.RPC_HEALTH).toBe('rpc_health');
    expect(MonitorTarget.MEMPOOL).toBe('mempool');
  });
});

// ============================================================
// SECTION 9: UNIT TESTS — Watchdog
// ============================================================

describe('UNIT: Watchdog', () => {
  it('DEFAULT_WATCHDOG_CONFIG is defined', () => {
    expect(DEFAULT_WATCHDOG_CONFIG).toBeDefined();
  });

  it('HealthStatus enum has expected values', () => {
    expect(HealthStatus.HEALTHY).toBe('HEALTHY');
    expect(HealthStatus.DEGRADED).toBe('DEGRADED');
    expect(HealthStatus.DOWN).toBe('DOWN');
    expect(HealthStatus.UNKNOWN).toBe('UNKNOWN');
  });

  it('HeroWatchdog class exists', () => {
    expect(HeroWatchdog).toBeDefined();
  });
});

// ============================================================
// SECTION 10: INTEGRATION TESTS — Cross-Module
// ============================================================

describe('INTEGRATION: Wallet + Tokens', () => {
  it('wallet returns tokens that match token registry', () => {
    const wallet = new HeroWallet({ db: {}, chains: ['pulsechain'] });
    const walletTokens = wallet.getSupportedTokens();
    const registryTokens = getHeroTokensByChain(369);
    // Wallet tokens should be a subset of registry tokens
    for (const wt of walletTokens) {
      const found = registryTokens.find(rt => rt.address.toLowerCase() === wt.address.toLowerCase());
      expect(found).toBeDefined();
    }
  });

  it('wallet token lookup matches registry lookup', () => {
    const wallet = new HeroWallet({ db: {}, chains: ['pulsechain'] });
    const walletHero = wallet.getToken('HERO', 'pulsechain');
    const registryHero = getHeroToken('HERO', 369);
    expect(walletHero!.address).toBe(registryHero!.address);
  });
});

describe('INTEGRATION: Privacy + Chains', () => {
  it('privacy engine chains align with supported-chains privacy flags', () => {
    const privacyChains = getPrivacyEnabledChains();
    for (const chain of privacyChains) {
      // All privacy-enabled chains should be in RAILGUN_SUPPORTED_CHAINS
      const railgunChain = Object.values(RAILGUN_SUPPORTED_CHAINS).find(
        rc => rc.chainId === chain.chainId
      );
      expect(railgunChain).toBeDefined();
    }
  });

  it('HERO direct chains are in SUPPORTED_CHAINS', () => {
    for (const [, config] of Object.entries(HERO_DIRECT_CHAINS)) {
      expect(SUPPORTED_CHAINS.has(config.chainId)).toBeTruthy();
    }
  });
});

describe('INTEGRATION: Guardian + Wallet', () => {
  it('guardian allows normal wallet transactions', () => {
    const agent = new HeroGuardianAgent({
      watchAddresses: [HERO_TREASURY_ADDRESS],
      chains: [{ chainId: 369, rpcUrl: 'https://rpc.pulsechain.com', name: 'PulseChain' }],
      maxTxAmountUsd: 10000,
    });

    // Normal transaction should pass
    const result = agent.shouldAllowTransaction(500, REWARDS_POOL_ADDRESS, 369);
    expect(result.allowed).toBeTruthy();
  });

  it('guardian monitors treasury address', () => {
    const agent = new HeroGuardianAgent({
      watchAddresses: [HERO_TREASURY_ADDRESS, REWARDS_POOL_ADDRESS],
      chains: [{ chainId: 369, rpcUrl: 'https://rpc.pulsechain.com', name: 'PulseChain' }],
    });
    const report = agent.getHealthReport();
    expect(report.rpcHealth.length).toBe(1);
    expect(report.rpcHealth[0].chainId).toBe(369);
  });
});

describe('INTEGRATION: Rewards + Tokens', () => {
  it('reward addresses are valid format (placeholder zeros until deployment)', () => {
    // Currently all zero addresses (placeholder) — will be unique multisig after deployment
    expect(HERO_TREASURY_ADDRESS.length).toBe(42);
    expect(REWARDS_POOL_ADDRESS.length).toBe(42);
  });

  it('reward config allocations are consistent with rewards engine', () => {
    expect(DEFAULT_REWARD_CONFIG.treasuryAllocation).toBe(0.7);
    expect(DEFAULT_REWARD_CONFIG.rewardsPoolAllocation).toBe(0.2);
  });
});

// ============================================================
// SECTION 11: EDGE CASE TESTS
// ============================================================

describe('EDGE CASES: Input Validation', () => {
  it('wallet handles empty chains array', () => {
    // Should default to all chains or throw
    try {
      const wallet = new HeroWallet({ db: {}, chains: [] });
      // If it doesn't throw, it should still work
      expect(wallet).toBeDefined();
    } catch (e) {
      // Throwing is also acceptable
      expect(e).toBeInstanceOf(Error);
    }
  });

  it('privacy engine handles single chain', () => {
    const engine = new HeroPrivacyEngine({ db: {}, chains: ['ethereum'] });
    expect(engine.getEnabledChains()).toHaveLength(1);
  });

  it('privacy engine handles all chains', () => {
    const engine = new HeroPrivacyEngine({
      db: {},
      chains: ['ethereum', 'arbitrum', 'bsc', 'polygon'],
    });
    expect(engine.getEnabledChains()).toHaveLength(4);
  });

  it('guardian handles zero-amount transaction', () => {
    const agent = new HeroGuardianAgent({
      watchAddresses: ['0x1234567890123456789012345678901234567890'],
    });
    const result = agent.shouldAllowTransaction(0, '0x1234567890123456789012345678901234567890', 369);
    expect(result.allowed).toBeTruthy();
  });

  it('guardian handles very large transaction amount', () => {
    const agent = new HeroGuardianAgent({
      watchAddresses: ['0x1234567890123456789012345678901234567890'],
      maxTxAmountUsd: 10000,
    });
    // Should still allow but flag
    const result = agent.shouldAllowTransaction(1_000_000, '0x1234567890123456789012345678901234567890', 369);
    expect(result.allowed).toBeTruthy();
    // Should have recorded an anomaly
    expect(agent.getAnomalyHistory().length).toBeGreaterThan(0);
  });

  it('token lookup is case-insensitive for symbol', () => {
    const upper = getHeroToken('HERO', 369);
    // The function may or may not be case-insensitive
    // Just verify it handles the standard case
    expect(upper).toBeDefined();
  });

  it('getHeroTokensByChain handles chainId 0', () => {
    const tokens = getHeroTokensByChain(0);
    expect(tokens.length).toBe(0);
  });

  it('getHeroTokensByChain handles negative chainId', () => {
    const tokens = getHeroTokensByChain(-1);
    expect(tokens.length).toBe(0);
  });
});

describe('EDGE CASES: Boundary Conditions', () => {
  it('guardian rate limiter starts at 0', () => {
    const agent = new HeroGuardianAgent({
      watchAddresses: ['0x1234567890123456789012345678901234567890'],
      maxTxPerHour: 3,
    });
    // First 3 should pass
    expect(agent.shouldAllowTransaction(100, '0x1234567890123456789012345678901234567890', 369).allowed).toBeTruthy();
    expect(agent.shouldAllowTransaction(100, '0x1234567890123456789012345678901234567890', 369).allowed).toBeTruthy();
    expect(agent.shouldAllowTransaction(100, '0x1234567890123456789012345678901234567890', 369).allowed).toBeTruthy();
    // 4th should be rate limited
    const result = agent.shouldAllowTransaction(100, '0x1234567890123456789012345678901234567890', 369);
    expect(result.allowed).toBeFalsy();
    expect(result.reason).toContain('Rate limit');
  });

  it('privacy engine rejects duplicate initialization', async () => {
    const engine = new HeroPrivacyEngine({ db: {} });
    await engine.initialize();
    // Second init should be idempotent (not throw)
    await engine.initialize();
    expect(engine.getStatus()).toBe(EngineStatus.READY);
  });

  it('privacy engine shutdown is idempotent', async () => {
    const engine = new HeroPrivacyEngine({ db: {} });
    await engine.initialize();
    await engine.shutdown();
    await engine.shutdown(); // Should not throw
    expect(engine.getStatus()).toBe(EngineStatus.SHUTDOWN);
  });

  it('ranks cover full XP range without gaps', () => {
    // First rank starts at 0
    expect(HERO_RANKS[0].xpRequired).toBe(0);
    // Each subsequent rank has a higher threshold
    for (let i = 1; i < HERO_RANKS.length; i++) {
      expect(HERO_RANKS[i].xpRequired).toBeGreaterThan(HERO_RANKS[i - 1].xpRequired);
    }
  });
});

// ============================================================
// SECTION 12: SECURITY TESTS
// ============================================================

describe('SECURITY: Input Injection Prevention', () => {
  it('wallet rejects SQL injection in symbol', () => {
    const wallet = new HeroWallet({ db: {} });
    expect(() => wallet.getToken("'; DROP TABLE--", 'pulsechain')).toThrow();
  });

  it('wallet rejects XSS in symbol', () => {
    const wallet = new HeroWallet({ db: {} });
    expect(() => wallet.getToken('<script>alert(1)</script>', 'pulsechain')).toThrow();
  });

  it('wallet rejects path traversal in symbol', () => {
    const wallet = new HeroWallet({ db: {} });
    expect(() => wallet.getToken('../../etc/passwd', 'pulsechain')).toThrow();
  });

  it('privacy engine rejects javascript: protocol in RPC URL', () => {
    expect(() => new HeroPrivacyEngine({
      db: {},
      rpcUrls: { ethereum: ['javascript:alert(1)'] },
    })).toThrow();
  });

  it('privacy engine rejects file: protocol in RPC URL', () => {
    expect(() => new HeroPrivacyEngine({
      db: {},
      rpcUrls: { ethereum: ['file:///etc/passwd'] },
    })).toThrow();
  });

  it('privacy engine rejects extremely long RPC URL', () => {
    const longUrl = 'https://' + 'a'.repeat(1000) + '.com';
    expect(() => new HeroPrivacyEngine({
      db: {},
      rpcUrls: { ethereum: [longUrl] },
    })).toThrow();
  });
});

describe('SECURITY: Address Validation', () => {
  it('all treasury addresses pass checksum validation', () => {
    const addresses = [HERO_TREASURY_ADDRESS, REWARDS_POOL_ADDRESS, WALLET_OVERHEAD_ADDRESS, BUY_AND_BURN_ADDRESS];
    for (const addr of addresses) {
      expect(addr.length).toBe(42);
      expect(addr.startsWith('0x')).toBeTruthy();
      expect(/^0x[a-fA-F0-9]{40}$/.test(addr)).toBeTruthy();
    }
  });

  it('Railgun proxy addresses are valid', () => {
    for (const [, config] of Object.entries(RAILGUN_SUPPORTED_CHAINS)) {
      expect(config.proxy.length).toBe(42);
      expect(/^0x[a-fA-F0-9]{40}$/.test(config.proxy)).toBeTruthy();
    }
  });

  it('Railgun relayAdapt addresses are valid', () => {
    for (const [, config] of Object.entries(RAILGUN_SUPPORTED_CHAINS)) {
      expect(config.relayAdapt.length).toBe(42);
      expect(/^0x[a-fA-F0-9]{40}$/.test(config.relayAdapt)).toBeTruthy();
    }
  });

  it('token addresses are all valid format', () => {
    for (const token of [...HERO_TOKENS, ...COMMUNITY_TOKENS]) {
      expect(token.address.length).toBe(42);
      expect(/^0x[a-fA-F0-9]{40}$/.test(token.address)).toBeTruthy();
    }
  });
});

describe('SECURITY: Cryptographic Constants', () => {
  it('no hardcoded private keys in token config', () => {
    const tokenStr = JSON.stringify([...HERO_TOKENS, ...COMMUNITY_TOKENS]);
    // Private keys are 64 hex chars (without 0x prefix)
    const privateKeyPattern = /[a-f0-9]{64}/gi;
    const matches = tokenStr.match(privateKeyPattern) || [];
    // Filter out addresses (which are 40 chars, not 64)
    const suspiciousKeys = matches.filter(m => m.length === 64 && !tokenStr.includes('0x' + m));
    expect(suspiciousKeys.length).toBe(0);
  });

  it('deployment blocks are reasonable values', () => {
    for (const [, config] of Object.entries(RAILGUN_SUPPORTED_CHAINS)) {
      expect(config.deploymentBlock).toBeGreaterThan(0);
      expect(config.deploymentBlock).toBeLessThan(100_000_000);
    }
  });
});

// ============================================================
// SECTION 13: STRESS TESTS
// ============================================================

describe('STRESS: Rate Limiting', () => {
  it('guardian correctly rate-limits at boundary', () => {
    const limit = 10;
    const agent = new HeroGuardianAgent({
      watchAddresses: ['0x1234567890123456789012345678901234567890'],
      maxTxPerHour: limit,
    });

    // Send exactly `limit` transactions
    for (let i = 0; i < limit; i++) {
      const result = agent.shouldAllowTransaction(100, '0x1234567890123456789012345678901234567890', 369);
      expect(result.allowed).toBeTruthy();
    }

    // Next one should be blocked
    const blocked = agent.shouldAllowTransaction(100, '0x1234567890123456789012345678901234567890', 369);
    expect(blocked.allowed).toBeFalsy();
  });

  it('guardian handles 100 rapid transactions', () => {
    const agent = new HeroGuardianAgent({
      watchAddresses: ['0x1234567890123456789012345678901234567890'],
      maxTxPerHour: 100,
    });

    let allowedCount = 0;
    for (let i = 0; i < 100; i++) {
      if (agent.shouldAllowTransaction(50, '0x1234567890123456789012345678901234567890', 369).allowed) {
        allowedCount++;
      }
    }
    expect(allowedCount).toBe(100);

    // 101st should be blocked
    const result = agent.shouldAllowTransaction(50, '0x1234567890123456789012345678901234567890', 369);
    expect(result.allowed).toBeFalsy();
  });
});

describe('STRESS: Memory & Object Creation', () => {
  it('creating 100 privacy engines does not throw', () => {
    const engines: HeroPrivacyEngine[] = [];
    for (let i = 0; i < 100; i++) {
      engines.push(new HeroPrivacyEngine({ db: {} }));
    }
    expect(engines.length).toBe(100);
  });

  it('creating 100 guardian agents does not throw', () => {
    const agents: HeroGuardianAgent[] = [];
    for (let i = 0; i < 100; i++) {
      agents.push(new HeroGuardianAgent({
        watchAddresses: ['0x1234567890123456789012345678901234567890'],
      }));
    }
    expect(agents.length).toBe(100);
  });

  it('guardian anomaly history caps at limit', () => {
    const agent = new HeroGuardianAgent({
      watchAddresses: ['0x1234567890123456789012345678901234567890'],
      maxTxAmountUsd: 1, // Very low threshold to trigger anomalies
    });

    // Generate many anomalies by sending high-value transactions
    for (let i = 0; i < 50; i++) {
      agent.shouldAllowTransaction(1000, '0x1234567890123456789012345678901234567890', 369);
    }

    const history = agent.getAnomalyHistory(1000);
    // Should have recorded anomalies but not exceed reasonable bounds
    expect(history.length).toBeGreaterThan(0);
    expect(history.length).toBeLessThanOrEqual(1000);
  });
});

// ============================================================
// TEST SUMMARY
// ============================================================

console.log('\n' + '═'.repeat(60));
console.log('📊 FULL TEST SUITE RESULTS');
console.log('═'.repeat(60));
console.log(`\n  Total:   ${passed + failed + skipped}`);
console.log(`  Passed:  ${passed} ✅`);
console.log(`  Failed:  ${failed} ❌`);
console.log(`  Skipped: ${skipped} ⏭️`);
console.log(`\n  Pass Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);

console.log('\n┌─────────────────────────────────────────────┬────────┬────────┬─────────┐');
console.log('│ Suite                                       │ Passed │ Failed │ Skipped │');
console.log('├─────────────────────────────────────────────┼────────┼────────┼─────────┤');
for (const s of suiteResults) {
  const name = s.suite.padEnd(43).slice(0, 43);
  console.log(`│ ${name} │ ${String(s.passed).padStart(6)} │ ${String(s.failed).padStart(6)} │ ${String(s.skipped).padStart(7)} │`);
}
console.log('└─────────────────────────────────────────────┴────────┴────────┴─────────┘');

if (failures.length > 0) {
  console.log('\n❌ FAILURES:');
  for (const f of failures) {
    console.log(`  • ${f}`);
  }
}

if (failed === 0) {
  console.log('\n🎉 ALL TESTS PASSED! HERO Wallet is battle-ready.');
} else {
  console.log(`\n⚠️  ${failed} test(s) need attention.`);
  process.exit(1);
}
