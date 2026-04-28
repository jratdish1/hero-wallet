/**
 * HERO Wallet — Rewards Engine
 * 
 * Manages the dual-reward system (HERO token or USDC stablecoin).
 * Fee distribution: 80% → HERO Treasury (charities), 20% → Rewards Pool.
 * 
 * @module hero/rewards
 * @version 0.2.0
 * @security CODEX-AUDIT-REQUIRED
 */

import { ZERO_ADDRESS } from '../config/tokens';

// ============================================================
// TYPES
// ============================================================

export enum RewardCurrency {
  HERO = 'HERO',
  USDC = 'USDC',
}

export interface RewardConfig {
  /** Base reward rate as decimal (0.005 = 0.5%) */
  baseRewardRate: number;
  /** Maximum reward rate as decimal (0.02 = 2.0%) */
  maxRewardRate: number;
  /** Fee rate charged on transactions as decimal (0.003 = 0.3%) */
  transactionFeeRate: number;
  /** Percentage of fees going to HERO Treasury (0.80 = 80%) */
  treasuryAllocation: number;
  /** Percentage of fees going to Rewards Pool (0.20 = 20%) */
  rewardsPoolAllocation: number;
}

export interface RewardDistribution {
  totalFee: bigint;
  treasuryAmount: bigint;
  rewardsPoolAmount: bigint;
  userReward: bigint;
  rewardCurrency: RewardCurrency;
}

export interface UserRewardPreference {
  walletAddress: string;
  preferredCurrency: RewardCurrency;
  currentRankMultiplier: number;
}

// ============================================================
// CONSTANTS
// ============================================================

/**
 * Default reward configuration.
 * These values are governance-adjustable via DAO vote.
 */
export const DEFAULT_REWARD_CONFIG: RewardConfig = {
  baseRewardRate: 0.005,       // 0.5%
  maxRewardRate: 0.02,         // 2.0%
  transactionFeeRate: 0.003,   // 0.3%
  treasuryAllocation: 0.80,    // 80%
  rewardsPoolAllocation: 0.20, // 20%
};

/**
 * HERO Treasury address — receives 80% of all fees for charitable causes.
 * ⚠️ SCAFFOLD: Replace with real multisig address before production.
 */
export const HERO_TREASURY_ADDRESS = ZERO_ADDRESS;

/**
 * Rewards Pool contract address — receives 20% of fees for user rewards.
 * ⚠️ SCAFFOLD: Replace with real contract address before production.
 */
export const REWARDS_POOL_ADDRESS = ZERO_ADDRESS;

// ============================================================
// VALIDATION
// ============================================================

function validateRewardConfig(config: RewardConfig): void {
  if (config.baseRewardRate < 0 || config.baseRewardRate > 1) {
    throw new Error('Invalid baseRewardRate. Must be between 0 and 1.');
  }
  if (config.maxRewardRate < config.baseRewardRate) {
    throw new Error('maxRewardRate must be >= baseRewardRate.');
  }
  if (config.transactionFeeRate < 0 || config.transactionFeeRate > 0.1) {
    throw new Error('Invalid transactionFeeRate. Must be between 0 and 0.1 (10%).');
  }
  const totalAllocation = config.treasuryAllocation + config.rewardsPoolAllocation;
  if (Math.abs(totalAllocation - 1.0) > 0.001) {
    throw new Error('Fee allocations must sum to 1.0.');
  }
}

function validateTransactionAmount(amount: bigint): void {
  if (amount <= 0n) {
    throw new Error('Transaction amount must be positive.');
  }
}

function validateWalletAddress(address: string): void {
  if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
    throw new Error('Invalid wallet address format.');
  }
}

function validateRewardCurrency(currency: RewardCurrency): void {
  if (!Object.values(RewardCurrency).includes(currency)) {
    throw new Error('Invalid reward currency.');
  }
}

// ============================================================
// REWARDS ENGINE
// ============================================================

export class HeroRewardsEngine {
  private config: RewardConfig;

  constructor(config: RewardConfig = DEFAULT_REWARD_CONFIG) {
    validateRewardConfig(config);
    this.config = { ...config };
  }

  /**
   * Calculate fee distribution for a transaction.
   * 
   * @param transactionAmount - The transaction value in token base units (wei)
   * @param userPreference - User's reward currency preference and rank multiplier
   * @returns Breakdown of fee distribution
   */
  calculateDistribution(
    transactionAmount: bigint,
    userPreference: UserRewardPreference,
  ): RewardDistribution {
    // Enforce configuration check — prevent fund loss to zero address
    if (!this.isFullyConfigured()) {
      throw new Error('Rewards engine not fully configured. Treasury and rewards pool addresses must be set before processing transactions.');
    }

    validateTransactionAmount(transactionAmount);
    validateWalletAddress(userPreference.walletAddress);
    validateRewardCurrency(userPreference.preferredCurrency);

    if (userPreference.currentRankMultiplier < 1.0 || userPreference.currentRankMultiplier > 10.0) {
      throw new Error('Invalid rank multiplier. Must be between 1.0 and 10.0.');
    }

    // Calculate total fee
    const feeRateBps = BigInt(Math.floor(this.config.transactionFeeRate * 10000));
    const totalFee = (transactionAmount * feeRateBps) / 10000n;

    // Split fee: 80% treasury, 20% rewards pool
    // Rounding guard: rewardsPoolAmount = totalFee - treasuryAmount ensures exact sum
    const treasuryBps = BigInt(Math.floor(this.config.treasuryAllocation * 10000));
    const treasuryAmount = (totalFee * treasuryBps) / 10000n;
    const rewardsPoolAmount = totalFee - treasuryAmount;

    // Assertion: fee split must be exact (no rounding loss)
    if (treasuryAmount + rewardsPoolAmount !== totalFee) {
      throw new Error('Fee split rounding error detected. Halting to prevent fund discrepancy.');
    }

    // Calculate user reward from the rewards pool
    const effectiveRate = Math.min(
      this.config.baseRewardRate * userPreference.currentRankMultiplier,
      this.config.maxRewardRate,
    );
    const rewardRateBps = BigInt(Math.floor(effectiveRate * 10000));
    const userReward = (transactionAmount * rewardRateBps) / 10000n;

    return {
      totalFee,
      treasuryAmount,
      rewardsPoolAmount,
      userReward,
      rewardCurrency: userPreference.preferredCurrency,
    };
  }

  /**
   * Check if the treasury and rewards pool addresses are configured.
   * Returns false if either is still a placeholder zero address.
   */
  isFullyConfigured(): boolean {
    return (
      HERO_TREASURY_ADDRESS !== ZERO_ADDRESS &&
      REWARDS_POOL_ADDRESS !== ZERO_ADDRESS
    );
  }

  /**
   * Get the current reward configuration (read-only copy).
   */
  getConfig(): Readonly<RewardConfig> {
    return { ...this.config };
  }

  /**
   * Update reward configuration (governance action).
   * Validates the new config before applying.
   */
  updateConfig(newConfig: Partial<RewardConfig>): void {
    const merged = { ...this.config, ...newConfig };
    validateRewardConfig(merged);
    this.config = merged;
  }
}
