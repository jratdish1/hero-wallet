/**
 * HERO Wallet — Claim Handler
 *
 * Backend service for processing reward claims.
 * Handles auto-swap routing, wallet loading, and claim verification.
 *
 * User Flow:
 * 1. User taps "Claim Rewards" button in wallet
 * 2. System checks pending rewards balance
 * 3. If user prefers different currency than accumulated, auto-swap executes
 * 4. Rewards transferred directly to user's wallet
 * 5. Balance updates in real-time
 *
 * @module hero/rewards/claim-handler
 * @version 0.3.0
 * @security CODEX-AUDIT-REQUIRED
 */

import {
  RewardCurrency,
  ClaimableRewards,
  ClaimResult,
  HeroRewardsEngine,
  REWARDS_POOL_ADDRESS,
  HERO_TREASURY_ADDRESS,
} from './rewards-engine';
import { HERO_PULSECHAIN, ZERO_ADDRESS } from '../config/tokens';

// ============================================================
// TYPES
// ============================================================

export interface SwapQuote {
  fromToken: string;
  toToken: string;
  fromAmount: bigint;
  toAmount: bigint;
  route: SwapRoute[];
  priceImpact: number;
  slippage: number;
  expiresAt: number;
}

export interface SwapRoute {
  dex: string;
  poolAddress: string;
  tokenIn: string;
  tokenOut: string;
  fee: number;
}

export interface ClaimRequest {
  walletAddress: string;
  preferredCurrency: RewardCurrency;
  maxSlippage: number; // Default 1% (0.01)
  signature: string; // EIP-712 signature for claim authorization
}

export interface ClaimStatus {
  status: 'pending' | 'processing' | 'completed' | 'failed';
  txHash?: string;
  error?: string;
  estimatedCompletion?: number;
}

export enum SwapDex {
  PULSEX = 'PulseX',
  NINE_INCH = '9inch',
  LIBERTY_SWAP = 'LibertySwap',
}

// ============================================================
// CONSTANTS
// ============================================================

/** Maximum slippage allowed for auto-swap (5%) */
const MAX_SLIPPAGE = 0.05;

/** Minimum claim amount in wei (prevent dust claims) */
const MIN_CLAIM_AMOUNT = 1000000000000000n; // 0.001 tokens

/** Claim cooldown period in milliseconds (5 minutes) */
const CLAIM_COOLDOWN_MS = 5 * 60 * 1000;

/** DEX router addresses on PulseChain */
const DEX_ROUTERS: Record<SwapDex, string> = {
  [SwapDex.PULSEX]: '0x98bf93ebf5c380C0e6Ae8e192A7e2AE08edAcc02', // PulseX V2 Router
  [SwapDex.NINE_INCH]: ZERO_ADDRESS, // TODO: Add 9inch router
  [SwapDex.LIBERTY_SWAP]: ZERO_ADDRESS, // TODO: Add LibertySwap router
};

/** USDC on PulseChain (bridged) */
const USDC_ADDRESS = '0x15D38573d2feeb82e7ad5187aB8c1D52810B1f07'; // TODO: Verify

// ============================================================
// CLAIM HANDLER
// ============================================================

export class HeroClaimHandler {
  private rewardsEngine: HeroRewardsEngine;
  private processingClaims: Map<string, ClaimStatus> = new Map();

  constructor(rewardsEngine: HeroRewardsEngine) {
    this.rewardsEngine = rewardsEngine;
  }

  /**
   * Process a claim request from the wallet UI.
   *
   * This is the main entry point when user taps "Claim Rewards".
   *
   * @param request - Claim request with wallet, currency preference, and signature
   * @returns ClaimResult with transaction details
   */
  async processClaim(request: ClaimRequest): Promise<ClaimResult> {
    // 1. Validate request
    this.validateClaimRequest(request);

    // 2. Check cooldown
    const lastClaim = this.getLastClaimTime(request.walletAddress);
    if (lastClaim && Date.now() - lastClaim < CLAIM_COOLDOWN_MS) {
      const waitTime = Math.ceil((CLAIM_COOLDOWN_MS - (Date.now() - lastClaim)) / 1000);
      throw new Error(`Claim cooldown active. Please wait ${waitTime} seconds.`);
    }

    // 3. Verify signature (EIP-712)
    await this.verifyClaimSignature(request);

    // 4. Get pending rewards
    const rewards = this.rewardsEngine.getClaimableRewards(request.walletAddress);
    if (!rewards) {
      throw new Error('No rewards found for this wallet.');
    }

    const totalPending = rewards.pendingHERO + rewards.pendingUSDC;
    if (totalPending < MIN_CLAIM_AMOUNT) {
      throw new Error(
        `Minimum claim amount is ${MIN_CLAIM_AMOUNT} wei. Current pending: ${totalPending} wei.`,
      );
    }

    // 5. Set processing status
    this.processingClaims.set(request.walletAddress.toLowerCase(), {
      status: 'processing',
      estimatedCompletion: Date.now() + 30000, // ~30 seconds
    });

    try {
      // 6. Execute claim (with auto-swap if needed)
      const result = await this.rewardsEngine.claimRewards(
        request.walletAddress,
        request.preferredCurrency,
      );

      // 7. Update status
      this.processingClaims.set(request.walletAddress.toLowerCase(), {
        status: 'completed',
        txHash: result.txHash,
      });

      return result;
    } catch (error) {
      // 8. Handle failure
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      this.processingClaims.set(request.walletAddress.toLowerCase(), {
        status: 'failed',
        error: errorMsg,
      });
      throw error;
    }
  }

