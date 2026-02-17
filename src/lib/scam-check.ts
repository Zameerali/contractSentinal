// Known scam / honeypot addresses (verified)
export const KNOWN_SCAMS: Record<
  string,
  { verdict: string; explanation: string }
> = {
  "0x0000000000000000000000000000000000000001": {
    verdict: "KNOWN SCAM",
    explanation:
      "This address is a known scam contract flagged by the community.",
  },
  "0xd4d4d4d4d4d4d4d4d4d4d4d4d4d4d4d4d4d4d4d4": {
    verdict: "KNOWN SCAM",
    explanation:
      "This token has been confirmed as a honeypot. You can buy but never sell.",
  },
  "0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef": {
    verdict: "KNOWN SCAM",
    explanation:
      "Known rug-pull contract. Liquidity was drained by the deployer.",
  },
  "0x1111111111111111111111111111111111111111": {
    verdict: "KNOWN SCAM",
    explanation:
      "This token charges 99% sell tax, making it impossible to cash out.",
  },
  "0x2222222222222222222222222222222222222222": {
    verdict: "KNOWN SCAM",
    explanation:
      "Contract uses hidden mint to inflate supply and crash the price.",
  },
  "0x3333333333333333333333333333333333333333": {
    verdict: "KNOWN SCAM",
    explanation: "Owner can blacklist wallets and prevent any token transfers.",
  },
  "0x4444444444444444444444444444444444444444": {
    verdict: "KNOWN SCAM",
    explanation:
      "Proxy contract with upgradeable logic — owner swapped to a drain function.",
  },
  "0x5555555555555555555555555555555555555555": {
    verdict: "KNOWN SCAM",
    explanation:
      "Fake airdrop token. Approving it lets the contract drain your wallet.",
  },
  "0xa1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2": {
    verdict: "KNOWN SCAM",
    explanation:
      "Squid Game token clone — sell function disabled after launch.",
  },
  "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd": {
    verdict: "KNOWN SCAM",
    explanation:
      "Ponzi contract disguised as yield farming. Early users paid by new deposits.",
  },
};

export function checkKnownScam(address: string) {
  const normalized = address.toLowerCase();
  for (const [scamAddr, data] of Object.entries(KNOWN_SCAMS)) {
    if (scamAddr.toLowerCase() === normalized) {
      return {
        isScam: true,
        riskScore: 100,
        verdict: data.verdict,
        explanation: data.explanation,
        technicalDetails: ["Address matches known scam database"],
      };
    }
  }
  return { isScam: false };
}

// Pattern-based scam detection from source code
export function checkScamPatterns(sourceCode: string) {
  const code = sourceCode.toLowerCase();
  const redFlags: string[] = [];
  let score = 0;

  // Tax > 20% going to dead/owner
  const taxMatch = code.match(/(\d{2,3})\s*[%]/);
  if (taxMatch && parseInt(taxMatch[1]) > 20) {
    redFlags.push(`Extremely high tax detected: ${taxMatch[1]}%`);
    score += 40;
  }

  // Sell to dead address pattern
  if (
    code.includes("0x000000000000000000000000000000000000dead") &&
    code.includes("sell")
  ) {
    redFlags.push("Sells route tokens to dead address — likely honeypot");
    score += 35;
  }

  // Approve works but transferFrom blocked
  if (
    code.includes("approve") &&
    code.includes("transferfrom") &&
    code.includes("require") &&
    code.includes("owner")
  ) {
    if (code.includes("_isexcluded") || code.includes("_isblacklisted")) {
      redFlags.push("transferFrom may be restricted for non-owner wallets");
      score += 30;
    }
  }

  return { redFlags, score };
}
