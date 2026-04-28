/**
 * HERO Wallet — Security Watchdog & Failsafe System
 * 
 * Three monitoring loops:
 * 1. Code Security (daily) — CVE scanning, dependency audit
 * 2. Runtime Health (60s) — service health, RPC availability
 * 3. Transaction Anomaly (per-tx) — pattern detection, circuit breaker
 * 
 * Self-healing with escalation: auto-fix → retry 3x → Telegram alert → Manus API
 * 
 * @module hero/security
 * @version 0.2.0
 * @security CODEX-AUDIT-REQUIRED
 */

// ============================================================
// TYPES
// ============================================================

export enum HealthStatus {
  HEALTHY = 'HEALTHY',
  DEGRADED = 'DEGRADED',
  DOWN = 'DOWN',
  UNKNOWN = 'UNKNOWN',
}

export enum WatchdogLoop {
  CODE_SECURITY = 'CODE_SECURITY',
  RUNTIME_HEALTH = 'RUNTIME_HEALTH',
  TRANSACTION_ANOMALY = 'TRANSACTION_ANOMALY',
}

export interface ServiceHealth {
  name: string;
  status: HealthStatus;
  lastCheck: number;
  responseTimeMs: number;
  errorMessage?: string;
  consecutiveFailures: number;
}

export interface WatchdogConfig {
  /** Health check interval in milliseconds (default: 60000 = 60s) */
  healthCheckIntervalMs: number;
  /** Code security scan interval in milliseconds (default: 86400000 = 24h) */
  codeSecurityIntervalMs: number;
  /** Max consecutive failures before escalation */
  maxConsecutiveFailures: number;
  /** RPC endpoints to monitor */
  rpcEndpoints: string[];
  /** Services to monitor */
  services: string[];
  /** Circuit breaker: max transactions per minute before halt */
  circuitBreakerTxPerMinute: number;
  /** Circuit breaker: max single transaction value in USD */
  circuitBreakerMaxTxUsd: number;
}

export interface AnomalyReport {
  type: 'rapid_drain' | 'unusual_volume' | 'malicious_contract' | 'repeated_failure';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  timestamp: number;
  metadata: Record<string, string>;
  actionTaken: string;
}

// ============================================================
// CONSTANTS
// ============================================================

export const DEFAULT_WATCHDOG_CONFIG: WatchdogConfig = {
  healthCheckIntervalMs: 60_000,        // 60 seconds
  codeSecurityIntervalMs: 86_400_000,   // 24 hours
  maxConsecutiveFailures: 3,
  rpcEndpoints: [
    'https://rpc.pulsechain.com',
    'https://mainnet.base.org',
    'https://eth.llamarpc.com',
  ],
  services: [
    'wallet-backend',
    'relayer',
    'rewards-engine',
    'grok-proxy',
  ],
  circuitBreakerTxPerMinute: 50,
  circuitBreakerMaxTxUsd: 100_000,
};

// ============================================================
// VALIDATION
// ============================================================

function validateConfig(config: WatchdogConfig): void {
  if (config.healthCheckIntervalMs < 10_000) {
    throw new Error('Health check interval must be at least 10 seconds.');
  }
  if (config.maxConsecutiveFailures < 1 || config.maxConsecutiveFailures > 10) {
    throw new Error('Max consecutive failures must be between 1 and 10.');
  }
  if (config.circuitBreakerTxPerMinute < 1) {
    throw new Error('Circuit breaker tx/min must be at least 1.');
  }
  if (config.circuitBreakerMaxTxUsd < 100) {
    throw new Error('Circuit breaker max tx USD must be at least $100.');
  }
  for (const url of config.rpcEndpoints) {
    try {
      new URL(url);
    } catch {
      throw new Error(`Invalid RPC endpoint URL: ${url}`);
    }
  }
}

// ============================================================
// WATCHDOG ENGINE
// ============================================================

export class HeroWatchdog {
  private config: WatchdogConfig;
  private serviceHealth: Map<string, ServiceHealth> = new Map();
  private circuitBreakerActive: boolean = false;
  private recentTransactions: number[] = []; // timestamps
  private anomalyLog: AnomalyReport[] = [];
  private running: boolean = false;
  private transactionLock: boolean = false; // Mutex guard for recordTransaction

  constructor(config: WatchdogConfig = DEFAULT_WATCHDOG_CONFIG) {
    validateConfig(config);
    this.config = { ...config };

    // Initialize service health entries
    for (const service of this.config.services) {
      this.serviceHealth.set(service, {
        name: service,
        status: HealthStatus.UNKNOWN,
        lastCheck: 0,
        responseTimeMs: 0,
        consecutiveFailures: 0,
      });
    }
  }

  /**
   * Start the watchdog monitoring loops.
   * 
   * ⚠️ SCAFFOLD: Interval-based monitoring is placeholder.
   * Production uses PM2 cron jobs on the dedicated wallet server.
   */
  start(): void {
    if (this.running) {
      throw new Error('Watchdog is already running.');
    }
    this.running = true;
    console.log('[HERO-WATCHDOG] Started monitoring loops.');
    // TODO: Start actual monitoring intervals
    // setInterval(() => this.runHealthCheck(), this.config.healthCheckIntervalMs);
    // setInterval(() => this.runCodeSecurityScan(), this.config.codeSecurityIntervalMs);
  }

  /**
   * Stop the watchdog.
   */
  stop(): void {
    this.running = false;
    console.log('[HERO-WATCHDOG] Stopped monitoring loops.');
  }

  /**
   * Check if the watchdog is running.
   */
  isRunning(): boolean {
    return this.running;
  }

