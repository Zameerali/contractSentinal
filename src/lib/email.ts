import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const FROM_EMAIL =
  process.env.SMTP_FROM || "ContractSentinel <noreply@contractsentinel.com>";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001";

function baseTemplate(content: string) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#030712;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:40px 20px;">
    <!-- Logo -->
    <div style="text-align:center;margin-bottom:32px;">
      <div style="display:inline-flex;align-items:center;gap:10px;">
        <div style="width:40px;height:40px;background:rgba(16,185,129,0.15);border-radius:12px;display:flex;align-items:center;justify-content:center;">
          <span style="font-size:20px;">🛡️</span>
        </div>
        <span style="font-size:20px;font-weight:700;color:#ffffff;">
          Contract<span style="color:#10b981;">Sentinel</span>
        </span>
      </div>
    </div>
    
    <!-- Content Card -->
    <div style="background-color:#111827;border:1px solid #1f2937;border-radius:16px;padding:32px;color:#d1d5db;">
      ${content}
    </div>
    
    <!-- Footer -->
    <div style="text-align:center;margin-top:24px;color:#6b7280;font-size:12px;">
      <p>This email was sent by ContractSentinel.</p>
      <p>If you didn't request this, you can safely ignore it.</p>
    </div>
  </div>
</body>
</html>`;
}

export async function sendVerificationEmail(
  email: string,
  token: string,
  name?: string,
) {
  const verifyUrl = `${APP_URL}/verify-email?token=${token}`;

  const html = baseTemplate(`
    <h2 style="color:#ffffff;margin:0 0 8px 0;font-size:20px;">Verify your email</h2>
    <p style="margin:0 0 24px 0;color:#9ca3af;">
      Hi${name ? ` ${name}` : ""}, thanks for signing up! Please verify your email address to get started.
    </p>
    <div style="text-align:center;margin:24px 0;">
      <a href="${verifyUrl}" style="display:inline-block;background-color:#10b981;color:#ffffff;font-weight:600;font-size:14px;padding:12px 32px;border-radius:12px;text-decoration:none;">
        Verify Email Address
      </a>
    </div>
    <p style="margin:24px 0 0 0;font-size:13px;color:#6b7280;">
      Or copy this link: <br/>
      <a href="${verifyUrl}" style="color:#10b981;word-break:break-all;">${verifyUrl}</a>
    </p>
    <p style="margin:16px 0 0 0;font-size:12px;color:#4b5563;">This link expires in 24 hours.</p>
  `);

  await transporter.sendMail({
    from: FROM_EMAIL,
    to: email,
    subject: "Verify your email — ContractSentinel",
    html,
  });
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${APP_URL}/reset-password?token=${token}`;

  const html = baseTemplate(`
    <h2 style="color:#ffffff;margin:0 0 8px 0;font-size:20px;">Reset your password</h2>
    <p style="margin:0 0 24px 0;color:#9ca3af;">
      We received a request to reset your password. Click the button below to choose a new one.
    </p>
    <div style="text-align:center;margin:24px 0;">
      <a href="${resetUrl}" style="display:inline-block;background-color:#10b981;color:#ffffff;font-weight:600;font-size:14px;padding:12px 32px;border-radius:12px;text-decoration:none;">
        Reset Password
      </a>
    </div>
    <p style="margin:24px 0 0 0;font-size:13px;color:#6b7280;">
      Or copy this link: <br/>
      <a href="${resetUrl}" style="color:#10b981;word-break:break-all;">${resetUrl}</a>
    </p>
    <p style="margin:16px 0 0 0;font-size:12px;color:#4b5563;">This link expires in 1 hour. If you didn't request this, ignore this email.</p>
  `);

  await transporter.sendMail({
    from: FROM_EMAIL,
    to: email,
    subject: "Reset your password — ContractSentinel",
    html,
  });
}
