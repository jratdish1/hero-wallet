/**
 * HERO Wallet — Rewards Engine v0.3.0
 *
 * Fee Distribution:
 *   70% → HERO Treasury (charities / VIC Foundation 501(c)(3))
 *   20% → Rewards Pool (HERO or USDC, user's choice)
 *    5% → Wallet Overhead (server costs, maintenance)
 *    5% → Buy & Burn (deflationary pressure on $HERO)
 *
 * NFT Discount: HERO NFT holders receive 2% off all fees.
 *
 * Claim System:
 *   - Users accumulate rewards from every transaction
 *   - Claim button triggers auto-swap to preferred currency
 *   - Rewards loaded directly into wallet balance
 *
 * @module hero/rewards
 * @version 0.3.0
 * @security CODEX-AUDIT-REQUIRED
 */

import { ZERO_ADDRESS, HERO_PULSECHAIN } from '../config/tokens';

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
  /** Percentage of fees going to HERO Treasury (0.70 = 70%) */
  treasuryAllocation: number;
  /** Percentage of fees going to Rewards Pool (0.20 = 20%) */
  rewardsPoolAllocation: number;
  /** Percentage of fees going to Wallet Overhead (0.05 = 5%) */
  walletOverheadAllocation: number;
  /** Percentage of fees going to Buy & Burn (0.05 = 5%) */
  buyAndBurnAllocation: number;
  /** NFT holder fee discount as decimal (0.02 = 2%) */
  nftHolderDiscount: number;
}

export interface RewardDistribution {
  totalFee: bigint;
  treasuryAmount: bigint;
  rewardsPoolAmount: bigint;
  walletOverheadAmount: bigint;
  buyAndBurnAmount: bigint;
  userReward: bigint;
  rewardCurrency: RewardCurrency;
  nftDiscountApplied: boolean;
  effectiveFeeRate: number;
}

export interface UserRewardPreference {
  walletAddress: string;
  preferredCurrency: RewardCurrency;
  currentRankMultiplier: number;
  holdsHeroNFT: boolean;
}

export interface ClaimableRewards {
  walletAddress: string;
  pendingHERO: bigint;
  pendingUSDC: bigint;
  totalClaimedHERO: bigint;
  totalClaimedUSDC: bigint;
  lastClaimTimestamp: number;
  preferredCurrency: RewardCurrency;
}

export interface ClaimResult {
  success: boolean;
  txHash: string;
  amountClaimed: bigint;
  currency: RewardCurrency;
  autoSwapExecuted: boolean;
  newBalance: bigint;
  timestamp: number;
}

export interface BuyAndBurnEvent {
  txHash: string;
  heroAmountBurned: bigint;
  sourceAmount: bigint;
  timestamp: number;
  blockNumber: number;
}

// ============================================================
// CONSTANTS
// ============================================================

/**
 * Default reward configuration — v0.3.0 (70/20/5/5 split)
 * These values are governance-adjustable via DAO vote.
 */
export const DEFAULT_REWARD_CONFIG: RewardConfig = {
  baseRewardRate: 0.005,              // 0.5%
  maxRewardRate: 0.02,                // 2.0%
  transactionFeeRate: 0.003,          // 0.3%
  treasuryAllocation: 0.70,           // 70% → charities
  rewardsPoolAllocation: 0.20,        // 20% → user rewards
  walletOverheadAllocation: 0.05,     // 5% → server costs
  buyAndBurnAllocation: 0.05,         // 5% → buy & burn HERO
  nftHolderDiscount: 0.02,            // 2% off fees for NFT holders
};

/**
 * HERO Treasury address — receives 70% of all fees for charitable causes.
 * Multisig controlled by VIC Foundation 501(c)(3).
 * ⚠️ SCAFFOLD: Replace with real multisig address before production.
 */
export const HERO_TREASURY_ADDRESS = ZERO_ADDRESS;

/**
 * Rewards Pool contract address — receives 20% of fees for user rewards.
 * ⚠️ SCAFFOLD: Replace with real contract address before production.
 */
export const REWARDS_POOL_ADDRESS = ZERO_ADDRESS;

/**
 * Wallet Overhead address — receives 5% for server/infrastructure costs.
 * ⚠️ SCAFFOLD: Replace with real address before production.
 */
