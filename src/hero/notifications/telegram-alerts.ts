/**
 * HERO Wallet — Telegram Notification System
 * 
 * Sends real-time alerts to users and admins via Telegram Bot API.
 * Covers transaction alerts, security warnings, reward notifications,
 * rank-up events, and daily portfolio digests.
 * 
 * @module hero/notifications
 * @version 0.2.0
 * @security CODEX-AUDIT-REQUIRED
 */

// ============================================================
// TYPES
// ============================================================

export enum AlertPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum AlertType {
  LARGE_TRANSACTION = 'LARGE_TRANSACTION',
  FAILED_TRANSACTION = 'FAILED_TRANSACTION',
  REWARD_EARNED = 'REWARD_EARNED',
  RANK_UP = 'RANK_UP',
  SECURITY_ALERT = 'SECURITY_ALERT',
  DAILY_DIGEST = 'DAILY_DIGEST',
  SYSTEM_HEALTH = 'SYSTEM_HEALTH',
  SELF_HEAL = 'SELF_HEAL',
}

export interface TelegramConfig {
  /** Telegram Bot API token — stored in env, NEVER hardcoded */
  botToken: string;
  /** Admin chat ID for system alerts */
  adminChatId: string;
  /** User chat IDs mapped by wallet address */
  userChatIds: Map<string, string>;
  /** Large transaction threshold in USD */
  largeTransactionThreshold: number;
}

export interface AlertPayload {
  type: AlertType;
  priority: AlertPriority;
  title: string;
  message: string;
  timestamp: number;
  metadata?: Record<string, string>;
}

// ============================================================
// CONSTANTS
// ============================================================

const TELEGRAM_API_BASE = 'https://api.telegram.org/bot';

/**
 * Priority-to-emoji mapping for visual alert differentiation.
 */
const PRIORITY_EMOJI: Record<AlertPriority, string> = {
  [AlertPriority.LOW]: '📋',
  [AlertPriority.MEDIUM]: '⚠️',
  [AlertPriority.HIGH]: '🔴',
  [AlertPriority.CRITICAL]: '🚨',
};

/**
 * Escape Telegram Markdown special characters to prevent injection.
 * Covers all MarkdownV2 reserved characters.
 */