  /**
   * Run a health check on all monitored services.
   * 
   * ⚠️ SCAFFOLD: Returns mock healthy status.
   */
  async runHealthCheck(): Promise<Map<string, ServiceHealth>> {
    for (const [name, health] of this.serviceHealth) {
      // TODO: Actual health check (HTTP ping, process check, etc.)
      const updatedHealth: ServiceHealth = {
        ...health,
        status: HealthStatus.HEALTHY, // Scaffold placeholder
        lastCheck: Date.now(),
        responseTimeMs: 0,
        consecutiveFailures: 0,
      };
      this.serviceHealth.set(name, updatedHealth);
    }
    return new Map(this.serviceHealth);
  }

  /**
   * Check RPC endpoint availability.
   * Returns a map of endpoint URL → response time (or -1 if down).
   * 
   * ⚠️ SCAFFOLD: Returns mock availability.
   */
  async checkRpcEndpoints(): Promise<Map<string, number>> {
    const results = new Map<string, number>();
    for (const endpoint of this.config.rpcEndpoints) {
      // TODO: Actual RPC health check (eth_blockNumber call)
      results.set(endpoint, 50); // Mock 50ms response time
    }
    return results;
  }

  /**
   * Record a transaction for anomaly detection.
   * Checks circuit breaker conditions.
   */
  recordTransaction(txValueUsd: number): {
    allowed: boolean;
    reason?: string;
    anomaly?: AnomalyReport;
  } {
    // Concurrency guard — serialize access to shared state
    if (this.transactionLock) {
      return { allowed: false, reason: 'Transaction recording in progress. Please retry.' };
    }
    this.transactionLock = true;

    try {
      return this._recordTransactionInner(txValueUsd);
    } finally {
      this.transactionLock = false;
    }
  }

  private _recordTransactionInner(txValueUsd: number): {
    allowed: boolean;
    reason?: string;
    anomaly?: AnomalyReport;
  } {
    if (txValueUsd < 0 || !Number.isFinite(txValueUsd)) {
      throw new Error('Transaction value must be a non-negative finite number.');
    }

    // Check if circuit breaker is active
    if (this.circuitBreakerActive) {
      return {
        allowed: false,
        reason: 'Circuit breaker is active. All transactions halted pending manual review.',
      };
    }

    // Check single transaction value limit
    if (txValueUsd > this.config.circuitBreakerMaxTxUsd) {
      const anomaly: AnomalyReport = {
        type: 'rapid_drain',
        severity: 'critical',
        description: `Transaction value $${txValueUsd} exceeds circuit breaker limit of $${this.config.circuitBreakerMaxTxUsd}.`,
        timestamp: Date.now(),
        metadata: { txValueUsd: txValueUsd.toString() },
        actionTaken: 'Circuit breaker activated. Transaction blocked.',
      };
      this.anomalyLog.push(anomaly);
      this.circuitBreakerActive = true;
      return { allowed: false, reason: anomaly.description, anomaly };
    }

    // Check transaction rate (tx per minute)
    const now = Date.now();
    const oneMinuteAgo = now - 60_000;
    this.recentTransactions = this.recentTransactions.filter(t => t > oneMinuteAgo);
    this.recentTransactions.push(now);

    if (this.recentTransactions.length > this.config.circuitBreakerTxPerMinute) {
      const anomaly: AnomalyReport = {
        type: 'unusual_volume',
        severity: 'high',
        description: `Transaction rate ${this.recentTransactions.length}/min exceeds limit of ${this.config.circuitBreakerTxPerMinute}/min.`,
        timestamp: now,
        metadata: { txCount: this.recentTransactions.length.toString() },
        actionTaken: 'Circuit breaker activated. Transactions paused.',
      };
      this.anomalyLog.push(anomaly);
      this.circuitBreakerActive = true;
      return { allowed: false, reason: anomaly.description, anomaly };
    }

    return { allowed: true };
  }

  /**
   * Manually reset the circuit breaker (admin action).
   */
  resetCircuitBreaker(): void {
    this.circuitBreakerActive = false;
    this.recentTransactions = [];
    console.log('[HERO-WATCHDOG] Circuit breaker reset by admin.');
  }

  /**
   * Get the circuit breaker status.
   */
  isCircuitBreakerActive(): boolean {
    return this.circuitBreakerActive;
  }

  /**
   * Get all recorded anomalies.
   */
  getAnomalyLog(): readonly AnomalyReport[] {
    return [...this.anomalyLog];
  }

  /**
   * Get current health status of all services.
   */
  getServiceHealth(): Map<string, ServiceHealth> {
    return new Map(this.serviceHealth);
  }

  /**
   * Attempt self-healing for a failed service.
   * Returns true if healing was successful.
   * 
   * ⚠️ SCAFFOLD: Logs action, does not perform actual restart.
   */
  async attemptSelfHeal(serviceName: string): Promise<boolean> {
    const health = this.serviceHealth.get(serviceName);
    if (!health) {
      throw new Error(`Unknown service: ${serviceName}`);
    }

    console.log(`[HERO-WATCHDOG] Attempting self-heal for ${serviceName}...`);

    // TODO: Actual self-healing logic
    // 1. Try service restart
    // 2. If RPC failure, switch to backup endpoint
    // 3. If persistent, escalate

    // Scaffold: simulate success
    const updatedHealth: ServiceHealth = {
      ...health,
      status: HealthStatus.HEALTHY,
      consecutiveFailures: 0,
      lastCheck: Date.now(),
    };
    this.serviceHealth.set(serviceName, updatedHealth);

    return true;
  }
}
