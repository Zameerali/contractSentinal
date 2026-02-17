# ContractSentinel 🛡️

**Scan any token. Protect your portfolio. Stop the next rug pull.**

AI-powered smart contract security analyzer that detects honeypot contracts, rug pulls, and hidden exploits before you invest.

## Features

- **AI-Powered Analysis** — Gemini 2.0 Flash scans source code for vulnerabilities
- **Known Scam Database** — Cross-reference against known malicious contracts
- **Batch Scanning** — Scan up to 10 contracts at once
- **Portfolio Scanner** — Analyze all token holdings in a wallet
- **PDF Reports** — Generate detailed security reports (Ctrl+P to save)
- **Multi-Chain** — Ethereum and Polygon support
- **Admin Dashboard** — User management, audit logs, system stats
- **Browser Extension** — Scan directly from Etherscan (Chrome MV3)
- **Real-time Risk Gauge** — Animated canvas-based risk visualization
- **Honeypot Detection** — Visual overlay warning + confetti on SAFE

## Tech Stack

- **Frontend:** Next.js 15, React 19, TypeScript, Tailwind CSS
- **UI Components:** Custom Headless UI + pre-built design system
- **Auth:** Custom JWT (argon2id + jose), refresh token rotation, reuse detection
- **Database:** Prisma ORM + Supabase PostgreSQL
- **AI:** Google Gemini 2.0 Flash via REST API
- **Block Explorer:** Etherscan V2 API
- **Charts:** Canvas-based animated risk gauge

## Getting Started

### Prerequisites

- Node.js 18+
- Supabase PostgreSQL database
- Etherscan API key
- Gemini API key

### Installation

```bash
cd contract-sentinel
npm install
```

### Environment Setup

Create a `.env` file (already included with template values):

```env
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
JWT_ACCESS_SECRET="your-access-secret"
JWT_REFRESH_SECRET="your-refresh-secret"
ETHERSCAN_API_KEY="your-etherscan-key"
GEMINI_API_KEY="your-gemini-key"
```

### Database Setup

```bash
npx prisma generate
npx prisma db push
```

### Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3001](http://localhost:3001)

### Build for Production

```bash
npm run build
npm start
```

## Demo Addresses

Try scanning these contracts:

| Contract | Address | Expected Result |
|----------|---------|-----------------|
| Tether (USDT) | `0xdAC17F958D2ee523a2206206994597C13D831ec7` | SAFE |
| USD Coin (USDC) | `0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48` | SAFE |
| DAI Stablecoin | `0x6B175474E89094C44Da98b954EedeAC495271d0F` | SAFE |

## Project Structure

```
contract-sentinel/
├── src/
│   ├── app/
│   │   ├── page.tsx                    # Landing page
│   │   ├── login/page.tsx              # Login page
│   │   ├── register/page.tsx           # Register page
│   │   ├── dashboard/
│   │   │   ├── layout.tsx              # Protected dashboard layout
│   │   │   ├── page.tsx                # Dashboard home
│   │   │   ├── scan/page.tsx           # Single scan
│   │   │   ├── scan/[id]/page.tsx      # Scan detail/report
│   │   │   ├── batch/page.tsx          # Batch scan
│   │   │   ├── portfolio/page.tsx      # Portfolio scanner
│   │   │   ├── history/page.tsx        # Scan history
│   │   │   └── admin/
│   │   │       ├── page.tsx            # Admin panel
│   │   │       └── audit/page.tsx      # Audit logs
│   │   └── api/
│   │       ├── auth/                   # Auth endpoints
│   │       ├── scan/                   # Scan endpoints
│   │       ├── batch-scan/             # Batch scan
│   │       ├── portfolio/              # Portfolio scanner
│   │       ├── report/pdf/             # PDF report generation
│   │       └── admin/                  # Admin endpoints
│   ├── components/
│   │   ├── layout/DashboardLayout.tsx  # Sidebar + header
│   │   ├── RiskGauge.tsx               # Animated risk gauge
│   │   └── providers/AuthProvider.tsx  # Auth context
│   └── lib/
│       ├── auth.ts                     # JWT auth system
│       ├── audit.ts                    # Audit logging
│       ├── llm.ts                      # Gemini AI + Etherscan
│       ├── prisma.ts                   # Database client
│       ├── rate-limit.ts               # Rate limiting
│       ├── scam-check.ts              # Known scam database
│       └── utils.ts                    # Utilities
├── extension/                          # Chrome extension (MV3)
│   ├── manifest.json
│   ├── popup.html / popup.js
│   ├── content.js / content.css
│   └── background.js
├── prisma/schema.prisma               # Database schema
└── package.json
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/refresh` | Refresh tokens |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/scan` | Scan single contract |
| GET | `/api/scan` | Get scan history |
| POST | `/api/batch-scan` | Batch scan (up to 10) |
| POST | `/api/portfolio` | Portfolio scan |
| GET | `/api/report/pdf` | Generate HTML report |
| GET | `/api/admin/stats` | Admin statistics |
| GET/PATCH | `/api/admin/users` | Admin user management |
| GET/DELETE | `/api/admin/scans` | Admin scan management |
| GET | `/api/admin/audit-logs` | Audit logs |

## Browser Extension

1. Open `chrome://extensions` in Chrome
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `extension/` folder
5. Navigate to Etherscan — the extension auto-detects contract addresses

## Security Features

- **argon2id** password hashing
- **JWT access tokens** (15-minute expiry)
- **Refresh token rotation** with reuse detection
- **httpOnly cookies** for refresh tokens
- **Rate limiting** (per-user and per-IP)
- **Audit logging** for all sensitive actions
- **Admin user ban/promote** controls

## License

Built for hackathon demonstration. Not financial advice.
