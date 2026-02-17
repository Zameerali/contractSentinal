import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  createAccessToken,
  createRefreshToken,
  hashToken,
  setRefreshTokenCookie,
} from "@/lib/auth";
import { createAuditLog, getClientIP } from "@/lib/audit";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { error: "Verification token is required" },
        { status: 400 },
      );
    }

    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!verificationToken) {
      return NextResponse.json(
        { error: "Invalid or expired verification token" },
        { status: 400 },
      );
    }

    if (verificationToken.expiresAt < new Date()) {
      await prisma.verificationToken.delete({
        where: { id: verificationToken.id },
      });
      return NextResponse.json(
        { error: "Verification token has expired. Please register again." },
        { status: 400 },
      );
    }

    // Mark user as verified
    await prisma.user.update({
      where: { id: verificationToken.userId },
      data: { isVerified: true },
    });

    // Delete all verification tokens for this user
    await prisma.verificationToken.deleteMany({
      where: { userId: verificationToken.userId },
    });

    const ip = getClientIP(request);
    await createAuditLog({
      userId: verificationToken.userId,
      action: "EMAIL_VERIFIED",
      ipAddress: ip,
    });

    // Auto-login after verification
    const user = verificationToken.user;
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

    return NextResponse.json({
      message: "Email verified successfully",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      accessToken,
    });
  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
