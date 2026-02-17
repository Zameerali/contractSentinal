import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import {
  fetchContractSource,
  analyzeWithLLM,
  performBasicAnalysis,
  getChainConfig,
  getAlchemyUrl,
  getChainName,
} from "@/lib/llm";

const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY || "";

// Concurrency limiter with rate limiting (max 3 per second)
async function runWithConcurrencyLimit<T>(
  tasks: (() => Promise<T>)[],
  limit: number = 3,
  delayMs: number = 1000,
): Promise<T[]> {
  const results: T[] = [];

  for (let i = 0; i < tasks.length; i += limit) {
    const batch = tasks.slice(i, i + limit);
    const batchResults = await Promise.all(batch.map((task) => task()));
    results.push(...batchResults);

    // Add delay between batches (except after the last batch)
    if (i + limit < tasks.length) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  return results;
}

// Fallback well-known tokens per chain when Alchemy is unavailable
const FALLBACK_TOKENS: Record<
  number,
  Array<{ address: string; symbol: string; name: string }>
> = {
  1: [
    {
      address: "0xdac17f958d2ee523a2206206994597c13d831ec7",
      symbol: "USDT",
      name: "Tether USD",
    },
    {
      address: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
      symbol: "USDC",
      name: "USD Coin",
    },
    {
      address: "0x6b175474e89094c44da98b954eedeac495271d0f",
      symbol: "DAI",
      name: "Dai Stablecoin",
    },
    {
      address: "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984",
      symbol: "UNI",
      name: "Uniswap",
    },
    {
      address: "0x514910771af9ca656af840dff83e8264ecf986ca",
      symbol: "LINK",
      name: "Chainlink",
    },
  ],
  137: [
    {
      address: "0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
      symbol: "USDC.e",
      name: "Bridged USDC",
    },
    {
      address: "0x7ceb23fd6bc0add59e62ac25578270cff1b9f619",
      symbol: "WETH",
      name: "Wrapped Ether",
    },
    {
      address: "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270",
      symbol: "WMATIC",
      name: "Wrapped Matic",
    },
  ],
  42161: [
    {
      address: "0xaf88d065e77c8cc2239327c5edb3a432268e5831",
      symbol: "USDC",
      name: "USD Coin",
    },
    {
      address: "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
      symbol: "WETH",
      name: "Wrapped Ether",
    },
    {
      address: "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9",
      symbol: "USDT",
      name: "Tether USD",
    },
  ],
  10: [
    {
      address: "0x0b2c639c533813f4aa9d7837caf62653d097ff85",
      symbol: "USDC",
      name: "USD Coin",
    },
    {
      address: "0x4200000000000000000000000000000000000006",
      symbol: "WETH",
      name: "Wrapped Ether",
    },
    {
      address: "0xda10009cbd5d07dd0cecc66161fc93d7c9000da1",
      symbol: "DAI",
      name: "Dai Stablecoin",
    },
  ],
  56: [
    {
      address: "0x55d398326f99059ff775485246999027b3197955",
      symbol: "USDT",
      name: "Tether USD",
    },
    {
      address: "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d",
      symbol: "USDC",
      name: "USD Coin",
    },
    {
      address: "0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c",
      symbol: "WBNB",
      name: "Wrapped BNB",
    },
  ],
};

interface TokenHolding {
  address: string;
  symbol: string;
  name: string;
  balance?: string;
}

// Fetch real token holdings from Alchemy
async function fetchTokenHoldings(
  walletAddress: string,
  chainId: number,
): Promise<TokenHolding[]> {
  if (!ALCHEMY_API_KEY) {
    console.log(
      "[Portfolio] No ALCHEMY_API_KEY set, using fallback tokens for demo",
    );
    return FALLBACK_TOKENS[chainId] || FALLBACK_TOKENS[1];
  }

  const alchemyUrl = getAlchemyUrl(chainId, ALCHEMY_API_KEY);
  if (!alchemyUrl) {
    console.log(
      `[Portfolio] Alchemy not supported for chain ${chainId}, using fallback`,
    );
    return FALLBACK_TOKENS[chainId] || FALLBACK_TOKENS[1];
  }

  try {
    // Get all ERC-20 token balances via Alchemy
    const balancesRes = await fetch(alchemyUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "alchemy_getTokenBalances",
        params: [walletAddress],
        id: 1,
      }),
    });

    const balancesData = await balancesRes.json();

    if (balancesData.error || !balancesData.result?.tokenBalances) {
      console.error(
        "[Portfolio] Alchemy getTokenBalances error:",
        balancesData.error,
      );
      return FALLBACK_TOKENS[chainId] || FALLBACK_TOKENS[1];
    }

    // Filter tokens with non-zero balance, cap at 20
    const nonZeroTokens = balancesData.result.tokenBalances
      .filter(
        (tb: any) =>
          tb.tokenBalance &&
          tb.tokenBalance !==
            "0x0000000000000000000000000000000000000000000000000000000000000000" &&
          tb.tokenBalance !== "0x0" &&
          tb.tokenBalance !== "0x",
      )
      .slice(0, 20);

    if (nonZeroTokens.length === 0) {
      return [];
    }

    // Get metadata for each token
    const holdings: TokenHolding[] = [];
    for (const token of nonZeroTokens) {
      try {
        const metaRes = await fetch(alchemyUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jsonrpc: "2.0",
            method: "alchemy_getTokenMetadata",
            params: [token.contractAddress],
            id: 2,
          }),
        });

        const metaData = await metaRes.json();
        const meta = metaData.result;

        holdings.push({
          address: token.contractAddress,
          symbol: meta?.symbol || "???",
          name: meta?.name || "Unknown Token",
          balance: token.tokenBalance,
        });
      } catch {
        holdings.push({
          address: token.contractAddress,
          symbol: "???",
          name: "Unknown Token",
          balance: token.tokenBalance,
        });
      }
    }

    return holdings;
  } catch (err: any) {
    console.error("[Portfolio] Alchemy API error:", err.message);
    return FALLBACK_TOKENS[chainId] || FALLBACK_TOKENS[1];
  }
}

