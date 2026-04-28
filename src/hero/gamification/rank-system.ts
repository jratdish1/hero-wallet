/**
 * HERO Wallet — Gamification & Rank System
 * 
 * Military-inspired rank system for user retention.
 * Users earn XP through productive wallet usage and rank up
 * to unlock higher reward multipliers and ecosystem perks.
 * 
 * @module hero/gamification
 * @version 0.2.0
 * @security CODEX-AUDIT-REQUIRED
 */

// ============================================================
// TYPES
// ============================================================

export interface HeroRank {
  id: string;
  title: string;
  militaryGrade: string;
  xpRequired: number;
  rewardMultiplier: number;
  perks: string[];
}

export enum XPActivity {
  SHIELD_FIRST_TOKEN = 'SHIELD_FIRST_TOKEN',
  PRIVATE_SEND = 'PRIVATE_SEND',
  SWAP_VIA_HEROBASE = 'SWAP_VIA_HEROBASE',
  BRIDGE_CROSS_CHAIN = 'BRIDGE_CROSS_CHAIN',
  HOLD_SHIELDED_7_DAYS = 'HOLD_SHIELDED_7_DAYS',
  REFER_NEW_USER = 'REFER_NEW_USER',
  DAO_VOTE = 'DAO_VOTE',
  DAILY_LOGIN_STREAK = 'DAILY_LOGIN_STREAK',
}

export interface XPEvent {
  activity: XPActivity;
  xpEarned: number;
  timestamp: number;
  metadata?: Record<string, string>;
}

export interface UserProfile {
  walletAddress: string;
  totalXP: number;
  currentRank: HeroRank;
  xpHistory: XPEvent[];
  achievements: string[];
  referralCount: number;
  loginStreak: number;
  lastLoginDate: string;
}

// ============================================================
// RANK DEFINITIONS
// ============================================================

/**
 * HERO Rank ladder — military-inspired tiers.
 * Sorted ascending by XP requirement.
 */
export const HERO_RANKS: readonly HeroRank[] = Object.freeze([
  {
    id: 'e1_recruit',
    title: 'Recruit',
    militaryGrade: 'E-1',
    xpRequired: 0,
    rewardMultiplier: 1.0,
    perks: ['Basic wallet features'],
  },
  {
    id: 'e3_lance_corporal',
    title: 'Lance Corporal',
    militaryGrade: 'E-3',
    xpRequired: 500,
    rewardMultiplier: 1.2,
    perks: ['Custom wallet themes', 'Profile badge'],
  },
  {
    id: 'e5_sergeant',
    title: 'Sergeant',
    militaryGrade: 'E-5',
    xpRequired: 2000,
    rewardMultiplier: 1.5,
    perks: ['Priority relayer access', 'Reduced fees (0.25%)'],
  },
  {
    id: 'e7_gunnery_sergeant',
    title: 'Gunnery Sergeant',
    militaryGrade: 'E-7',
    xpRequired: 10000,
    rewardMultiplier: 2.0,
    perks: ['DAO voting weight bonus (1.5x)', 'Exclusive NFT badge'],
  },
  {
    id: 'e9_sergeant_major',
    title: 'Sergeant Major',
    militaryGrade: 'E-9',
    xpRequired: 50000,
    rewardMultiplier: 3.0,
    perks: ['Governance proposal rights', 'Beta feature access'],
  },
  {
    id: 'o1_lieutenant',
    title: 'Lieutenant',
    militaryGrade: 'O-1',
    xpRequired: 100000,
    rewardMultiplier: 4.0,
    perks: ['Treasury allocation voting', 'Charity nomination rights', 'VIP support channel'],
  },
]);

// ============================================================
// XP REWARD TABLE
// ============================================================

/**
 * XP earned per activity type.
 * Cooldowns are enforced at the application layer.
 */
export const XP_REWARDS: Record<XPActivity, { xp: number; cooldown: string }> = {
  [XPActivity.SHIELD_FIRST_TOKEN]: { xp: 100, cooldown: 'Once per token' },
  [XPActivity.PRIVATE_SEND]: { xp: 25, cooldown: 'None' },
  [XPActivity.SWAP_VIA_HEROBASE]: { xp: 50, cooldown: 'None' },
  [XPActivity.BRIDGE_CROSS_CHAIN]: { xp: 75, cooldown: 'None' },
  [XPActivity.HOLD_SHIELDED_7_DAYS]: { xp: 200, cooldown: 'Weekly' },
  [XPActivity.REFER_NEW_USER]: { xp: 500, cooldown: 'None' },
  [XPActivity.DAO_VOTE]: { xp: 150, cooldown: 'Per proposal' },
  [XPActivity.DAILY_LOGIN_STREAK]: { xp: 100, cooldown: 'Weekly (7-day streak)' },
};

// ============================================================
// ACHIEVEMENT DEFINITIONS
// ============================================================

export interface Achievement {
  id: string;
  title: string;
  description: string;
  condition: string;
  nftBadge: boolean;
}