function escapeTelegramMarkdown(text: string): string {
  return text.replace(/([_*\[\]()~`>#+\-=|{}.!\\])/g, '\\$1');
}

/**
 * Alert type configurations with default priorities.
 */
const ALERT_DEFAULTS: Record<AlertType, { priority: AlertPriority; sendToAdmin: boolean }> = {
  [AlertType.LARGE_TRANSACTION]: { priority: AlertPriority.HIGH, sendToAdmin: true },
  [AlertType.FAILED_TRANSACTION]: { priority: AlertPriority.CRITICAL, sendToAdmin: true },
  [AlertType.REWARD_EARNED]: { priority: AlertPriority.LOW, sendToAdmin: false },
  [AlertType.RANK_UP]: { priority: AlertPriority.MEDIUM, sendToAdmin: false },
  [AlertType.SECURITY_ALERT]: { priority: AlertPriority.CRITICAL, sendToAdmin: true },
  [AlertType.DAILY_DIGEST]: { priority: AlertPriority.LOW, sendToAdmin: false },
  [AlertType.SYSTEM_HEALTH]: { priority: AlertPriority.HIGH, sendToAdmin: true },
  [AlertType.SELF_HEAL]: { priority: AlertPriority.MEDIUM, sendToAdmin: true },
};

// ============================================================
// VALIDATION
// ============================================================

function validateBotToken(token: string): void {
  // Telegram bot tokens follow the pattern: <bot_id>:<hash>
  if (!/^\d+:[A-Za-z0-9_-]{35,}$/.test(token)) {
    throw new Error('Invalid Telegram bot token format.');
  }
}

function validateChatId(chatId: string): void {
  if (!/^-?\d+$/.test(chatId)) {
    throw new Error(`Invalid Telegram chat ID: ${chatId}`);
  }
}

// ============================================================
// TELEGRAM ALERT ENGINE
// ============================================================

export class HeroTelegramAlerts {
  private config: TelegramConfig;
  private initialized: boolean = false;

  constructor(config: TelegramConfig) {
    validateBotToken(config.botToken);
    validateChatId(config.adminChatId);
    this.config = { ...config };
  }

  /**
   * Initialize the Telegram bot connection.
   * Verifies the bot token is valid by calling getMe.
   * 
   * ⚠️ SCAFFOLD: Actual API call commented out until bot is configured.
   */
  async initialize(): Promise<boolean> {
    // TODO: Verify bot token
    // const response = await fetch(`${TELEGRAM_API_BASE}${this.config.botToken}/getMe`);
    // const data = await response.json();
    // this.initialized = data.ok;

    this.initialized = true; // Scaffold placeholder
    return this.initialized;
  }

  /**
   * Format an alert payload into a Telegram message.
   */
  private formatMessage(alert: AlertPayload): string {
    const emoji = PRIORITY_EMOJI[alert.priority];
    const timestamp = new Date(alert.timestamp).toISOString();

    // Escape all user-supplied strings to prevent Markdown injection
    const safeTitle = escapeTelegramMarkdown(alert.title);
    const safeMessage = escapeTelegramMarkdown(alert.message);

    let message = `${emoji} *HERO Wallet Alert*\n`;
    message += `━━━━━━━━━━━━━━━━━━━━\n`;
    message += `*${safeTitle}*\n\n`;
    message += `${safeMessage}\n\n`;

    if (alert.metadata) {
      for (const [key, value] of Object.entries(alert.metadata)) {
        const safeKey = escapeTelegramMarkdown(key);
        const safeValue = escapeTelegramMarkdown(value);
        message += `• *${safeKey}:* ${safeValue}\n`;
      }
      message += '\n';
    }

    message += `🕐 ${timestamp}\n`;
    message += `Priority: ${alert.priority}`;

    return message;
  }

  /**
   * Send a message to a specific Telegram chat.
   * 
   * ⚠️ SCAFFOLD: Logs to console until bot is configured.
   */
  private async sendMessage(chatId: string, text: string): Promise<boolean> {
    validateChatId(chatId);

    // TODO: Send via Telegram API
    // const url = `${TELEGRAM_API_BASE}${this.config.botToken}/sendMessage`;
    // const response = await fetch(url, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     chat_id: chatId,
    //     text,
    //     parse_mode: 'Markdown',
    //     disable_web_page_preview: true,
    //   }),
    // });
    // return response.ok;

    console.log(`[HERO-TELEGRAM] → Chat ${chatId}:\n${text}`);
    return true; // Scaffold placeholder
  }

  /**
   * Send an alert to the appropriate recipients.
   */
  async sendAlert(alert: AlertPayload, userWalletAddress?: string): Promise<boolean> {
    if (!this.initialized) {
      throw new Error('Telegram alerts not initialized. Call initialize() first.');
    }

    const formattedMessage = this.formatMessage(alert);
    const defaults = ALERT_DEFAULTS[alert.type];
    let success = true;

    // Send to admin if required
    if (defaults.sendToAdmin) {
      const adminResult = await this.sendMessage(this.config.adminChatId, formattedMessage);
      success = success && adminResult;
    }

    // Send to user if wallet address is provided and mapped
    if (userWalletAddress) {
      const userChatId = this.config.userChatIds.get(userWalletAddress);
      if (userChatId) {
        const userResult = await this.sendMessage(userChatId, formattedMessage);
        success = success && userResult;
      }
    }

    return success;
  }

  /**
   * Send a large transaction alert.
   */
  async alertLargeTransaction(
    walletAddress: string,
    amount: string,
    token: string,
    txHash: string,
  ): Promise<boolean> {
    return this.sendAlert(
      {
        type: AlertType.LARGE_TRANSACTION,
        priority: AlertPriority.HIGH,
        title: 'Large Transaction Detected',
        message: `A transaction exceeding the $${this.config.largeTransactionThreshold} threshold was detected.`,
        timestamp: Date.now(),
        metadata: {
          'Amount': `${amount} ${token}`,
          'Wallet': `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`,
          'TX Hash': txHash,
        },
      },
      walletAddress,
    );
  }

  /**
   * Send a security alert.
   */
  async alertSecurity(
    title: string,
    description: string,
    severity: AlertPriority = AlertPriority.CRITICAL,
  ): Promise<boolean> {
    return this.sendAlert({
      type: AlertType.SECURITY_ALERT,
      priority: severity,
      title: `Security: ${title}`,
      message: description,
      timestamp: Date.now(),
    });
  }

  /**
   * Send a rank-up notification.
   */
  async alertRankUp(
    walletAddress: string,
    newRank: string,
    newMultiplier: number,
  ): Promise<boolean> {
    return this.sendAlert(
      {
        type: AlertType.RANK_UP,
        priority: AlertPriority.MEDIUM,
        title: 'Rank Up! 🎖️',
        message: `Congratulations! You've been promoted to ${newRank}.`,
        timestamp: Date.now(),
        metadata: {
          'New Rank': newRank,
          'Reward Multiplier': `${newMultiplier}x`,
        },
      },
      walletAddress,
    );
  }

  /**
   * Send a self-heal notification.
   */
  async alertSelfHeal(
    service: string,
    action: string,
    success: boolean,
  ): Promise<boolean> {
    return this.sendAlert({
      type: AlertType.SELF_HEAL,
      priority: success ? AlertPriority.MEDIUM : AlertPriority.CRITICAL,
      title: success ? 'Self-Heal Successful' : 'Self-Heal FAILED',
      message: `Service "${service}" triggered self-healing: ${action}`,
      timestamp: Date.now(),
      metadata: {
        'Service': service,
        'Action': action,
        'Result': success ? 'Recovered' : 'FAILED — Manual intervention required',
      },
    });
  }

  /**
   * Register a user's Telegram chat ID for notifications.
   */
  registerUser(walletAddress: string, chatId: string): void {
    if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
      throw new Error(`Invalid wallet address: ${walletAddress}`);
    }
    validateChatId(chatId);
    this.config.userChatIds.set(walletAddress, chatId);
  }
}