export const WALLET_OVERHEAD_ADDRESS = ZERO_ADDRESS;

/**
 * Buy & Burn address — receives 5% to purchase and burn $HERO tokens.
 * ⚠️ SCAFFOLD: Replace with real burn contract before production.
 */
export const BUY_AND_BURN_ADDRESS = ZERO_ADDRESS;

/**
 * HERO NFT Collection contract address — used to verify NFT ownership for discount.
 * ⚠️ SCAFFOLD: Replace with real NFT contract before production.
 */
export const HERO_NFT_CONTRACT_ADDRESS = ZERO_ADDRESS;

/**
 * USDC contract address on PulseChain for reward swaps.
 * ⚠️ SCAFFOLD: Replace with real USDC address.
 */
export const USDC_PULSECHAIN_ADDRESS = ZERO_ADDRESS;

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
  if (config.nftHolderDiscount < 0 || config.nftHolderDiscount > 0.5) {
    throw new Error('Invalid nftHolderDiscount. Must be between 0 and 0.5 (50%).');
  }

  const totalAllocation =
    config.treasuryAllocation +
    config.rewardsPoolAllocation +
    config.walletOverheadAllocation +
    config.buyAndBurnAllocation;

  if (Math.abs(totalAllocation - 1.0) > 0.001) {
    throw new Error(
      `Fee allocations must sum to 1.0. Current sum: ${totalAllocation}`,
    );
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
  private pendingRewards: Map<string, ClaimableRewards> = new Map();
  private buyAndBurnHistory: BuyAndBurnEvent[] = [];
  private claimLocks: Set<string> = new Set(); // Mutex for concurrent claim prevention
  private ownerAddress: string; // Only owner (DAO multisig) can update config

  constructor(config: RewardConfig = DEFAULT_REWARD_CONFIG, ownerAddress: string = ZERO_ADDRESS) {
    validateRewardConfig(config);
    this.config = { ...config };
    this.ownerAddress = ownerAddress;
  }

  /**
   * Calculate fee distribution for a transaction.
   * Applies NFT discount if user holds a HERO NFT.
   *
   * @param transactionAmount - The transaction value in token base units (wei)
   * @param userPreference - User's reward preference, rank multiplier, and NFT status
   * @returns Breakdown of fee distribution (70/20/5/5)
   */
  calculateDistribution(
    transactionAmount: bigint,
    userPreference: UserRewardPreference,
  ): RewardDistribution {
    // Enforce configuration check — prevent fund loss to zero address
    if (!this.isFullyConfigured()) {
      throw new Error(
        'Rewards engine not fully configured. All destination addresses must be set before processing transactions.',
      );
    }

    validateTransactionAmount(transactionAmount);
    validateWalletAddress(userPreference.walletAddress);
    validateRewardCurrency(userPreference.preferredCurrency);

    if (
      userPreference.currentRankMultiplier < 1.0 ||
      userPreference.currentRankMultiplier > 10.0
    ) {
      throw new Error('Invalid rank multiplier. Must be between 1.0 and 10.0.');
    }

    // Apply NFT discount (2% off fees for HERO NFT holders)
    let effectiveFeeRate = this.config.transactionFeeRate;
    const nftDiscountApplied = userPreference.holdsHeroNFT;
    if (nftDiscountApplied) {
      effectiveFeeRate = effectiveFeeRate * (1 - this.config.nftHolderDiscount);
    }

    // Calculate total fee
    const feeRateBps = BigInt(Math.floor(effectiveFeeRate * 10000));
    const totalFee = (transactionAmount * feeRateBps) / 10000n;

    // Split fee: 70% treasury, 20% rewards, 5% overhead, 5% buy & burn
    const treasuryBps = BigInt(Math.floor(this.config.treasuryAllocation * 10000));
    const rewardsBps = BigInt(Math.floor(this.config.rewardsPoolAllocation * 10000));
    const overheadBps = BigInt(Math.floor(this.config.walletOverheadAllocation * 10000));

    const treasuryAmount = (totalFee * treasuryBps) / 10000n;
    const rewardsPoolAmount = (totalFee * rewardsBps) / 10000n;
    const walletOverheadAmount = (totalFee * overheadBps) / 10000n;
    // Buy & burn gets the remainder to prevent rounding loss
    const buyAndBurnAmount = totalFee - treasuryAmount - rewardsPoolAmount - walletOverheadAmount;

    // Assertion: fee split must be exact
    if (treasuryAmount + rewardsPoolAmount + walletOverheadAmount + buyAndBurnAmount !== totalFee) {
      throw new Error('Fee split rounding error detected. Halting to prevent fund discrepancy.');
    }

    // Calculate user reward from the rewards pool
    const effectiveRewardRate = Math.min(
      this.config.baseRewardRate * userPreference.currentRankMultiplier,
      this.config.maxRewardRate,
    );
    const rewardRateBps = BigInt(Math.floor(effectiveRewardRate * 10000));
    const userReward = (transactionAmount * rewardRateBps) / 10000n;

    return {
      totalFee,
      treasuryAmount,
      rewardsPoolAmount,
      walletOverheadAmount,
      buyAndBurnAmount,
      userReward,
      rewardCurrency: userPreference.preferredCurrency,
      nftDiscountApplied,
      effectiveFeeRate,
    };
  }

  // ============================================================
  // CLAIM SYSTEM
  // ============================================================

  /**
   * Accumulate rewards for a user after a transaction.
   * Called internally after each successful transaction.
   */
  accumulateReward(
    walletAddress: string,
    amount: bigint,
    currency: RewardCurrency,
  ): void {
    validateWalletAddress(walletAddress);
    const key = walletAddress.toLowerCase();

    let record = this.pendingRewards.get(key);
    if (!record) {
      record = {
        walletAddress: key,
        pendingHERO: 0n,
        pendingUSDC: 0n,
        totalClaimedHERO: 0n,
        totalClaimedUSDC: 0n,
        lastClaimTimestamp: 0,
        preferredCurrency: currency,
      };
    }

    if (currency === RewardCurrency.HERO) {
      record.pendingHERO += amount;
    } else {
      record.pendingUSDC += amount;
    }

    this.pendingRewards.set(key, record);
  }

  /**
   * Get claimable rewards for a user.
   * Used to display pending rewards in the wallet UI.
   */
  getClaimableRewards(walletAddress: string): ClaimableRewards | null {
    validateWalletAddress(walletAddress);
    return this.pendingRewards.get(walletAddress.toLowerCase()) || null;
  }

  /**
   * Execute reward claim — auto-swaps to preferred currency and loads into wallet.
   *
   * Flow:
   * 1. Check pending rewards > 0
   * 2. If preferred currency differs from accumulated, execute DEX swap
   * 3. Transfer claimed amount to user's wallet
   * 4. Update claim records
   * 5. Return claim receipt
   *
   * @param walletAddress - User's wallet address
   * @param preferredCurrency - HERO or USDC (user's choice)
   * @returns ClaimResult with transaction details
   */
  async claimRewards(
    walletAddress: string,
    preferredCurrency: RewardCurrency,
  ): Promise<ClaimResult> {
    validateWalletAddress(walletAddress);
    validateRewardCurrency(preferredCurrency);

    const key = walletAddress.toLowerCase();

    // Mutex: prevent concurrent claims for same wallet
    if (this.claimLocks.has(key)) {
      throw new Error('Claim already in progress for this wallet. Please wait.');
    }
    this.claimLocks.add(key);

    try {
      return await this._executeClaimInternal(key, preferredCurrency);
    } finally {
      this.claimLocks.delete(key);
    }
  }

  private async _executeClaimInternal(
    key: string,
    preferredCurrency: RewardCurrency,
  ): Promise<ClaimResult> {
    const record = this.pendingRewards.get(key);

    if (!record) {
      throw new Error('No rewards found for this wallet address.');
    }

    const pendingAmount =
      preferredCurrency === RewardCurrency.HERO
        ? record.pendingHERO
        : record.pendingUSDC;

    // Check if there's anything to claim
    const totalPending = record.pendingHERO + record.pendingUSDC;
    if (totalPending <= 0n) {
      throw new Error('No pending rewards to claim.');
    }

    // Determine if auto-swap is needed
    let autoSwapExecuted = false;
    let claimAmount = 0n;

    if (preferredCurrency === RewardCurrency.HERO) {
      claimAmount = record.pendingHERO;
      // If user has USDC rewards but wants HERO, swap USDC → HERO
      if (record.pendingUSDC > 0n) {
        claimAmount += await this.executeAutoSwap(
          record.pendingUSDC,
          RewardCurrency.USDC,
          RewardCurrency.HERO,
        );
        autoSwapExecuted = true;
      }
    } else {
      claimAmount = record.pendingUSDC;
      // If user has HERO rewards but wants USDC, swap HERO → USDC
      if (record.pendingHERO > 0n) {
        claimAmount += await this.executeAutoSwap(
          record.pendingHERO,
          RewardCurrency.HERO,
          RewardCurrency.USDC,
        );
        autoSwapExecuted = true;
      }
    }

    // Execute transfer to user's wallet
    const txHash = await this.transferRewardsToWallet(walletAddress, claimAmount, preferredCurrency);

    // Update records
    const now = Date.now();
    if (preferredCurrency === RewardCurrency.HERO) {
      record.totalClaimedHERO += claimAmount;
    } else {
      record.totalClaimedUSDC += claimAmount;
    }
    record.pendingHERO = 0n;
    record.pendingUSDC = 0n;
    record.lastClaimTimestamp = now;
    this.pendingRewards.set(key, record);

    return {
      success: true,
      txHash,
      amountClaimed: claimAmount,
      currency: preferredCurrency,
      autoSwapExecuted,
      newBalance: claimAmount, // Will be updated by wallet balance check
      timestamp: now,
    };
  }

  // ============================================================
  // BUY & BURN
  // ============================================================

  /**
   * Execute buy and burn — purchases $HERO on DEX and sends to burn address.
   * Called automatically when buy & burn pool reaches threshold.
   *
   * @param amount - Amount in native/USDC to use for buying HERO
   * @returns BuyAndBurnEvent with details
   */
  async executeBuyAndBurn(amount: bigint, callerAddress: string): Promise<BuyAndBurnEvent> {
    // ACCESS CONTROL: Only owner can trigger buy & burn
    this.requireOwner(callerAddress);

    if (amount <= 0n) {
      throw new Error('Buy and burn amount must be positive.');
    }

    // TODO: Integrate with herobase.io swap aggregator
    // 1. Swap collected fees → $HERO via best available DEX route
    // 2. Send purchased $HERO to burn address (0x000...dead)
    // 3. Emit event for transparency

    const event: BuyAndBurnEvent = {
      txHash: '', // Will be populated by actual transaction
      heroAmountBurned: 0n, // Will be populated after swap
      sourceAmount: amount,
      timestamp: Date.now(),
      blockNumber: 0, // Will be populated from chain
    };

    this.buyAndBurnHistory.push(event);
    return event;
  }

  /**
   * Get total $HERO burned through the buy & burn mechanism.
   */
  getTotalBurned(): bigint {
    return this.buyAndBurnHistory.reduce(
      (total, event) => total + event.heroAmountBurned,
      0n,
    );
  }

  /**
   * Get buy & burn history for transparency dashboard.
   */
  getBuyAndBurnHistory(): readonly BuyAndBurnEvent[] {
    return [...this.buyAndBurnHistory];
  }

  // ============================================================
  // NFT DISCOUNT
  // ============================================================

  /**
   * Verify if a wallet holds a HERO NFT for fee discount.
   * Checks on-chain NFT balance.
   *
   * @param walletAddress - Address to check
   * @returns true if wallet holds at least 1 HERO NFT
   */
  async verifyNFTHolder(walletAddress: string): Promise<boolean> {
    validateWalletAddress(walletAddress);

    // TODO: Implement ERC-721 balanceOf check against HERO_NFT_CONTRACT_ADDRESS
    // For now, return false (no discount applied until NFT contract is deployed)
    if (HERO_NFT_CONTRACT_ADDRESS === ZERO_ADDRESS) {
      return false;
    }

    // Placeholder for actual on-chain check
    // const nftContract = new ethers.Contract(HERO_NFT_CONTRACT_ADDRESS, ERC721_ABI, provider);
    // const balance = await nftContract.balanceOf(walletAddress);
    // return balance > 0;
    return false;
  }

  /**
   * Calculate the fee savings from NFT discount.
   */
  calculateNFTSavings(transactionAmount: bigint): bigint {
    const normalFee = (transactionAmount * BigInt(Math.floor(this.config.transactionFeeRate * 10000))) / 10000n;
    const discountedRate = this.config.transactionFeeRate * (1 - this.config.nftHolderDiscount);
    const discountedFee = (transactionAmount * BigInt(Math.floor(discountedRate * 10000))) / 10000n;
    return normalFee - discountedFee;
  }

  // ============================================================
  // PRIVATE METHODS
  // ============================================================

  /**
   * Auto-swap between reward currencies via herobase.io swap aggregator.
   * Routes through PulseX/9inch/LibertySwap for best rate.
   */
  private async executeAutoSwap(
    amount: bigint,
    fromCurrency: RewardCurrency,
    toCurrency: RewardCurrency,
  ): Promise<bigint> {
    // TODO: Integrate with HerobaseConnector for DEX swap
    // 1. Get quote from herobase.io swap aggregator
    // 2. Execute swap with slippage protection (max 1%)
    // 3. Return received amount

    // Placeholder — returns input amount (1:1 for scaffold)
    console.warn(
      `[HeroRewards] Auto-swap ${fromCurrency} → ${toCurrency} not yet implemented. Amount: ${amount}`,
    );
    return amount;
  }

  /**
   * Transfer claimed rewards to user's wallet.
   */
  private async transferRewardsToWallet(
    walletAddress: string,
    amount: bigint,
    currency: RewardCurrency,
  ): Promise<string> {
    // TODO: Execute actual token transfer from rewards pool to user wallet
    // 1. Call rewards pool contract withdraw function
    // 2. Transfer tokens to walletAddress
    // 3. Return transaction hash

    console.warn(
      `[HeroRewards] Transfer ${amount} ${currency} to ${walletAddress} — not yet implemented.`,
    );
    return '0x' + '0'.repeat(64); // Placeholder tx hash
  }

  // ============================================================
  // STATUS & CONFIGURATION
  // ============================================================

  /**
   * Check if all destination addresses are configured (non-zero).
   */
  isFullyConfigured(): boolean {
    return (
      HERO_TREASURY_ADDRESS !== ZERO_ADDRESS &&
      REWARDS_POOL_ADDRESS !== ZERO_ADDRESS &&
      WALLET_OVERHEAD_ADDRESS !== ZERO_ADDRESS &&
      BUY_AND_BURN_ADDRESS !== ZERO_ADDRESS
    );
  }

  /**
   * Get the current reward configuration (read-only copy).
   */
  getConfig(): Readonly<RewardConfig> {
    return { ...this.config };
  }

  /**
   * Update reward configuration (governance action via DAO).
   * Validates the new config before applying.
   * ACCESS CONTROL: Only owner (DAO multisig) can call this.
   */
  updateConfig(newConfig: Partial<RewardConfig>, callerAddress: string): void {
    this.requireOwner(callerAddress);
    const merged = { ...this.config, ...newConfig };
    validateRewardConfig(merged);
    this.config = merged;
  }

  /**
   * Access control check — ensures caller is the owner/DAO multisig.
   */
  private requireOwner(callerAddress: string): void {
    validateWalletAddress(callerAddress);
    if (callerAddress.toLowerCase() !== this.ownerAddress.toLowerCase()) {
      throw new Error('Access denied. Only the DAO multisig owner can perform this action.');
    }
    if (this.ownerAddress === ZERO_ADDRESS) {
      throw new Error('Owner address not configured. Cannot authorize governance actions.');
    }
  }

  /**
   * Get fee breakdown summary for display in wallet UI.
   */
  getFeeBreakdownDisplay(): {
    treasury: string;
    rewards: string;
    overhead: string;
    buyAndBurn: string;
    nftDiscount: string;
  } {
    return {
      treasury: `${this.config.treasuryAllocation * 100}% → HERO Treasury (Charities)`,
      rewards: `${this.config.rewardsPoolAllocation * 100}% → Rewards Pool (Your Rewards)`,
      overhead: `${this.config.walletOverheadAllocation * 100}% → Wallet Infrastructure`,
      buyAndBurn: `${this.config.buyAndBurnAllocation * 100}% → Buy & Burn $HERO`,
      nftDiscount: `${this.config.nftHolderDiscount * 100}% fee discount for HERO NFT holders`,
    };
  }
}
