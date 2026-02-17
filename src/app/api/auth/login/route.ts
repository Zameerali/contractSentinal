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
    const { email, password } = await request.json();
    const ip = getClientIP(request);

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
    if (!user) {
      await createAuditLog({
        action: "LOGIN_FAILED",
        ipAddress: ip,
        details: { email, reason: "User not found" },
      });
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 },
      );
    }

    if (user.banned) {
      return NextResponse.json(
        { error: "Your account has been suspended" },
        { status: 403 },
      );
    }

    const validPassword = await argon2.verify(user.passwordHash, password);
    if (!validPassword) {
      await createAuditLog({
        userId: user.id,
        action: "LOGIN_FAILED",
        ipAddress: ip,
        details: { reason: "Invalid password" },
      });
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 },
      );
    }

    // Revoke all existing refresh tokens
    await prisma.refreshToken.updateMany({
      where: { userId: user.id, revoked: false },
      data: { revoked: true },
    });

    const accessToken = await createAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });
    const refreshToken = await createRefreshToken({ userId: user.id });
    const tokenHash = await hashToken(refreshToken);

    await prisma.refreshToken.create({
      data: {
        tokenHash,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    await setRefreshTokenCookie(refreshToken);
    await createAuditLog({
      userId: user.id,
      action: "LOGIN",
      ipAddress: ip,
      details: { email: user.email },
    });

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
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
