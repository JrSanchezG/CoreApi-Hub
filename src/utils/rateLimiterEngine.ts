import type { RateLimitTier, RateLimitStatus } from '../types';

export const TIER_CONFIG: Record<RateLimitTier, { limitPerMinute: number; capacity: number; refillRatePerSec: number }> = {
  free: { limitPerMinute: 30, capacity: 30, refillRatePerSec: 0.5 },
  developer: { limitPerMinute: 120, capacity: 120, refillRatePerSec: 2.0 },
  enterprise: { limitPerMinute: 1000, capacity: 1000, refillRatePerSec: 16.6 },
};

export class TokenBucketRateLimiter {
  private tier: RateLimitTier;
  private capacity: number;
  private tokens: number;
  private refillRatePerSec: number;
  private lastRefill: number;
  private totalAllowed: number = 0;
  private totalThrottled: number = 0;

  constructor(tier: RateLimitTier = 'developer') {
    this.tier = tier;
    const config = TIER_CONFIG[tier];
    this.capacity = config.capacity;
    this.tokens = config.capacity;
    this.refillRatePerSec = config.refillRatePerSec;
    this.lastRefill = Date.now();
  }

  public setTier(tier: RateLimitTier) {
    this.tier = tier;
    const config = TIER_CONFIG[tier];
    this.capacity = config.capacity;
    this.tokens = Math.min(this.tokens, config.capacity);
    this.refillRatePerSec = config.refillRatePerSec;
  }

  private refill() {
    const now = Date.now();
    const elapsedSeconds = (now - this.lastRefill) / 1000;
    if (elapsedSeconds > 0) {
      const addedTokens = elapsedSeconds * this.refillRatePerSec;
      this.tokens = Math.min(this.capacity, this.tokens + addedTokens);
      this.lastRefill = now;
    }
  }

  public consume(cost: number = 1): { allowed: boolean; remaining: number; retryAfterSeconds: number; headers: Record<string, string> } {
    this.refill();

    if (this.tokens >= cost) {
      this.tokens -= cost;
      this.totalAllowed += 1;
      const remaining = Math.floor(this.tokens);
      return {
        allowed: true,
        remaining,
        retryAfterSeconds: 0,
        headers: {
          'X-RateLimit-Limit': String(TIER_CONFIG[this.tier].limitPerMinute),
          'X-RateLimit-Remaining': String(remaining),
          'X-RateLimit-Reset': String(Math.ceil((this.capacity - this.tokens) / this.refillRatePerSec)),
        }
      };
    } else {
      this.totalThrottled += 1;
      const needed = cost - this.tokens;
      const retryAfterSeconds = Math.max(1, Math.ceil(needed / this.refillRatePerSec));
      return {
        allowed: false,
        remaining: 0,
        retryAfterSeconds,
        headers: {
          'X-RateLimit-Limit': String(TIER_CONFIG[this.tier].limitPerMinute),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(retryAfterSeconds),
          'Retry-After': String(retryAfterSeconds),
        }
      };
    }
  }

  public getStatus(): RateLimitStatus {
    this.refill();
    return {
      tier: this.tier,
      limitPerMinute: TIER_CONFIG[this.tier].limitPerMinute,
      tokensRemaining: Math.floor(this.tokens),
      totalAllowed: this.totalAllowed,
      totalThrottled: this.totalThrottled,
      lastRefillTime: this.lastRefill,
    };
  }

  public resetTokens() {
    this.tokens = this.capacity;
    this.lastRefill = Date.now();
  }
}