  /**
   * Get a swap quote for auto-swap during claim.
   * Routes through best available DEX on PulseChain.
   *
   * @param fromCurrency - Source currency
   * @param toCurrency - Destination currency
   * @param amount - Amount to swap
   * @returns Best swap quote from available DEXes
   */
  async getSwapQuote(
    fromCurrency: RewardCurrency,
    toCurrency: RewardCurrency,
    amount: bigint,
  ): Promise<SwapQuote> {
    const fromToken =
      fromCurrency === RewardCurrency.HERO
        ? HERO_PULSECHAIN.address
        : USDC_ADDRESS;
    const toToken =
      toCurrency === RewardCurrency.HERO
        ? HERO_PULSECHAIN.address
        : USDC_ADDRESS;

    // TODO: Query all available DEXes for best rate
    // For now, return a scaffold quote via PulseX
    const quote: SwapQuote = {
      fromToken,
      toToken,
      fromAmount: amount,
      toAmount: amount, // Placeholder 1:1 — will be real quote from DEX
      route: [
        {
          dex: SwapDex.PULSEX,
          poolAddress: ZERO_ADDRESS, // TODO: Get actual pool
          tokenIn: fromToken,
          tokenOut: toToken,
          fee: 0.003, // 0.3% standard fee
        },
      ],
      priceImpact: 0,
      slippage: 0.01, // 1% default
      expiresAt: Date.now() + 60000, // 60 second expiry
    };

    return quote;
  }

  /**
   * Get the current claim status for a wallet.
   * Used for polling from the wallet UI.
   */
  getClaimStatus(walletAddress: string): ClaimStatus | null {
    return this.processingClaims.get(walletAddress.toLowerCase()) || null;
  }

  /**
   * Get claim history for a wallet (for UI display).
   */
  async getClaimHistory(
    walletAddress: string,
    limit: number = 20,
  ): Promise<ClaimResult[]> {
    // TODO: Query from on-chain events or indexed database
    return [];
  }

  /**
   * Estimate gas cost for a claim transaction.
   */
  async estimateClaimGas(request: ClaimRequest): Promise<{
    gasEstimate: bigint;
    gasCostInPLS: bigint;
    gasCostInUSD: number;
  }> {
    // TODO: Estimate actual gas from contract call
    return {
      gasEstimate: 150000n, // Typical ERC-20 transfer + swap
      gasCostInPLS: 0n,
      gasCostInUSD: 0,
    };
  }

  // ============================================================
  // PRIVATE METHODS
  // ============================================================

  private validateClaimRequest(request: ClaimRequest): void {
    if (!/^0x[a-fA-F0-9]{40}$/.test(request.walletAddress)) {
      throw new Error('Invalid wallet address format.');
    }
    if (!Object.values(RewardCurrency).includes(request.preferredCurrency)) {
      throw new Error('Invalid reward currency preference.');
    }
    if (request.maxSlippage < 0 || request.maxSlippage > MAX_SLIPPAGE) {
      throw new Error(`Max slippage must be between 0 and ${MAX_SLIPPAGE * 100}%.`);
    }
    if (!request.signature || request.signature.length < 130) {
      throw new Error('Invalid claim signature.');
    }
  }

  private async verifyClaimSignature(request: ClaimRequest): Promise<void> {
    // TODO: Implement EIP-712 signature verification
    // 1. Reconstruct typed data hash
    // 2. Recover signer from signature
    // 3. Verify signer === request.walletAddress
    if (!request.signature.startsWith('0x')) {
      throw new Error('Signature must be hex-encoded starting with 0x.');
    }
  }

  private getLastClaimTime(walletAddress: string): number | null {
    const rewards = this.rewardsEngine.getClaimableRewards(walletAddress);
    return rewards?.lastClaimTimestamp || null;
  }
}

// ============================================================
// CLAIM API ENDPOINTS (for wallet backend)
// ============================================================

/**
 * API endpoint handlers for the HERO Wallet backend.
 * These will be mounted on the dedicated VDS server.
 */
export const ClaimAPI = {
  /**
   * POST /api/rewards/claim
   * Body: { walletAddress, preferredCurrency, maxSlippage, signature }
   */
  claim: 'POST /api/rewards/claim',

  /**
   * GET /api/rewards/pending/:walletAddress
   * Returns current claimable rewards balance
   */
  getPending: 'GET /api/rewards/pending/:walletAddress',

  /**
   * GET /api/rewards/status/:walletAddress
   * Returns current claim processing status
   */
  getStatus: 'GET /api/rewards/status/:walletAddress',

  /**
   * GET /api/rewards/history/:walletAddress
   * Returns claim history with pagination
   */
  getHistory: 'GET /api/rewards/history/:walletAddress',

  /**
   * GET /api/rewards/quote
   * Query: { from, to, amount }
   * Returns swap quote for auto-swap preview
   */
  getQuote: 'GET /api/rewards/quote',

  /**
   * GET /api/rewards/stats
   * Returns global rewards stats (total distributed, total burned, etc.)
   */
  getStats: 'GET /api/rewards/stats',
};
