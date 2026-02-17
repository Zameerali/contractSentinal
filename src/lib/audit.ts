import prisma from "./prisma";
import { Prisma } from "@prisma/client";

export async function createAuditLog({
  userId,
  action,
  ipAddress,
  details,
}: {
  userId?: string | null;
  action: string;
  ipAddress?: string | null;
  details?: Prisma.InputJsonValue | null;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: userId || null,
        action,
        ipAddress: ipAddress || null,
        details: details ?? undefined,
      },
    });
  } catch (error) {
    console.error("Failed to create audit log:", error);
  }
}

export function getClientIP(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIP = request.headers.get("x-real-ip");
  if (forwarded) return forwarded.split(",")[0].trim();
  if (realIP) return realIP;
  return "127.0.0.1";
}