export const ACHIEVEMENTS: readonly Achievement[] = Object.freeze([
  {
    id: 'first_shield',
    title: 'First Shield',
    description: 'Shield your first token into the privacy pool.',
    condition: 'Complete 1 shield operation',
    nftBadge: true,
  },
  {
    id: 'privacy_pioneer',
    title: 'Privacy Pioneer',
    description: 'Complete 100 private transactions.',
    condition: 'Total private txs >= 100',
    nftBadge: true,
  },
  {
    id: 'chain_hopper',
    title: 'Chain Hopper',
    description: 'Use 3 or more different blockchain networks.',
    condition: 'Unique chains used >= 3',
    nftBadge: true,
  },
  {
    id: 'diamond_hands',
    title: 'Diamond Hands',
    description: 'Hold a shielded balance for 90+ consecutive days.',
    condition: 'Continuous shielded balance >= 90 days',
    nftBadge: true,
  },
  {
    id: 'community_hero',
    title: 'Community Hero',
    description: 'Refer 10 new users to HERO Wallet.',
    condition: 'Referral count >= 10',
    nftBadge: true,
  },
  {
    id: 'governance_warrior',
    title: 'Governance Warrior',
    description: 'Vote on 10 DAO governance proposals.',
    condition: 'DAO votes cast >= 10',
    nftBadge: true,
  },
]);

// ============================================================
// RANK ENGINE
// ============================================================

/**
 * Validate a wallet address format (basic hex check).
 */
function validateWalletAddress(address: string): void {
  if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
    throw new Error(`Invalid wallet address format: ${address}`);
  }
}

/**
 * Validate XP value is non-negative.
 */
function validateXP(xp: number): void {
  if (xp < 0 || !Number.isFinite(xp)) {
    throw new Error(`Invalid XP value: ${xp}. Must be a non-negative finite number.`);
  }
}

export class HeroRankEngine {
  /**
   * Determine the rank for a given XP total.
   * Returns the highest rank the user qualifies for.
   */
  getRankForXP(totalXP: number): HeroRank {
    validateXP(totalXP);

    let currentRank = HERO_RANKS[0];
    for (const rank of HERO_RANKS) {
      if (totalXP >= rank.xpRequired) {
        currentRank = rank;
      } else {
        break;
      }
    }
    return currentRank;
  }

  /**
   * Calculate XP needed to reach the next rank.
   * Returns 0 if already at max rank.
   */
  xpToNextRank(totalXP: number): number {
    validateXP(totalXP);

    const currentRank = this.getRankForXP(totalXP);
    const currentIndex = HERO_RANKS.findIndex(r => r.id === currentRank.id);

    if (currentIndex >= HERO_RANKS.length - 1) {
      return 0; // Already at max rank
    }

    const nextRank = HERO_RANKS[currentIndex + 1];
    return nextRank.xpRequired - totalXP;
  }

  /**
   * Get the next rank after the current one.
   * Returns null if already at max rank.
   */
  getNextRank(totalXP: number): HeroRank | null {
    validateXP(totalXP);

    const currentRank = this.getRankForXP(totalXP);
    const currentIndex = HERO_RANKS.findIndex(r => r.id === currentRank.id);

    if (currentIndex >= HERO_RANKS.length - 1) {
      return null;
    }

    return HERO_RANKS[currentIndex + 1];
  }

  /**
   * Calculate XP earned for a specific activity.
   */
  getXPForActivity(activity: XPActivity): number {
    const reward = XP_REWARDS[activity];
    if (!reward) {
      throw new Error(`Unknown XP activity: ${activity}`);
    }
    return reward.xp;
  }

  /**
   * Create a new user profile with default values.
   */
  createProfile(walletAddress: string): UserProfile {
    validateWalletAddress(walletAddress);

    return {
      walletAddress,
      totalXP: 0,
      currentRank: HERO_RANKS[0],
      xpHistory: [],
      achievements: [],
      referralCount: 0,
      loginStreak: 0,
      lastLoginDate: '',
    };
  }

  /**
   * Award XP to a user profile and return the updated profile.
   * Checks for rank-up events.
   */
  awardXP(profile: UserProfile, activity: XPActivity, metadata?: Record<string, string>): {
    updatedProfile: UserProfile;
    rankedUp: boolean;
    newRank: HeroRank | null;
  } {
    const xpEarned = this.getXPForActivity(activity);
    const previousRank = this.getRankForXP(profile.totalXP);

    const event: XPEvent = {
      activity,
      xpEarned,
      timestamp: Date.now(),
      metadata,
    };

    const newTotalXP = profile.totalXP + xpEarned;
    const newRank = this.getRankForXP(newTotalXP);
    const rankedUp = newRank.id !== previousRank.id;

    const updatedProfile: UserProfile = {
      ...profile,
      totalXP: newTotalXP,
      currentRank: newRank,
      xpHistory: [...profile.xpHistory, event],
    };

    return {
      updatedProfile,
      rankedUp,
      newRank: rankedUp ? newRank : null,
    };
  }
}
