import { NextResponse } from "next/server";
import argon2 from "argon2";
import prisma from "@/lib/prisma";
import { createAuditLog, getClientIP } from "@/lib/audit";
import { sendVerificationEmail } from "@/lib/email";
import { hashToken } from "@/lib/auth";
import { checkAuthRateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json();
    const ip = getClientIP(request);

    // Rate limit registration attempts
    const rateCheck = await checkAuthRateLimit(ip);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: "Too many attempts. Please try again later." },
        { status: 429 },
      );
    }

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 },
      );
    }
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 },
      );
    }
    // Server-side password complexity (match frontend rules)
    if (!/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
      return NextResponse.json(
        {
          error:
            "Password must contain at least one uppercase letter and one number",
        },
        { status: 400 },
      );
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 },
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 },
      );
    }

    const passwordHash = await argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 65536,
      timeCost: 3,
      parallelism: 4,
    });

    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
        name: name || null,
        isVerified: false,
      },
    });

    // Create verification token (store hash, send plaintext)
    const verificationToken = crypto.randomUUID() + "-" + crypto.randomUUID();
    const tokenHash = await hashToken(verificationToken);
    await prisma.verificationToken.create({
      data: {
        token: tokenHash,
        userId: user.id,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      },
    });

    // Send verification email
    try {
      await sendVerificationEmail(
        user.email,
        verificationToken,
        user.name || undefined,
      );
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError);
    }

    await createAuditLog({
      userId: user.id,
      action: "REGISTER",
      ipAddress: ip,
      details: { email: user.email },
    });

    return NextResponse.json({
      message:
        "Account created! Please check your email to verify your account.",
      requiresVerification: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
