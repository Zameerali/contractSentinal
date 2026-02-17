import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import {
  fetchContractSource,
  analyzeWithLLM,
  performBasicAnalysis,
  getChainConfig,
} from "@/lib/llm";
import { checkKnownScam } from "@/lib/scam-check";

// Batch scan multiple addresses
export async function POST(request: Request) {
  try {
    const user = await getAuthUser(request);
    if (!user)
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );

    const body = await request.json();
    const addresses = body.addresses;
    const chainId = parseInt(body.chainId || body.chain || "1", 10);

    if (!addresses || !Array.isArray(addresses) || addresses.length === 0) {
      return NextResponse.json(
        { error: "Provide an array of contract addresses" },
        { status: 400 },
      );
    }
    if (addresses.length > 10) {
      return NextResponse.json(
        { error: "Maximum 10 addresses per batch" },
        { status: 400 },
      );
    }

    const results = [];

    for (const contractAddress of addresses) {
      if (!/^0x[a-fA-F0-9]{40}$/.test(contractAddress)) {
        results.push({
          contractAddress,
          error: "Invalid address format",
          riskScore: null,
          verdict: "ERROR",
        });
        continue;
      }

      // Known scam check
      const scamResult = checkKnownScam(contractAddress);
      if (scamResult.isScam) {
        const scan = await prisma.scan.create({
          data: {
            userId: user.userId as string,
            type: "BATCH",
            contractAddress: contractAddress.toLowerCase(),
            chainId,
            riskScore: 100,
            verdict: scamResult.verdict,
            explanation: scamResult.explanation,
            technicalDetails: scamResult.technicalDetails,
          },
        });
        results.push({ ...scan, contractName: "KNOWN SCAM" });
        continue;
      }

      try {
        const contractData = await fetchContractSource(
          contractAddress,
          chainId,
        );
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

        const scan = await prisma.scan.create({
          data: {
            userId: user.userId as string,
            type: "BATCH",
            contractAddress: contractAddress.toLowerCase(),
            chainId,
            riskScore: analysis.riskScore,
            verdict: analysis.verdict,
            explanation: analysis.explanation,
            technicalDetails: analysis.technicalDetails,
            contractName: contractData.contractName,
          },
        });
        results.push({ ...scan, contractName: contractData.contractName });
      } catch (err: any) {
        results.push({
          contractAddress,
          error: err.message,
          riskScore: null,
          verdict: "ERROR",
        });
      }
    }

    return NextResponse.json({ results });
  } catch (error) {
    console.error("Batch scan error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
