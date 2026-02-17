import prisma from "./prisma";

const WINDOW_HOURS = parseInt(process.env.RATE_LIMIT_WINDOW_HOURS || "1");
const USER_LIMIT = parseInt(process.env.SCAN_RATE_LIMIT_PER_USER || "10");
const IP_LIMIT = parseInt(process.env.SCAN_RATE_LIMIT_PER_IP || "50");

export async function checkRateLimit(key: string, isUser = true) {
  const limit = isUser ? USER_LIMIT : IP_LIMIT;
  const windowMs = WINDOW_HOURS * 60 * 60 * 1000;
  const now = new Date();

  try {
    const existing = await prisma.rateLimit.findUnique({ where: { key } });

    if (!existing) {
      await prisma.rateLimit.create({
        data: { key, count: 1, windowStart: now },
      });
      return {
        allowed: true,
        remaining: limit - 1,
        resetAt: new Date(now.getTime() + windowMs),
      };
    }

    const windowAge = now.getTime() - existing.windowStart.getTime();
    if (windowAge > windowMs) {
      await prisma.rateLimit.update({
        where: { key },
        data: { count: 1, windowStart: now },
      });
      return {
        allowed: true,
        remaining: limit - 1,
        resetAt: new Date(now.getTime() + windowMs),
      };
    }

    if (existing.count >= limit) {
      return {
        allowed: false,
        remaining: 0,
        resetAt: new Date(existing.windowStart.getTime() + windowMs),
      };
    }

    await prisma.rateLimit.update({
      where: { key },
      data: { count: existing.count + 1 },
    });
    return {
      allowed: true,
      remaining: limit - existing.count - 1,
      resetAt: new Date(existing.windowStart.getTime() + windowMs),
    };
  } catch (error) {
    console.error("Rate limit check failed:", error);
    return {
      allowed: true,
      remaining: limit,
      resetAt: new Date(now.getTime() + windowMs),
    };
  }
}
