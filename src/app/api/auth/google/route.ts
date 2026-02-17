import { NextResponse } from "next/server";
import { OAuth2Client } from "google-auth-library";
import prisma from "@/lib/prisma";
import {
  createAccessToken,
  createRefreshToken,
  hashToken,
  setRefreshTokenCookie,
} from "@/lib/auth";
import { createAuditLog, getClientIP } from "@/lib/audit";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export async function POST(request: Request) {
  try {
    const { credential } = await request.json();
    const ip = getClientIP(request);

    if (!credential) {
      return NextResponse.json(
        { error: "Google credential is required" },
        { status: 400 },
      );
    }

    // Verify the Google ID token
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    if (!payload || !payload.email) {
      return NextResponse.json(
        { error: "Invalid Google token" },
        { status: 400 },
      );
    }

    const { email, name, picture, sub: googleId } = payload;

    // Check if user exists by Google ID or email
    let user = await prisma.user.findFirst({
      where: {
        OR: [{ googleId }, { email: email.toLowerCase() }],
      },
    });

    if (user) {
      // Link Google account if not already linked
      if (!user.googleId) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            googleId,
            avatarUrl: picture || user.avatarUrl,
            isVerified: true,
          },
        });
      }

      if (user.banned) {
        return NextResponse.json(
          { error: "Your account has been suspended" },
          { status: 403 },
        );
      }
    } else {
      // Create new user
      user = await prisma.user.create({
        data: {
          email: email.toLowerCase(),
          name: name || null,
          googleId,
          avatarUrl: picture || null,
          isVerified: true, // Google accounts are auto-verified
        },
      });

      await createAuditLog({
        userId: user.id,
        action: "REGISTER",
        ipAddress: ip,
        details: { email: user.email, method: "google" },
      });
    }

    // Revoke existing refresh tokens
    await prisma.refreshToken.updateMany({
      where: { userId: user.id, revoked: false },
      data: { revoked: true },
    });

    // Issue tokens
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
      details: { method: "google" },
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
  } catch (error: any) {
    console.error("Google auth error:", error);
    return NextResponse.json(
      { error: "Google authentication failed" },
      { status: 500 },
    );
  }
}
