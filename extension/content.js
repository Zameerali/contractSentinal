// ContractSentinel Content Script
// Injects scan badges on block explorer pages and shows result overlays

; (function () {
  'use strict'

  const CHAIN_MAP = {
    'etherscan.io': { chainId: '1', name: 'Ethereum' },
    'polygonscan.com': { chainId: '137', name: 'Polygon' },
    'arbiscan.io': { chainId: '42161', name: 'Arbitrum' },
    'optimistic.etherscan.io': { chainId: '10', name: 'Optimism' },
    'bscscan.com': { chainId: '56', name: 'BNB Chain' },
  }

  // Listen for scan results from popup
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'SCAN_RESULT') {
      showOverlay(message.data)
    }
  })

  // Detect current chain from hostname
  function detectChain() {
    const host = window.location.hostname.replace('www.', '')
    for (const [domain, info] of Object.entries(CHAIN_MAP)) {
      if (host.includes(domain)) return info
    }
    return null
  }

  // Detect contract address from URL
  function detectContract() {
    const url = window.location.href
    const match = url.match(/(?:address|token|contract)\/(0x[a-fA-F0-9]{40})/)
    return match ? match[1] : null
  }

  // Detect if we're on Uniswap
  function detectUniswapToken() {
    if (!window.location.hostname.includes('app.uniswap.org')) return null
    const url = new URL(window.location.href)
    const output = url.searchParams.get('outputCurrency')
    if (output && /^0x[a-fA-F0-9]{40}$/.test(output)) return output
    return null
  }

  // Show floating result overlay
  function showOverlay(data) {
    const existing = document.getElementById('cs-overlay')
    if (existing) existing.remove()

    const riskClass = data.riskScore <= 25 ? 'safe' : data.riskScore <= 70 ? 'warn' : 'danger'
    const colors = {
      safe: { bg: 'rgba(16, 185, 129, 0.95)', accent: '#10b981' },
      warn: { bg: 'rgba(245, 158, 11, 0.95)', accent: '#f59e0b' },
      danger: { bg: 'rgba(239, 68, 68, 0.95)', accent: '#ef4444' },
    }

    const c = colors[riskClass]
    const findingsCount = data.findings?.length || 0

    const overlay = document.createElement('div')
    overlay.id = 'cs-overlay'
    overlay.innerHTML = `
      <div class="cs-overlay-inner">
        <style>
          @keyframes csSlideIn { from { transform: translateX(120%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
          @keyframes csPulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.7; } }
          .cs-overlay-inner {
            position: fixed; top: 20px; right: 20px; z-index: 2147483647;
            width: 340px; border-radius: 16px; overflow: hidden;
            background: #18181b; border: 2px solid ${c.accent};
            box-shadow: 0 20px 60px rgba(0,0,0,0.5), 0 0 40px ${c.accent}33;
            font-family: system-ui, -apple-system, sans-serif;
            animation: csSlideIn 0.3s ease-out;
          }
          .cs-header {
            padding: 10px 16px;
            background: ${c.bg};
            color: white;
            display: flex; align-items: center; justify-content: space-between;
          }
          .cs-header-left { display: flex; align-items: center; gap: 8px; }
          .cs-close {
            background: none; border: none; color: white; cursor: pointer;
            font-size: 20px; padding: 0 4px; opacity: 0.8;
          }
          .cs-close:hover { opacity: 1; }
          .cs-body { padding: 16px; text-align: center; }
          .cs-score {
            font-size: 48px; font-weight: 900; color: ${c.accent};
            line-height: 1;
          }
          .cs-verdict {
            font-size: 14px; font-weight: 700; color: ${c.accent};
            margin-top: 6px;
          }
          .cs-contract-name {
            font-size: 12px; color: #a1a1aa; margin-top: 4px;
          }
          .cs-chain-badge {
            display: inline-flex; padding: 2px 8px; border-radius: 6px;
            font-size: 10px; font-weight: 600; margin-top: 8px;
            background: rgba(255,255,255,0.1); color: white;
          }
          .cs-summary {
            font-size: 12px; color: #a1a1aa; line-height: 1.6;
            margin-top: 12px; text-align: left;
            padding-top: 12px; border-top: 1px solid #27272a;
          }
          .cs-findings {
            font-size: 11px; color: #71717a; margin-top: 8px; text-align: left;
          }
          .cs-finding-item {
            padding: 6px 8px; margin: 3px 0; border-radius: 6px;
            background: #09090b; border: 1px solid #27272a;
            color: #d4d4d8; line-height: 1.4;
          }
          ${data.riskScore >= 80 ? `.cs-score { animation: csPulse 1.5s ease-in-out infinite; }` : ''}
        </style>
        <div class="cs-header">
          <div class="cs-header-left">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              <path d="M9 12l2 2 4-4"/>
            </svg>
            <span style="font-weight: 700; font-size: 13px;">ContractSentinel</span>
          </div>
          <button class="cs-close" onclick="document.getElementById('cs-overlay').remove()">×</button>
        </div>
        <div class="cs-body">
          <div class="cs-score">${data.riskScore}/100</div>
          <div class="cs-verdict">${escapeHtml(data.verdict || 'Unknown')}</div>
          ${data.contractName ? `<div class="cs-contract-name">${escapeHtml(data.contractName)}</div>` : ''}
          ${data.chainName ? `<div class="cs-chain-badge">${escapeHtml(data.chainName)}</div>` : ''}
          ${(data.summary || data.explanation) ? `<div class="cs-summary">${escapeHtml(data.summary || data.explanation)}</div>` : ''}
          ${findingsCount > 0 ? `
            <div class="cs-findings">
              <div style="font-weight:600;color:#a1a1aa;margin-bottom:4px;">${findingsCount} Finding${findingsCount > 1 ? 's' : ''}</div>
              ${data.findings.slice(0, 5).map(f => `
                <div class="cs-finding-item">${escapeHtml(f.title || f.pattern || '')}</div>
              `).join('')}
              ${findingsCount > 5 ? `<div style="color:#71717a;font-size:10px;margin-top:4px;">+ ${findingsCount - 5} more</div>` : ''}
            </div>
          ` : ''}
        </div>
      </div>
    `

    document.body.appendChild(overlay)

    // Auto-remove after 30 seconds
    setTimeout(() => {
      const el = document.getElementById('cs-overlay')
      if (el) {
        el.style.transition = 'opacity 0.5s'
        el.style.opacity = '0'
        setTimeout(() => el.remove(), 500)
      }
    }, 30000)
  }

  // Inject a scan badge next to the contract address on block explorer pages
  function injectScanBadge(address) {
    // Don't inject multiple badges
    if (document.getElementById('cs-scan-badge')) return

    // Find the address heading on etherscan-like sites
    const headingEl = document.querySelector('#mainaddress, #ContentPlaceHolder1_divSummary h1, [data-clipboard-text]')
    if (!headingEl) return

    const badge = document.createElement('span')
    badge.id = 'cs-scan-badge'
    badge.style.cssText = `
      display: inline-flex; align-items: center; gap: 4px;
      margin-left: 8px; padding: 4px 10px;
      background: linear-gradient(135deg, #10b981, #059669);
      color: white; border-radius: 6px; font-size: 12px;
      font-weight: 600; cursor: pointer;
      font-family: system-ui, -apple-system, sans-serif;
      vertical-align: middle;
      box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
      transition: all 0.2s;
    `
    badge.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        <path d="M9 12l2 2 4-4"/>
      </svg>
      Scan with ContractSentinel
    `
    badge.title = 'Click to scan this contract for honeypots & rug pulls'
    badge.addEventListener('mouseenter', () => {
      badge.style.transform = 'scale(1.05)'
      badge.style.boxShadow = '0 4px 16px rgba(16, 185, 129, 0.4)'
    })
    badge.addEventListener('mouseleave', () => {
      badge.style.transform = 'scale(1)'
      badge.style.boxShadow = '0 2px 8px rgba(16, 185, 129, 0.3)'
    })

    badge.addEventListener('click', async () => {
      badge.innerHTML = `
        <div style="width:14px;height:14px;border:2px solid rgba(255,255,255,0.3);border-top-color:white;border-radius:50%;animation:spin 0.6s linear infinite;"></div>
        Scanning...
      `
      badge.style.pointerEvents = 'none'

      const chain = detectChain()
      const stored = await chrome.storage.local.get(['authToken', 'serverUrl'])
      const serverUrl = stored.serverUrl || 'https://contract-sentinal.vercel.app'

      if (!stored.authToken) {
        badge.innerHTML = '⚠️ Sign in via extension popup first'
        badge.style.background = 'linear-gradient(135deg, #f59e0b, #d97706)'
        setTimeout(() => {
          badge.innerHTML = `
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              <path d="M9 12l2 2 4-4"/>
            </svg>
            Scan with ContractSentinel
          `
          badge.style.background = 'linear-gradient(135deg, #10b981, #059669)'
          badge.style.pointerEvents = 'auto'
        }, 3000)
        return
      }

      try {
        const res = await fetch(`${serverUrl}/api/scan`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${stored.authToken}`,
          },
          body: JSON.stringify({
            contractAddress: address,
            chainId: chain?.chainId || '1',
          }),
        })

        const data = await res.json()

        if (data.error) {
          badge.innerHTML = `⚠️ ${data.error}`
          badge.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)'
        } else {
          showOverlay({ ...data, chainName: chain?.name || 'Unknown' })

          const riskClass = data.riskScore <= 25 ? 'safe' : data.riskScore <= 70 ? 'warn' : 'danger'
          const colors = {
            safe: 'linear-gradient(135deg, #10b981, #059669)',
            warn: 'linear-gradient(135deg, #f59e0b, #d97706)',
            danger: 'linear-gradient(135deg, #ef4444, #dc2626)',
          }
          badge.style.background = colors[riskClass]
          badge.innerHTML = `${data.riskScore}/100 · ${data.verdict || 'Scanned'}`
        }
      } catch {
        badge.innerHTML = '⚠️ Server unreachable'
        badge.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)'
      }

      badge.style.pointerEvents = 'auto'
    })

    // Insert badge
    const parent = headingEl.parentElement
    if (parent) {
      parent.style.display = 'flex'
      parent.style.alignItems = 'center'
      parent.style.flexWrap = 'wrap'
      parent.appendChild(badge)
    }
  }

  function escapeHtml(text) {
    if (!text) return ''
    const div = document.createElement('div')
    div.textContent = text
    return div.innerHTML
  }

  // ── Init ──────────────────────────────────────────────────────
  const contractAddress = detectContract()
  const uniswapToken = detectUniswapToken()

  if (contractAddress) {
    console.log('[ContractSentinel] Contract detected:', contractAddress)
    // Wait for page to load fully before injecting badge
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => injectScanBadge(contractAddress))
    } else {
      // Small delay to let block explorer render
      setTimeout(() => injectScanBadge(contractAddress), 1500)
    }
  }

  if (uniswapToken) {
    console.log('[ContractSentinel] Uniswap token detected:', uniswapToken)
  }
})()
