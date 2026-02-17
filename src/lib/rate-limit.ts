import prisma from "./prisma";

const WINDOW_HOURS = parseInt(process.env.RATE_LIMIT_WINDOW_HOURS || "1");
const USER_LIMIT = parseInt(process.env.SCAN_RATE_LIMIT_PER_USER || "10");
const IP_LIMIT = parseInt(process.env.SCAN_RATE_LIMIT_PER_IP || "50");
const AUTH_LIMIT = parseInt(process.env.AUTH_RATE_LIMIT || "5");

export async function checkRateLimit(
  key: string,
  isUser = true,
  customLimit?: number,
) {
  const limit = customLimit ?? (isUser ? USER_LIMIT : IP_LIMIT);
  const windowMs = WINDOW_HOURS * 60 * 60 * 1000;
  const now = new Date();

  try {
    // Use upsert for atomicity — eliminates the read-then-write race condition
    const record = await prisma.rateLimit.upsert({
      where: { key },
      create: { key, count: 1, windowStart: now },
      update: {
        // Reset window if expired, otherwise increment
        count: {
          increment: 1,
        },
      },
    });

    // If the window has expired, reset it atomically
    const windowAge = now.getTime() - record.windowStart.getTime();
    if (windowAge > windowMs) {
      const reset = await prisma.rateLimit.update({
        where: { key },
        data: { count: 1, windowStart: now },
      });
      return {
        allowed: true,
        remaining: limit - 1,
        resetAt: new Date(now.getTime() + windowMs),
      };
    }

    if (record.count > limit) {
      return {
        allowed: false,
        remaining: 0,
        resetAt: new Date(record.windowStart.getTime() + windowMs),
      };
    }

    return {
      allowed: true,
      remaining: limit - record.count,
      resetAt: new Date(record.windowStart.getTime() + windowMs),
    };
  } catch (error) {
    console.error("Rate limit check failed:", error);
    // FAIL CLOSED — deny request if rate-limit system is broken
    return {
      allowed: false,
      remaining: 0,
      resetAt: new Date(now.getTime() + windowMs),
    };
  }
}

/** Convenience wrapper for auth-related endpoints (login, register, etc.) */
export async function checkAuthRateLimit(ip: string) {
  return checkRateLimit(`auth:${ip}`, false, AUTH_LIMIT);
}
