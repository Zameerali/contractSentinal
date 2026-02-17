import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  getRefreshTokenFromCookie,
  hashToken,
  clearRefreshTokenCookie,
  getAuthUser,
} from "@/lib/auth";
import { createAuditLog, getClientIP } from "@/lib/audit";

export async function POST(request: Request) {
  try {
    const ip = getClientIP(request);
    const refreshToken = await getRefreshTokenFromCookie();

    if (refreshToken) {
      const tokenHash = await hashToken(refreshToken);
      await prisma.refreshToken.updateMany({
        where: { tokenHash },
        data: { revoked: true },
      });
    }

    const user = await getAuthUser(request);
    if (user) {
      await createAuditLog({
        userId: user.userId as string,
        action: "LOGOUT",
        ipAddress: ip,
      });
    }

    await clearRefreshTokenCookie();
    return NextResponse.json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    await clearRefreshTokenCookie();
    return NextResponse.json({ message: "Logged out" });
  }
}
