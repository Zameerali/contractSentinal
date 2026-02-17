import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/email";
import { createAuditLog, getClientIP } from "@/lib/audit";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    const ip = getClientIP(request);

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Always return success to prevent email enumeration
    const successResponse = NextResponse.json({
      message:
        "If an account with that email exists, we've sent a password reset link.",
    });

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user || !user.passwordHash) {
      // User doesn't exist or is a Google-only account - return success anyway
      return successResponse;
    }

    // Rate limit: max 3 reset requests per hour
    const recentResets = await prisma.passwordResetToken.count({
      where: {
        userId: user.id,
        createdAt: { gte: new Date(Date.now() - 60 * 60 * 1000) },
      },
    });
    if (recentResets >= 3) {
      return successResponse; // Silent rate limit
    }

    // Invalidate existing tokens
    await prisma.passwordResetToken.updateMany({
      where: { userId: user.id, used: false },
      data: { used: true },
    });

    // Create new token
    const token = crypto.randomUUID() + "-" + crypto.randomUUID();
    await prisma.passwordResetToken.create({
      data: {
        token,
        userId: user.id,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      },
    });

    try {
      await sendPasswordResetEmail(user.email, token);
    } catch (emailError) {
      console.error("Failed to send reset email:", emailError);
    }

    await createAuditLog({
      userId: user.id,
      action: "PASSWORD_RESET_REQUESTED",
      ipAddress: ip,
    });

    return successResponse;
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
