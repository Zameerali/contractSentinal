import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

/** Escape HTML entities to prevent XSS */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function GET(request: Request) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const scanId = searchParams.get("scanId");
    if (!scanId) {
      return NextResponse.json({ error: "scanId required" }, { status: 400 });
    }

    const scan = await prisma.scan.findFirst({
      where: { id: scanId, userId: user.userId as string },
    });
    if (!scan) {
      return NextResponse.json({ error: "Scan not found" }, { status: 404 });
    }

    // technicalDetails is stored as Json — could be string[] or structured objects
    const rawDetails = (scan.technicalDetails as any) || [];
    const findings: any[] = Array.isArray(rawDetails)
      ? rawDetails.map((d: any) =>
          typeof d === "string" ? { title: d, severity: "info" } : d,
        )
      : [];
    const recommendations: string[] = [];

    const getVerdictEmoji = (v: string) => {
      if (!v) return "❓";
      const upper = v.toUpperCase();
      if (upper.includes("SAFE") || upper.includes("LOW")) return "✅";
      if (upper.includes("MEDIUM") || upper.includes("CAUTION")) return "⚠️";
      return "🚨";
    };

    const getSeverityBar = (sev: string) => {
      switch ((sev || "").toLowerCase()) {
        case "critical":
          return "████████████████ CRITICAL";
        case "high":
          return "████████████     HIGH";
        case "medium":
          return "████████         MEDIUM";
        case "low":
          return "████             LOW";
        default:
          return "██               INFO";
      }
    };

    // Generate a text-based PDF-like report as HTML
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>ContractSentinel Report - ${escapeHtml(scan.contractAddress || "")}</title>
  <style>
    @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; background: #09090b; color: #d4d4d8; padding: 40px; max-width: 800px; margin: 0 auto; }
    .header { text-align: center; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 2px solid #27272a; }
    .logo { font-size: 28px; font-weight: 800; }
    .logo span { color: #10b981; }
    .subtitle { color: #71717a; font-size: 14px; margin-top: 8px; }
    .section { margin: 30px 0; }
    .section-title { font-size: 16px; font-weight: 700; color: #ffffff; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 16px; padding-bottom: 8px; border-bottom: 1px solid #27272a; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .info-item label { font-size: 11px; color: #71717a; text-transform: uppercase; letter-spacing: 1px; }
    .info-item p { font-size: 14px; color: #e4e4e7; margin-top: 4px; word-break: break-all; }
    .risk-box { text-align: center; padding: 30px; border-radius: 16px; margin: 20px 0; }
    .risk-box.safe { background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.2); }
    .risk-box.medium { background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.2); }
    .risk-box.high { background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); }
    .risk-score { font-size: 64px; font-weight: 900; }
    .risk-score.safe { color: #10b981; }
    .risk-score.medium { color: #f59e0b; }
    .risk-score.high { color: #ef4444; }
    .verdict { font-size: 18px; font-weight: 700; margin-top: 8px; }
    .verdict.safe { color: #10b981; }
    .verdict.medium { color: #f59e0b; }
    .verdict.high { color: #ef4444; }
    .finding { padding: 12px 16px; border-radius: 8px; margin-bottom: 8px; border-left: 3px solid; }
    .finding.critical { background: rgba(239, 68, 68, 0.05); border-left-color: #ef4444; }
    .finding.high { background: rgba(249, 115, 22, 0.05); border-left-color: #f97316; }
    .finding.medium { background: rgba(245, 158, 11, 0.05); border-left-color: #f59e0b; }
    .finding.low, .finding.info { background: rgba(63, 63, 70, 0.3); border-left-color: #52525b; }
    .finding-title { font-size: 14px; font-weight: 600; color: #e4e4e7; }
    .finding-desc { font-size: 12px; color: #a1a1aa; margin-top: 4px; }
    .finding-severity { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-top: 4px; }
    .rec { display: flex; align-items: center; gap: 8px; padding: 8px 0; font-size: 13px; color: #d4d4d8; }
    .rec::before { content: '✓'; color: #10b981; font-weight: bold; }
    .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #27272a; font-size: 12px; color: #52525b; }
    .summary { font-size: 14px; line-height: 1.8; color: #a1a1aa; background: #18181b; padding: 16px; border-radius: 8px; }
    @media print {
      body { background: white; color: #1f2937; padding: 20px; }
      .risk-box.safe { background: #ecfdf5; }
      .risk-box.medium { background: #fffbeb; }
      .risk-box.high { background: #fef2f2; }
      .info-item p { color: #1f2937; }
      .finding-title { color: #1f2937; }
      .summary { background: #f9fafb; color: #4b5563; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">Contract<span>Sentinel</span></div>
    <div class="subtitle">Smart Contract Security Analysis Report</div>
  </div>

  <div class="section">
    <div class="section-title">Contract Information</div>
    <div class="info-grid">
      <div class="info-item">
        <label>Contract Address</label>
        <p style="font-family: monospace; font-size: 12px;">${escapeHtml(scan.contractAddress || "")}</p>
      </div>
      <div class="info-item">
        <label>Contract Name</label>
        <p>${escapeHtml(scan.contractName || "Unknown")}</p>
      </div>
      <div class="info-item">
        <label>Chain</label>
        <p>${{ 1: "Ethereum", 137: "Polygon", 42161: "Arbitrum", 10: "Optimism", 56: "BNB Chain" }[scan.chainId as number] || "Unknown"}</p>
      </div>
      <div class="info-item">
        <label>Scanned At</label>
        <p>${new Date(scan.createdAt).toLocaleString()}</p>
      </div>
      <div class="info-item">
        <label>Scan Type</label>
        <p>${scan.type}</p>
      </div>
      <div class="info-item">
        <label>Report ID</label>
        <p style="font-family: monospace; font-size: 11px;">${scan.id}</p>
      </div>
    </div>
  </div>

  <div class="risk-box ${(scan.riskScore || 0) <= 25 ? "safe" : (scan.riskScore || 0) <= 70 ? "medium" : "high"}">
    <div class="risk-score ${(scan.riskScore || 0) <= 25 ? "safe" : (scan.riskScore || 0) <= 70 ? "medium" : "high"}">
      ${getVerdictEmoji(scan.verdict || "")} ${scan.riskScore}/100
    </div>
    <div class="verdict ${(scan.riskScore || 0) <= 25 ? "safe" : (scan.riskScore || 0) <= 70 ? "medium" : "high"}">
      ${escapeHtml(scan.verdict || "UNKNOWN")}
    </div>
  </div>

  ${
    scan.explanation
      ? `
  <div class="section">
    <div class="section-title">Analysis Summary</div>
    <div class="summary">${escapeHtml(scan.explanation || "")}</div>
  </div>
  `
      : ""
  }

  ${
    findings.length > 0
      ? `
  <div class="section">
    <div class="section-title">Security Findings (${findings.length})</div>
    ${findings
      .map(
        (f: any) => `
      <div class="finding ${(f.severity || "info").toLowerCase()}">
        <div class="finding-title">${escapeHtml(f.title || f.pattern || "")}</div>
        ${f.description ? `<div class="finding-desc">${escapeHtml(f.description)}</div>` : ""}
        <div class="finding-severity" style="color: ${f.severity === "critical" ? "#ef4444" : f.severity === "high" ? "#f97316" : f.severity === "medium" ? "#f59e0b" : "#71717a"}">${f.severity || "info"}</div>
      </div>
    `,
      )
      .join("")}
  </div>
  `
      : ""
  }

  ${
    recommendations.length > 0
      ? `
  <div class="section">
    <div class="section-title">Recommendations</div>
    ${recommendations.map((r: string) => `<div class="rec">${escapeHtml(r)}</div>`).join("")}
  </div>
  `
      : ""
  }

  <div class="footer">
    <p>Generated by ContractSentinel · ${new Date().toISOString()}</p>
    <p style="margin-top: 4px;">This report is for informational purposes only. Not financial advice.</p>
    <p style="margin-top: 8px; font-size: 11px;">To save as PDF: Press Ctrl+P (or Cmd+P) → Save as PDF</p>
  </div>
</body>
</html>`;

    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    });
  } catch (error) {
    console.error("PDF report error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
