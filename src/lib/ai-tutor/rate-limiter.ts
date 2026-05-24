interface RateLimitEntry {
  timestamps: number[];
  totalTokens: number;
  totalCost: number;
}

const store = new Map<string, RateLimitEntry>();

export const RATE_LIMIT_CONFIG = {
  windowMs: 60 * 1000,
  maxRequests: 3,
  dailyMaxRequests: 20,
  maxTokensPerRequest: 500,
};

const COST_INPUT_PER_M = 0.4;
const COST_OUTPUT_PER_M = 1.6;

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function fullKey(identifier: string): string {
  return `${identifier}:${todayKey()}`;
}

function getEntry(identifier: string): RateLimitEntry {
  const key = fullKey(identifier);
  const existing = store.get(key);
  if (existing) return existing;

  const fresh: RateLimitEntry = { timestamps: [], totalTokens: 0, totalCost: 0 };
  store.set(key, fresh);
  return fresh;
}

export function estimateTokens(text: string): number {
  if (!text) return 0;
  const chineseChars = (text.match(/[\u4e00-\u9fff\u3400-\u4dbf]/g) || []).length;
  const nonChinese = text.length - chineseChars;
  const wordCount = nonChinese > 0 ? text.replace(/[\u4e00-\u9fff\u3400-\u4dbf]/g, '').trim().split(/\s+/).length : 0;
  return Math.ceil(chineseChars * 1.5 + wordCount * 1.3);
}

export function checkRateLimit(identifier: string): {
  allowed: boolean;
  reason?: string;
  retryAfter?: number;
} {
  const entry = getEntry(identifier);
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_CONFIG.windowMs;
  entry.timestamps = entry.timestamps.filter((ts) => ts > windowStart);

  if (entry.timestamps.length >= RATE_LIMIT_CONFIG.maxRequests) {
    const oldestInWindow = entry.timestamps[0];
    const retryAfter = Math.ceil((oldestInWindow + RATE_LIMIT_CONFIG.windowMs - now) / 1000);
    return {
      allowed: false,
      reason: 'minute_limit',
      retryAfter: Math.max(retryAfter, 1),
    };
  }

  if (entry.timestamps.length >= RATE_LIMIT_CONFIG.dailyMaxRequests) {
    return {
      allowed: false,
      reason: 'daily_limit',
    };
  }

  return { allowed: true };
}

export function recordRequest(identifier: string, tokenEstimate?: number): void {
  const entry = getEntry(identifier);
  const now = Date.now();

  entry.timestamps.push(now);

  if (tokenEstimate && tokenEstimate > 0) {
    entry.totalTokens += tokenEstimate;
    const inputTokens = tokenEstimate * 0.5;
    const outputTokens = tokenEstimate * 0.5;
    entry.totalCost += (inputTokens / 1_000_000) * COST_INPUT_PER_M +
                       (outputTokens / 1_000_000) * COST_OUTPUT_PER_M;
  }
}

export function getUsageStats(identifier: string): {
  requestsToday: number;
  tokensToday: number;
  costToday: number;
} {
  const entry = getEntry(identifier);
  return {
    requestsToday: entry.timestamps.length,
    tokensToday: entry.totalTokens,
    costToday: Math.round(entry.totalCost * 10_000) / 10_000,
  };
}

export function cleanupExpiredEntries(): void {
  const today = todayKey();
  const keys = Array.from(store.keys());
  for (const key of keys) {
    if (!key.endsWith(today)) {
      store.delete(key);
    }
  }
}

if (typeof process !== 'undefined' && process.env.NODE_ENV !== 'test') {
  setInterval(cleanupExpiredEntries, 10 * 60 * 1000);
}
