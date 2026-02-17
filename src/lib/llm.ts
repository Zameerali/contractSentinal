const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";

// All chains use Etherscan V2 unified API with chainid parameter
const CHAIN_CONFIG: Record<
  number,
  {
    name: string;
    apiUrl: string;
    chainId: number;
    apiKey: string;
    explorer: string;
    alchemySubdomain: string;
  }
> = {
  1: {
    name: "Ethereum",
    apiUrl: "https://api.etherscan.io/v2/api",
    chainId: 1,
    apiKey: ETHERSCAN_API_KEY,
    explorer: "https://etherscan.io",
    alchemySubdomain: "eth-mainnet",
  },
  137: {
    name: "Polygon",
    apiUrl: "https://api.etherscan.io/v2/api",
    chainId: 137,
    apiKey: ETHERSCAN_API_KEY,
    explorer: "https://polygonscan.com",
    alchemySubdomain: "polygon-mainnet",
  },
  42161: {
    name: "Arbitrum",
    apiUrl: "https://api.etherscan.io/v2/api",
    chainId: 42161,
    apiKey: ETHERSCAN_API_KEY,
    explorer: "https://arbiscan.io",
    alchemySubdomain: "arb-mainnet",
  },
  10: {
    name: "Optimism",
    apiUrl: "https://api.etherscan.io/v2/api",
    chainId: 10,
    apiKey: ETHERSCAN_API_KEY,
    explorer: "https://optimistic.etherscan.io",
    alchemySubdomain: "opt-mainnet",
  },
  56: {
    name: "BNB Chain",
    apiUrl: "https://api.etherscan.io/v2/api",
    chainId: 56,
    apiKey: ETHERSCAN_API_KEY,
    explorer: "https://bscscan.com",
    alchemySubdomain: "",
  },
};

const SYSTEM_PROMPT = `You are a senior smart contract auditor protecting retail investors.
Use only simple, non-technical English.
Focus on honeypot/rug-pull patterns: sell restricted to owner, high sell tax to dead/owner address, approve works but transferFrom blocked, blacklists, hidden fees, hidden mints, pause functions, proxy upgradability, self-destruct, delegatecall to untrusted addresses, liquidity lock concerns.

Return ONLY valid JSON:
{
  "riskScore": number 0-100,
  "verdict": "SAFE" | "MEDIUM RISK" | "HIGH RISK — HONEYPOT" | "RUGPULL LIKELY" | "KNOWN SCAM",
  "explanation": "3-5 short plain-English sentences",
  "technicalDetails": ["finding 1", "finding 2"]
}`;

export async function fetchContractSource(address: string, chainId: number) {
  const chain = CHAIN_CONFIG[chainId];
  if (!chain) throw new Error(`Unsupported chain ID: ${chainId}`);
  if (!chain.apiKey)
    throw new Error(`API key not configured for ${chain.name}`);

  const url = `${chain.apiUrl}?chainid=${chain.chainId}&module=contract&action=getsourcecode&address=${address}&apikey=${chain.apiKey}`;
  const response = await fetch(url);
  const text = await response.text();

  let data: any;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error("Invalid response from block explorer.");
  }

  if (data.status !== "1" || !data.result?.length) {
    throw new Error(
      data.message || "Failed to fetch contract data from block explorer",
    );
  }

  const contract = data.result[0];
  if (!contract.SourceCode || contract.SourceCode === "") {
    throw new Error(
      "Contract source code is not verified. Only verified contracts can be scanned.",
    );
  }

  return {
    sourceCode: contract.SourceCode as string,
    contractName: contract.ContractName as string,
    compilerVersion: contract.CompilerVersion as string,
    abi: contract.ABI as string,
  };
}

