import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limit";
import { createAuditLog, getClientIP } from "@/lib/audit";
import {
  fetchContractSource,
  analyzeWithLLM,
  performBasicAnalysis,
  getChainConfig,
  getSupportedChainIds,
} from "@/lib/llm";
import { checkKnownScam, checkScamPatterns } from "@/lib/scam-check";

export async function POST(request: Request) {
  try {
    const user = await getAuthUser(request);
    if (!user)
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );

    const ip = getClientIP(request);
    const userLimit = await checkRateLimit(`user:${user.userId}`, true);
    if (!userLimit.allowed) {
      return NextResponse.json(
        { error: "Rate limit exceeded", resetAt: userLimit.resetAt },
        { status: 429 },
      );
    }

    const body = await request.json();
    const contractAddress = body.contractAddress;
    const chainId = parseInt(body.chainId || body.chain || "1", 10);
    if (!contractAddress)
      return NextResponse.json(
        { error: "Contract address is required" },
        { status: 400 },
      );
    if (!/^0x[a-fA-F0-9]{40}$/.test(contractAddress)) {
      return NextResponse.json(
        { error: "Invalid Ethereum address format" },
        { status: 400 },
      );
    }
    if (!getSupportedChainIds().includes(chainId)) {
      return NextResponse.json(
        {
          error: `Unsupported chain ID: ${chainId}. Supported: ${getSupportedChainIds().join(", ")}`,
        },
        { status: 400 },
      );
    }

    await createAuditLog({
      userId: user.userId as string,
      action: "SCAN_INITIATED",
      ipAddress: ip,
      details: { contractAddress, chainId },
    });

    // Check known scam database first
    const scamResult = checkKnownScam(contractAddress);
    if (scamResult.isScam) {
      const scan = await prisma.scan.create({
        data: {
          userId: user.userId as string,
          type: "SINGLE",
          contractAddress: contractAddress.toLowerCase(),
          chainId,
          riskScore: 100,
          verdict: scamResult.verdict,
          explanation: scamResult.explanation,
          technicalDetails: scamResult.technicalDetails,
        },
      });
      const findings = (scamResult.technicalDetails || []).map((d: string) => ({
        title: d,
        severity: "critical",
      }));
      return NextResponse.json({
        id: scan.id,
        contractAddress: scan.contractAddress,
        chainId: scan.chainId,
        riskScore: 100,
        verdict: scamResult.verdict,
        explanation: scamResult.explanation,
        summary: scamResult.explanation,
        findings,
        technicalDetails: scamResult.technicalDetails,
        contractName: "KNOWN SCAM",
        createdAt: scan.createdAt,
      });
    }

    let contractData;
    try {
      contractData = await fetchContractSource(contractAddress, chainId);
    } catch (fetchError: any) {
      const scan = await prisma.scan.create({
        data: {
          userId: user.userId as string,
          type: "SINGLE",
          contractAddress: contractAddress.toLowerCase(),
          chainId,
          verdict: "ERROR",
          explanation: fetchError.message,
        },
      });
      return NextResponse.json(
        { error: fetchError.message, scanId: scan.id },
        { status: 422 },
      );
    }

    // Check patterns first
    const patternResult = checkScamPatterns(contractData.sourceCode);

    const chainName = getChainConfig(chainId)?.name || "Unknown";
    let analysis;
    try {
      analysis = await analyzeWithLLM(
        contractData.sourceCode,
        contractAddress,
        chainName,
      );
    } catch {
      analysis = performBasicAnalysis(contractData.sourceCode);
    }

    // Merge pattern results into analysis
    if (patternResult.score > 0) {
      analysis.riskScore = Math.min(
        100,
        analysis.riskScore + patternResult.score,
      );
      analysis.technicalDetails = [
        ...(analysis.technicalDetails || []),
        ...patternResult.redFlags,
      ];
      if (analysis.riskScore >= 90) analysis.verdict = "KNOWN SCAM";
      else if (analysis.riskScore >= 75)
        analysis.verdict = "HIGH RISK — HONEYPOT";
      else if (analysis.riskScore >= 60) analysis.verdict = "RUGPULL LIKELY";
    }

    const scan = await prisma.scan.create({
      data: {
        userId: user.userId as string,
        type: "SINGLE",
        contractAddress: contractAddress.toLowerCase(),
        chainId,
        riskScore: analysis.riskScore,
        verdict: analysis.verdict,
        explanation: analysis.explanation,
        technicalDetails: analysis.technicalDetails,
        contractName: contractData.contractName,
      },
    });

    await createAuditLog({
      userId: user.userId as string,
      action: "SCAN_COMPLETED",
      ipAddress: ip,
      details: {
        contractAddress,
        chainId,
        riskScore: analysis.riskScore,
        verdict: analysis.verdict,
        scanId: scan.id,
      },
    });

    // Map technicalDetails strings into structured findings for frontend
    const findings = (analysis.technicalDetails || []).map(
      (detail: string) => ({
        title: detail,
        severity:
          analysis.riskScore >= 75
            ? "high"
            : analysis.riskScore >= 50
              ? "medium"
              : "low",
      }),
    );

    return NextResponse.json({
      id: scan.id,
      contractAddress: scan.contractAddress,
      chainId: scan.chainId,
      riskScore: analysis.riskScore,
      verdict: analysis.verdict,
      explanation: analysis.explanation,
      summary: analysis.explanation,
      findings,
      technicalDetails: analysis.technicalDetails,
      contractName: contractData.contractName,
      createdAt: scan.createdAt,
    });
  } catch (error) {
    console.error("Scan API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function GET(request: Request) {
  try {
    const user = await getAuthUser(request);
    if (!user)
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );

    const { searchParams } = new URL(request.url);

    // Single scan lookup by ID
    const scanId = searchParams.get("id");
    if (scanId) {
      const scan = await prisma.scan.findFirst({
        where: { id: scanId, userId: user.userId as string },
      });
      if (!scan)
        return NextResponse.json({ error: "Scan not found" }, { status: 404 });

      const details = (scan.technicalDetails as any) || [];
      const findings = Array.isArray(details)
        ? details.map((d: any) =>
            typeof d === "string"
              ? {
                  title: d,
                  severity:
                    (scan.riskScore || 0) >= 75
                      ? "high"
                      : (scan.riskScore || 0) >= 50
                        ? "medium"
                        : "low",
                }
              : d,
          )
        : [];

      return NextResponse.json({
        id: scan.id,
        contractAddress: scan.contractAddress,
        chainId: scan.chainId,
        riskScore: scan.riskScore,
        verdict: scan.verdict,
        explanation: scan.explanation,
        summary: scan.explanation,
        findings,
        technicalDetails: scan.technicalDetails,
        contractName: scan.contractName,
        createdAt: scan.createdAt,
      });
    }

    // Paginated list
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const verdict = searchParams.get("verdict");
    const search = searchParams.get("search");
    const skip = (page - 1) * limit;

    const where: any = { userId: user.userId as string };
    if (verdict) {
      where.verdict = { contains: verdict, mode: "insensitive" };
    }
    if (search) {
      where.OR = [
        { contractAddress: { contains: search, mode: "insensitive" } },
        { contractName: { contains: search, mode: "insensitive" } },
      ];
    }

    const [scans, total] = await Promise.all([
      prisma.scan.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: limit,
        skip,
      }),
      prisma.scan.count({ where }),
    ]);

    return NextResponse.json({ scans, total, page, limit });
  } catch (error) {
    console.error("Get scans error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