export async function POST(request: Request) {
  try {
    const user = await getAuthUser(request);
    if (!user)
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );

    const body = await request.json();
    const walletAddress = body.walletAddress;
    const chainId = parseInt(body.chainId || body.chain || "1", 10);

    if (!walletAddress || !/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
      return NextResponse.json(
        { error: "Valid wallet address required" },
        { status: 400 },
      );
    }

    // Fetch real token holdings from Alchemy (falls back to known tokens if key missing)
    const tokenHoldings = await fetchTokenHoldings(walletAddress, chainId);

    if (tokenHoldings.length === 0) {
      return NextResponse.json({
        walletAddress,
        chainId,
        chainName: getChainName(chainId),
        averageRisk: 0,
        highRiskCount: 0,
        totalScanned: 0,
        holdings: [],
        source: ALCHEMY_API_KEY ? "alchemy" : "fallback",
        message: "No ERC-20 token holdings found for this wallet.",
      });
    }

    // Scan tokens with concurrency limit (max 3 parallel scans) to avoid rate limits
    const scanTasks = tokenHoldings.map((token) => async () => {
      try {
        const contractData = await fetchContractSource(token.address, chainId);
        const chainName = getChainConfig(chainId)?.name || "Unknown";
        let analysis;
        try {
          analysis = await analyzeWithLLM(
            contractData.sourceCode,
            token.address,
            chainName,
          );
        } catch {
          analysis = performBasicAnalysis(contractData.sourceCode);
        }

        const scan = await prisma.scan.create({
          data: {
            userId: user.userId as string,
            type: "PORTFOLIO",
            contractAddress: token.address.toLowerCase(),
            walletAddress: walletAddress.toLowerCase(),
            chainId,
            riskScore: analysis.riskScore,
            verdict: analysis.verdict,
            explanation: analysis.explanation,
            technicalDetails: analysis.technicalDetails,
            contractName: contractData.contractName || token.name,
          },
        });

        return {
          ...scan,
          symbol: token.symbol,
          name: token.name,
          contractName: contractData.contractName || token.name,
        };
      } catch (err: any) {
        return {
          contractAddress: token.address,
          symbol: token.symbol,
          name: token.name,
          error: err.message,
          riskScore: null,
          verdict: "ERROR",
        };
      }
    });

    const results = await runWithConcurrencyLimit(scanTasks, 3);

    // Calculate portfolio risk
    const validResults = results.filter((r) => r.riskScore != null);
    const avgRisk =
      validResults.length > 0
        ? Math.round(
            validResults.reduce((sum, r) => sum + (r.riskScore || 0), 0) /
              validResults.length,
          )
        : 0;
    const highRiskCount = validResults.filter(
      (r) => (r.riskScore || 0) >= 60,
    ).length;

    return NextResponse.json({
      walletAddress,
      chainId,
      chainName: getChainName(chainId),
      averageRisk: avgRisk,
      highRiskCount,
      totalScanned: results.length,
      holdings: results,
      source: ALCHEMY_API_KEY ? "alchemy" : "fallback",
    });
  } catch (error) {
    console.error("Portfolio scan error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
