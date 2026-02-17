import { NextResponse } from "next/server";
import argon2 from "argon2";
import prisma from "@/lib/prisma";
import {
  createAccessToken,
  createRefreshToken,
  hashToken,
  setRefreshTokenCookie,
} from "@/lib/auth";
import { createAuditLog, getClientIP } from "@/lib/audit";

export async function POST(request: Request) {
  try {
    const { token, password } = await request.json();
    const ip = getClientIP(request);

    if (!token || !password) {
      return NextResponse.json(
        { error: "Token and new password are required" },
        { status: 400 },
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 },
      );
    }

    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!resetToken || resetToken.used) {
      return NextResponse.json(
        { error: "Invalid or expired reset token" },
        { status: 400 },
      );
    }

    if (resetToken.expiresAt < new Date()) {
      await prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { used: true },
      });
      return NextResponse.json(
        { error: "Reset token has expired. Please request a new one." },
        { status: 400 },
      );
    }

    // Hash new password
    const passwordHash = await argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 65536,
      timeCost: 3,
      parallelism: 4,
    });

    // Update password and mark token as used
    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetToken.userId },
        data: { passwordHash },
      }),
      prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { used: true },
      }),
      // Revoke all refresh tokens (force re-login on other devices)
      prisma.refreshToken.updateMany({
        where: { userId: resetToken.userId, revoked: false },
        data: { revoked: true },
      }),
    ]);

    await createAuditLog({
      userId: resetToken.userId,
      action: "PASSWORD_RESET",
      ipAddress: ip,
    });

    // Auto-login after reset
    const user = resetToken.user;
    const accessToken = await createAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });
    const refreshTokenValue = await createRefreshToken({ userId: user.id });
    const tokenHash = await hashToken(refreshTokenValue);

    await prisma.refreshToken.create({
      data: {
        tokenHash,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    await setRefreshTokenCookie(refreshTokenValue);

    return NextResponse.json({
      message: "Password reset successful",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      accessToken,
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
