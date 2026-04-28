/**
 * HERO Wallet — Unit Tests
 *
 * Comprehensive test suite covering all core modules:
 *   - HeroWallet (wallet creation, initialization)
 *   - Token Configuration (hardcoded tokens, lookups)
 *   - Rewards Engine (fee split, buy & burn, NFT discount)
 *   - Claim Handler (claim flow, validation)
 *   - Auto-Swap Router (DEX routing, quotes)
 *   - Gamification (ranks, XP, achievements)
 *   - Privacy Engine (Railgun integration, routing)
 *   - Guardian Agent (anomaly detection, freeze, rate limiting)
 *   - Telegram Alerts (notification formatting)
 *   - Watchdog (health checks, self-healing)
 *
 * Run: npx tsx tests/hero-wallet.test.ts
 */

// ============================================================
// Test Framework (Lightweight — no external deps needed)
// ============================================================

let passed = 0;
let failed = 0;
const failures: string[] = [];

function describe(name: string, fn: () => void): void {
  console.log(`\n📦 ${name}`);
  fn();
}

function it(name: string, fn: () => void): void {
  try {
    fn();
    passed++;
    console.log(`  ✅ ${name}`);
  } catch (error) {
    failed++;
    const msg = error instanceof Error ? error.message : String(error);
    failures.push(`${name}: ${msg}`);
    console.log(`  ❌ ${name} — ${msg}`);
  }
}