export async function analyzeWithLLM(
  sourceCode: string,
  contractAddress: string,
  chainName: string,
) {
  if (!GEMINI_API_KEY) {
    return performBasicAnalysis(sourceCode);
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: `${SYSTEM_PROMPT}\n\n---\nContract: ${contractAddress}\nChain: ${chainName}\n\nSource:\n\`\`\`solidity\n${sourceCode.substring(0, 30000)}\n\`\`\``,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 1024,
        responseMimeType: "application/json",
      },
    }),
  });

  if (!response.ok) {
    console.error("Gemini API error:", await response.text());
    throw new Error("AI analysis service temporarily unavailable");
  }

  const data = await response.json();
  const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!content) throw new Error("No response from AI analysis");
  return JSON.parse(content);
}

export function performBasicAnalysis(sourceCode: string) {
  const code = sourceCode.toLowerCase();
  let riskScore = 20;
  const findings: string[] = [];

  if (code.includes("blacklist") || code.includes("isblacklisted")) {
    riskScore += 25;
    findings.push(
      "Contract contains blacklist functionality that could prevent selling",
    );
  }
  if (
    code.includes("onlyowner") &&
    (code.includes("pause") || code.includes("_pause"))
  ) {
    riskScore += 15;
    findings.push(
      "Owner can pause the contract, which may freeze all transactions",
    );
  }
  if (code.includes("selfdestruct") || code.includes("suicide")) {
    riskScore += 30;
    findings.push(
      "Contract has self-destruct capability — owner could destroy it and trap funds",
    );
  }
  if (code.includes("delegatecall")) {
    riskScore += 20;
    findings.push("Uses delegatecall which could allow hidden code execution");
  }
  if (code.includes("mint") && code.includes("onlyowner")) {
    riskScore += 20;
    findings.push(
      "Owner can mint unlimited tokens, potentially diluting your holdings",
    );
  }
  if (
    (code.includes("fee") || code.includes("tax")) &&
    code.match(/(\d{2,3})\s*[%]/)
  ) {
    riskScore += 20;
    findings.push("High transaction fees/taxes detected");
  }
  if (code.includes("exclude") && code.includes("fee")) {
    riskScore += 10;
    findings.push(
      "Some addresses excluded from fees — could indicate insider advantage",
    );
  }
  if (code.includes("renounceownership")) {
    riskScore -= 10;
    findings.push(
      "Ownership can be renounced — positive sign for decentralization",
    );
  }

  riskScore = Math.max(0, Math.min(100, riskScore));

  let verdict = "SAFE";
  if (riskScore >= 75) verdict = "HIGH RISK — HONEYPOT";
  else if (riskScore >= 60) verdict = "RUGPULL LIKELY";
  else if (riskScore >= 35) verdict = "MEDIUM RISK";

  const explanations: Record<string, string> = {
    SAFE: "This contract appears relatively safe. No major red flags found. Always do your own research.",
    "MEDIUM RISK":
      "This contract has concerning patterns. Some features could manipulate the token. Proceed with care.",
    "HIGH RISK — HONEYPOT":
      "WARNING: Strong signs of a honeypot. You may buy but NOT sell. Do NOT invest.",
    "RUGPULL LIKELY":
      "DANGER: Multiple red flags consistent with rug pulls. Developers can likely drain funds.",
  };

  return {
    riskScore,
    verdict,
    explanation: explanations[verdict] || explanations["SAFE"],
    technicalDetails: findings.length
      ? findings
      : ["No specific risk patterns detected in automated scan"],
  };
}

export function getChainConfig(chainId: number) {
  return CHAIN_CONFIG[chainId];
}

export function getChainName(chainId: number): string {
  return CHAIN_CONFIG[chainId]?.name || "Unknown";
}

export function getChainExplorer(chainId: number): string {
  return CHAIN_CONFIG[chainId]?.explorer || "https://etherscan.io";
}

export function getSupportedChainIds(): number[] {
  return Object.keys(CHAIN_CONFIG).map(Number);
}

export function getAlchemyUrl(chainId: number, apiKey: string): string | null {
  const chain = CHAIN_CONFIG[chainId];
  if (!chain || !chain.alchemySubdomain) return null;
  return `https://${chain.alchemySubdomain}.g.alchemy.com/v2/${apiKey}`;
}
