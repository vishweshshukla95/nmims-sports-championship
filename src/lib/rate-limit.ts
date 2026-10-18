interface RateLimitRecord {
  count: number;
  resetAt: number;
}

// In-memory token bucket / sliding counter
const ipRequestMap = new Map<string, RateLimitRecord>();

// Clean up expired entries every 60 seconds to prevent memory leaks
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of ipRequestMap.entries()) {
      if (now > record.resetAt) {
        ipRequestMap.delete(key);
      }
    }
  }, 60000);
}

export function checkRateLimit(
  identifier: string,
  limit = 20,
  windowMs = 60000
): { allowed: boolean; remaining: number; reset: number } {
  const now = Date.now();
  const existing = ipRequestMap.get(identifier);

  if (!existing || now > existing.resetAt) {
    ipRequestMap.set(identifier, {
      count: 1,
      resetAt: now + windowMs,
    });
    return {
      allowed: true,
      remaining: limit - 1,
      reset: now + windowMs,
    };
  }

  if (existing.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      reset: existing.resetAt,
    };
  }

  existing.count += 1;
  return {
    allowed: true,
    remaining: limit - existing.count,
    reset: existing.resetAt,
  };
}