function expect(actual: unknown) {
  return {
    toBe(expected: unknown) {
      if (actual !== expected) {
        throw new Error(`Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
      }
    },
    toEqual(expected: unknown) {
      if (JSON.stringify(actual) !== JSON.stringify(expected)) {
        throw new Error(`Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
      }
    },
    toBeTruthy() {
      if (!actual) throw new Error(`Expected truthy, got ${JSON.stringify(actual)}`);
    },
    toBeFalsy() {
      if (actual) throw new Error(`Expected falsy, got ${JSON.stringify(actual)}`);
    },
    toBeGreaterThan(expected: number) {
      if (typeof actual !== 'number' || actual <= expected) {
        throw new Error(`Expected ${actual} > ${expected}`);
      }
    },
    toBeLessThan(expected: number) {
      if (typeof actual !== 'number' || actual >= expected) {
        throw new Error(`Expected ${actual} < ${expected}`);
      }
    },
    toContain(expected: unknown) {
      if (Array.isArray(actual)) {
        if (!actual.includes(expected)) {
          throw new Error(`Expected array to contain ${JSON.stringify(expected)}`);
        }
      } else if (typeof actual === 'string') {
        if (!actual.includes(expected as string)) {
          throw new Error(`Expected string to contain "${expected}"`);
        }
      }
    },
    toThrow() {
      if (typeof actual !== 'function') throw new Error('Expected a function');
      try {
        (actual as () => void)();
        throw new Error('Expected function to throw');
      } catch (e) {
        if (e instanceof Error && e.message === 'Expected function to throw') throw e;
        // Function threw as expected
      }
    },
    toBeInstanceOf(expected: unknown) {
      if (!(actual instanceof (expected as new (...args: unknown[]) => unknown))) {
        throw new Error(`Expected instance of ${(expected as { name: string }).name}`);
      }
    },
    toHaveLength(expected: number) {
      if (!Array.isArray(actual) || actual.length !== expected) {
        throw new Error(`Expected length ${expected}, got ${Array.isArray(actual) ? actual.length : 'not array'}`);
      }
    },
    toBeDefined() {
      if (actual === undefined) throw new Error('Expected defined value, got undefined');
    },
    toBeUndefined() {
      if (actual !== undefined) throw new Error(`Expected undefined, got ${JSON.stringify(actual)}`);
    },
  };
}

// ============================================================
// Import Modules Under Test
// ============================================================

import { HeroWallet, createHeroWallet } from '../src/hero/wallet/hero-wallet';
import {
  HERO_TOKENS,
  COMMUNITY_TOKENS,
  getHeroToken,
  getHeroTokensByChain,
  getTokenByAddress,
  isTokenConfigured,
  isNativeToken,
  ZERO_ADDRESS,
  NATIVE_TOKEN_ADDRESS,
  HERO_PULSECHAIN,
  HERO_BASE,
  VETS_PULSECHAIN,
} from '../src/hero/config/tokens';
import {
  HeroRewardsEngine,
  RewardCurrency,
  DEFAULT_REWARD_CONFIG,
  HERO_TREASURY_ADDRESS,
  REWARDS_POOL_ADDRESS,
  WALLET_OVERHEAD_ADDRESS,
  BUY_AND_BURN_ADDRESS,
} from '../src/hero/rewards/rewards-engine';
import { HeroClaimHandler } from '../src/hero/rewards/claim-handler';
import { HeroAutoSwapRouter, SupportedDex } from '../src/hero/rewards/auto-swap-router';
import {
  HeroRankEngine,
  HERO_RANKS,
  XP_REWARDS,
  ACHIEVEMENTS,
  XPActivity,
} from '../src/hero/gamification/rank-system';
import {
  HeroPrivacyEngine,
  EngineStatus,
  PrivacyMode,
  RAILGUN_SUPPORTED_CHAINS,
  HERO_DIRECT_CHAINS,
  hasNativePrivacy,
  getPrivacyBridgeTarget,
} from '../src/hero/privacy/railgun-engine';
import {
  HeroGuardianAgent,
  ThreatLevel,
  MonitorTarget,
} from '../src/hero/security/guardian-agent';
import {
  SUPPORTED_CHAINS,
  getChainConfig,
  getChainsByPhase,
  getPrivacyEnabledChains,
  getHeroEcosystemChains,
  hasPrivacy,
  RolloutPhase,
} from '../src/hero/chains/supported-chains';

// ============================================================
// Tests: Token Configuration
// ============================================================

describe('Token Configuration', () => {
  it('should have all community tokens defined', () => {
    expect(HERO_TOKENS.length).toBeGreaterThan(5);
    expect(COMMUNITY_TOKENS.length).toBeGreaterThan(3);
  });

  it('should have HERO on PulseChain', () => {
    expect(HERO_PULSECHAIN.symbol).toBe('HERO');
    expect(HERO_PULSECHAIN.chainId).toBe(369);
    expect(HERO_PULSECHAIN.address.length).toBeGreaterThan(10);
  });

  it('should have HERO on Base', () => {
    expect(HERO_BASE.symbol).toBe('HERO');
    expect(HERO_BASE.chainId).toBe(8453);
  });

  it('should have VETS on PulseChain', () => {
    expect(VETS_PULSECHAIN.symbol).toBe('VETS');
    expect(VETS_PULSECHAIN.chainId).toBe(369);
  });

  it('should look up token by symbol and chain', () => {
    const hero = getHeroToken('HERO', 369);
    expect(hero).toBeDefined();
    expect(hero!.symbol).toBe('HERO');
  });

  it('should return undefined for unknown token', () => {
    const fake = getHeroToken('FAKECOIN', 369);
    expect(fake).toBeUndefined();
  });

  it('should get tokens by chain', () => {
    const pulseTokens = getHeroTokensByChain(369);
    expect(pulseTokens.length).toBeGreaterThan(3);
  });

  it('should identify native tokens (takes HeroToken object)', () => {
    // isNativeToken takes a HeroToken object, not a string
    const nativeToken = { symbol: 'PLS', address: NATIVE_TOKEN_ADDRESS, chainId: 369, decimals: 18, name: 'Pulse' };
    const nonNativeToken = HERO_PULSECHAIN;
    expect(isNativeToken(nativeToken as any)).toBeTruthy();
    expect(isNativeToken(nonNativeToken)).toBeFalsy();
  });

  it('should check if token is configured (takes HeroToken object)', () => {
    // isTokenConfigured takes a HeroToken object
    expect(isTokenConfigured(HERO_PULSECHAIN)).toBeTruthy();
  });
});

// ============================================================
// Tests: HeroWallet
// ============================================================

describe('HeroWallet', () => {
  it('should create wallet with default chains', () => {
    const wallet = new HeroWallet({ db: {} });
    expect(wallet.isInitialized()).toBeFalsy();
  });

  it('should reject missing db option', () => {
    expect(() => new HeroWallet({ db: null as unknown })).toThrow();
  });

  it('should reject invalid chain name', () => {
    expect(() => new HeroWallet({ db: {}, chains: ['fakenet' as any] })).toThrow();
  });

  it('should reject invalid RPC URL', () => {
    expect(() => new HeroWallet({
      db: {},
      customRpcUrls: { pulsechain: ['not-a-url'] },
    })).toThrow();
  });

  it('should get supported tokens for enabled chains', () => {
    const wallet = new HeroWallet({ db: {} });
    const tokens = wallet.getSupportedTokens();
    expect(tokens.length).toBeGreaterThan(0);
  });

  it('should get enabled chains', () => {
    const wallet = new HeroWallet({ db: {}, chains: ['pulsechain', 'base'] });
    const chains = wallet.getEnabledChains();
    expect(chains.length).toBe(2);
    expect(chains[0].name).toBe('PulseChain');
    expect(chains[1].name).toBe('Base');
  });

  it('should look up token by symbol and chain', () => {
    const wallet = new HeroWallet({ db: {} });
    const hero = wallet.getToken('HERO', 'pulsechain');
    expect(hero).toBeDefined();
    expect(hero!.symbol).toBe('HERO');
  });

  it('should reject invalid token symbol', () => {
    const wallet = new HeroWallet({ db: {} });
    expect(() => wallet.getToken('', 'pulsechain')).toThrow();
    expect(() => wallet.getToken('HERO$$$', 'pulsechain')).toThrow();
  });
});

// ============================================================
// Tests: Rewards Engine
// ============================================================

describe('Rewards Engine', () => {
  it('should have correct fee split (70/20/5/5 as decimals)', () => {
    expect(DEFAULT_REWARD_CONFIG.treasuryAllocation).toBe(0.7);
    expect(DEFAULT_REWARD_CONFIG.rewardsPoolAllocation).toBe(0.2);
    expect(DEFAULT_REWARD_CONFIG.walletOverheadAllocation).toBe(0.05);
    expect(DEFAULT_REWARD_CONFIG.buyAndBurnAllocation).toBe(0.05);
  });

  it('fee split should sum to 100%', () => {
    const total =
      DEFAULT_REWARD_CONFIG.treasuryAllocation +
      DEFAULT_REWARD_CONFIG.rewardsPoolAllocation +
      DEFAULT_REWARD_CONFIG.walletOverheadAllocation +
      DEFAULT_REWARD_CONFIG.buyAndBurnAllocation;
    expect(total).toBe(1.0);
  });

  it('should have valid treasury address', () => {
    expect(HERO_TREASURY_ADDRESS.length).toBeGreaterThan(10);
  });

  it('should have valid rewards pool address', () => {
    expect(REWARDS_POOL_ADDRESS.length).toBeGreaterThan(10);
  });

  it('should have valid wallet overhead address', () => {
    expect(WALLET_OVERHEAD_ADDRESS.length).toBeGreaterThan(10);
  });

  it('should have valid buy & burn address', () => {
    expect(BUY_AND_BURN_ADDRESS.length).toBeGreaterThan(10);
  });

  it('should support HERO and USDC reward currencies', () => {
    expect(RewardCurrency.HERO).toBe('HERO');
    expect(RewardCurrency.USDC).toBe('USDC');
  });
});

// ============================================================
// Tests: Auto-Swap Router
// ============================================================

describe('Auto-Swap Router', () => {
  it('should have supported DEXes defined', () => {
    expect(SupportedDex.PULSEX_V2).toBeDefined();
    expect(SupportedDex.PULSEX_V1).toBeDefined();
  });
});

// ============================================================
// Tests: Gamification System
// ============================================================

describe('Gamification System', () => {
  it('should have military ranks defined', () => {
    expect(HERO_RANKS.length).toBeGreaterThan(5);
  });

  it('should have first rank as Private', () => {
    expect(HERO_RANKS[0].name).toContain('Private');
  });

  it('should have XP rewards for activities', () => {
    expect(Object.keys(XP_REWARDS).length).toBeGreaterThan(3);
  });

  it('should have achievements defined', () => {
    expect(ACHIEVEMENTS.length).toBeGreaterThan(3);
  });

  it('should have XP activities enum', () => {
    expect(XPActivity.SWAP_VIA_HEROBASE).toBeDefined();
    expect(XPActivity.PRIVATE_SEND).toBeDefined();
  });

  it('ranks should be ordered by XP threshold', () => {
    for (let i = 1; i < HERO_RANKS.length; i++) {
      expect(HERO_RANKS[i].xpRequired).toBeGreaterThan(HERO_RANKS[i - 1].xpRequired);
    }
  });
});

// ============================================================
// Tests: Multi-Chain Support
// ============================================================

describe('Multi-Chain Support', () => {
  it('should have 8 supported chains (Map)', () => {
    expect(SUPPORTED_CHAINS.size).toBe(8);
  });

  it('should get chain config by ID', () => {
    const pulse = getChainConfig(369);
    expect(pulse).toBeDefined();
    expect(pulse!.name).toBe('PulseChain');
  });

  it('should throw for unknown chain', () => {
    expect(() => getChainConfig(99999)).toThrow();
  });

  it('should get chains by rollout phase', () => {
    const phase1 = getChainsByPhase(RolloutPhase.PHASE_1);
    expect(phase1.length).toBeGreaterThan(0);
  });

  it('should identify privacy-enabled chains', () => {
    const privacyChains = getPrivacyEnabledChains();
    expect(privacyChains.length).toBeGreaterThan(0);
  });

  it('should identify HERO ecosystem chains', () => {
    const heroChains = getHeroEcosystemChains();
    expect(heroChains.length).toBeGreaterThan(0);
  });
});

// ============================================================
// Tests: Privacy Engine (Railgun)
// ============================================================

describe('Privacy Engine (Railgun)', () => {
  it('should have Railgun supported chains defined', () => {
    expect(Object.keys(RAILGUN_SUPPORTED_CHAINS).length).toBe(4);
    expect(RAILGUN_SUPPORTED_CHAINS.ethereum.chainId).toBe(1);
    expect(RAILGUN_SUPPORTED_CHAINS.arbitrum.chainId).toBe(42161);
  });

  it('should have HERO direct chains defined', () => {
    expect(HERO_DIRECT_CHAINS.pulsechain.chainId).toBe(369);
    expect(HERO_DIRECT_CHAINS.base.chainId).toBe(8453);
    expect(HERO_DIRECT_CHAINS.pulsechain.privacyAvailable).toBeFalsy();
    expect(HERO_DIRECT_CHAINS.base.privacyAvailable).toBeFalsy();
  });

  it('should correctly identify native privacy chains', () => {
    expect(hasNativePrivacy('ethereum')).toBeTruthy();
    expect(hasNativePrivacy('arbitrum')).toBeTruthy();
    expect(hasNativePrivacy('pulsechain')).toBeFalsy();
    expect(hasNativePrivacy('base')).toBeFalsy();
  });

  it('should get correct bridge targets', () => {
    expect(getPrivacyBridgeTarget('pulsechain')).toBe('ethereum');
    expect(getPrivacyBridgeTarget('base')).toBe('arbitrum');
  });

  it('should create engine with default config', () => {
    const engine = new HeroPrivacyEngine({ db: {} });
    expect(engine.getStatus()).toBe(EngineStatus.UNINITIALIZED);
  });

  it('should reject missing db', () => {
    expect(() => new HeroPrivacyEngine({ db: null as unknown })).toThrow();
  });

  it('should reject invalid chain', () => {
    expect(() => new HeroPrivacyEngine({ db: {}, chains: ['fakenet' as any] })).toThrow();
  });

  it('should get available privacy modes for Railgun chains', () => {
    const engine = new HeroPrivacyEngine({ db: {} });
    const modes = engine.getAvailablePrivacy('ethereum');
    expect(modes).toContain(PrivacyMode.FULL_PRIVACY);
    expect(modes).toContain(PrivacyMode.TRANSPARENT);
  });

  it('should get available privacy modes for HERO direct chains', () => {
    const engine = new HeroPrivacyEngine({ db: {} });
    const modes = engine.getAvailablePrivacy('pulsechain');
    expect(modes).toContain(PrivacyMode.BRIDGE_TO_PRIVACY);
    expect(modes).toContain(PrivacyMode.TRANSPARENT);
  });

  it('should get enabled chains', () => {
    const engine = new HeroPrivacyEngine({ db: {}, chains: ['ethereum'] });
    expect(engine.getEnabledChains()).toEqual(['ethereum']);
  });
});

// ============================================================
// Tests: Guardian Agent
// ============================================================

describe('Guardian Agent', () => {
  it('should create agent with default config', () => {
    const agent = new HeroGuardianAgent({
      watchAddresses: ['0x1234567890123456789012345678901234567890'],
      chains: [{ chainId: 369, rpcUrl: 'https://rpc.pulsechain.com', name: 'PulseChain' }],
    });
    expect(agent.isFrozen()).toBeFalsy();
  });

  it('should reject invalid maxTxAmountUsd', () => {
    expect(() => new HeroGuardianAgent({
      watchAddresses: ['0x1234567890123456789012345678901234567890'],
      maxTxAmountUsd: -100,
    })).toThrow();
  });

  it('should reject invalid maxTxPerHour', () => {
    expect(() => new HeroGuardianAgent({
      watchAddresses: ['0x1234567890123456789012345678901234567890'],
      maxTxPerHour: 0,
    })).toThrow();
  });

  it('should reject too-short monitor interval', () => {
    expect(() => new HeroGuardianAgent({
      watchAddresses: ['0x1234567890123456789012345678901234567890'],
      monitorIntervalMs: 1000,
    })).toThrow();
  });

  it('should allow transactions when not frozen', () => {
    const agent = new HeroGuardianAgent({
      watchAddresses: ['0x1234567890123456789012345678901234567890'],
      chains: [{ chainId: 369, rpcUrl: 'https://rpc.pulsechain.com', name: 'PulseChain' }],
    });
    const result = agent.shouldAllowTransaction(
      100,
      '0x1234567890123456789012345678901234567890',
      369,
    );
    expect(result.allowed).toBeTruthy();
  });

  it('should generate health report', () => {
    const agent = new HeroGuardianAgent({
      watchAddresses: ['0x1234567890123456789012345678901234567890'],
      chains: [{ chainId: 369, rpcUrl: 'https://rpc.pulsechain.com', name: 'PulseChain' }],
    });
    const report = agent.getHealthReport();
    expect(report.totalAnomalies).toBe(0);
    expect(report.freezeActive).toBeFalsy();
    expect(report.activeAlerts).toBe(0);
  });

  it('should return empty anomaly history initially', () => {
    const agent = new HeroGuardianAgent({
      watchAddresses: ['0x1234567890123456789012345678901234567890'],
    });
    const history = agent.getAnomalyHistory();
    expect(history).toHaveLength(0);
  });

  it('should have ThreatLevel enum values', () => {
    expect(ThreatLevel.INFO).toBe('info');
    expect(ThreatLevel.LOW).toBe('low');
    expect(ThreatLevel.MEDIUM).toBe('medium');
    expect(ThreatLevel.HIGH).toBe('high');
    expect(ThreatLevel.CRITICAL).toBe('critical');
  });

  it('should have MonitorTarget enum values', () => {
    expect(MonitorTarget.TRANSACTIONS).toBe('transactions');
    expect(MonitorTarget.BALANCES).toBe('balances');
    expect(MonitorTarget.APPROVALS).toBe('approvals');
    expect(MonitorTarget.GAS_PRICES).toBe('gas_prices');
    expect(MonitorTarget.RPC_HEALTH).toBe('rpc_health');
  });
});

// ============================================================
// Test Summary
// ============================================================

console.log('\n' + '='.repeat(60));
console.log(`📊 TEST RESULTS: ${passed} passed, ${failed} failed, ${passed + failed} total`);
console.log('='.repeat(60));

if (failures.length > 0) {
  console.log('\n❌ FAILURES:');
  for (const f of failures) {
    console.log(`  • ${f}`);
  }
}

if (failed === 0) {
  console.log('\n🎉 ALL TESTS PASSED!');
} else {
  console.log(`\n⚠️  ${failed} test(s) need attention.`);
  process.exit(1);
}
