import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  verifyRefreshToken,
  createAccessToken,
  createRefreshToken,
  hashToken,
  getRefreshTokenFromCookie,
  setRefreshTokenCookie,
} from "@/lib/auth";

export async function POST() {
  try {
    const oldRefreshToken = await getRefreshTokenFromCookie();
    if (!oldRefreshToken) {
      return NextResponse.json({ error: "No refresh token" }, { status: 401 });
    }

    const payload = await verifyRefreshToken(oldRefreshToken);
    if (!payload) {
      return NextResponse.json(
        { error: "Invalid refresh token" },
        { status: 401 },
      );
    }

    const oldTokenHash = await hashToken(oldRefreshToken);
    const storedToken = await prisma.refreshToken.findUnique({
      where: { tokenHash: oldTokenHash },
    });

    if (!storedToken || storedToken.revoked) {
      if (storedToken) {
        await prisma.refreshToken.updateMany({
          where: { userId: storedToken.userId },
          data: { revoked: true },
        });
      }
      return NextResponse.json(
        { error: "Token reuse detected" },
        { status: 401 },
      );
    }

    await prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { revoked: true },
    });

    const user = await prisma.user.findUnique({
      where: { id: payload.userId as string },
    });
    if (!user || user.banned) {
      return NextResponse.json(
        { error: "Account not found or suspended" },
        { status: 401 },
      );
    }

    const accessToken = await createAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });
    const newRefreshToken = await createRefreshToken({ userId: user.id });
    const newTokenHash = await hashToken(newRefreshToken);

    await prisma.refreshToken.create({
      data: {
        tokenHash: newTokenHash,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    await setRefreshTokenCookie(newRefreshToken);

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      accessToken,
    });
  } catch (error) {
    console.error("Token refresh error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
