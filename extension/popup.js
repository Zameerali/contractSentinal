// ContractSentinel Browser Extension - Popup Script

let API_BASE = 'https://contract-sentinal.vercel.app'
let authToken = null
let userEmail = null

// ── DOM Elements ──────────────────────────────────────────────────────
const addressInput = document.getElementById('address')
const chainSelect = document.getElementById('chain')
const scanBtn = document.getElementById('scanBtn')
const resultDiv = document.getElementById('result')
const autoDetectDiv = document.getElementById('auto-detect')
const autoDetectText = document.getElementById('auto-detect-text')
const loginPrompt = document.getElementById('login-prompt')
const userBar = document.getElementById('user-bar')
const userEmailSpan = document.getElementById('user-email')
const logoutBtn = document.getElementById('logoutBtn')

// Login tab elements
const loginEmail = document.getElementById('login-email')
const loginPassword = document.getElementById('login-password')
const loginBtn = document.getElementById('loginBtn')
const loginStatus = document.getElementById('login-status')
const loginForm = document.getElementById('login-form')
const loggedInInfo = document.getElementById('logged-in-info')
const loggedInEmail = document.getElementById('logged-in-email')

// Settings tab elements
const serverUrlInput = document.getElementById('server-url')
const saveSettingsBtn = document.getElementById('saveSettingsBtn')
const settingsStatus = document.getElementById('settings-status')

// Tabs
const tabs = document.querySelectorAll('.tab')
const tabContents = document.querySelectorAll('.tab-content')

// Chain name map
const CHAIN_NAMES = {
  '1': 'Ethereum',
  '137': 'Polygon',
  '42161': 'Arbitrum',
  '10': 'Optimism',
  '56': 'BNB Chain'
}

// ── Initialize ──────────────────────────────────────────────────────

// Helper to update button state based on auth and address
function updateScanButtonState() {
  const addressValid = /^0x[a-fA-F0-9]{40}$/.test(addressInput.value.trim())
  scanBtn.disabled = !authToken || !addressValid
}

async function init() {
  // Load saved settings
  const stored = await chrome.storage.local.get(['authToken', 'userEmail', 'serverUrl'])
  if (stored.serverUrl) {
    API_BASE = stored.serverUrl
    serverUrlInput.value = stored.serverUrl
  } else {
    serverUrlInput.value = API_BASE
  }

  if (stored.authToken) {
    authToken = stored.authToken
    userEmail = stored.userEmail || 'User'
    showLoggedIn()
  }

  // Validate address input and update button state
  addressInput.addEventListener('input', () => {
    updateScanButtonState()
  })

  // Auto-detect contract from current tab URL
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    if (tab?.url) {
      const url = tab.url
      const addrMatch = url.match(/(?:address|token)\/(0x[a-fA-F0-9]{40})/)
      if (addrMatch) {
        addressInput.value = addrMatch[1]
        updateScanButtonState()
        autoDetectDiv.classList.remove('hidden')

        // Auto-detect chain from explorer URL
        if (url.includes('polygonscan.com')) {
          chainSelect.value = '137'
          autoDetectText.textContent = 'Polygon contract detected'
        } else if (url.includes('arbiscan.io')) {
          chainSelect.value = '42161'
          autoDetectText.textContent = 'Arbitrum contract detected'
        } else if (url.includes('optimistic.etherscan.io')) {
          chainSelect.value = '10'
          autoDetectText.textContent = 'Optimism contract detected'
        } else if (url.includes('bscscan.com')) {
          chainSelect.value = '56'
          autoDetectText.textContent = 'BNB Chain contract detected'
        } else if (url.includes('etherscan.io')) {
          chainSelect.value = '1'
          autoDetectText.textContent = 'Ethereum contract detected'
        }
      }

      // Try to detect contract on Uniswap swap page
      if (url.includes('app.uniswap.org') && url.includes('swap')) {
        // Try to extract output token from the URL query params
        const urlObj = new URL(url)
        const outputCurrency = urlObj.searchParams.get('outputCurrency')
        if (outputCurrency && /^0x[a-fA-F0-9]{40}$/.test(outputCurrency)) {
          addressInput.value = outputCurrency
          updateScanButtonState()
          autoDetectDiv.classList.remove('hidden')
          autoDetectText.textContent = 'Token detected from Uniswap'
        }
      }
    }
  } catch (err) {
    console.log('Could not auto-detect address:', err)
  }
}

// ── Tab Navigation ──────────────────────────────────────────────────
tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    tabs.forEach(t => t.classList.remove('active'))
    tabContents.forEach(tc => tc.classList.remove('active'))
    tab.classList.add('active')
    document.getElementById(`tab-${tab.dataset.tab}`).classList.add('active')
  })
})

// ── Auth: Login ──────────────────────────────────────────────────────
loginBtn.addEventListener('click', async () => {
  const email = loginEmail.value.trim()
  const password = loginPassword.value.trim()
  if (!email || !password) {
    showStatus(loginStatus, 'Enter email and password', 'error')
    return
  }

  loginBtn.disabled = true
  loginBtn.innerHTML = '<div class="spinner"></div> Signing in...'

  try {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    const data = await res.json()

    if (data.error) {
      showStatus(loginStatus, data.error, 'error')
    } else if (data.accessToken) {
      authToken = data.accessToken
      userEmail = data.user?.email || email
      await chrome.storage.local.set({ authToken, userEmail })
      showLoggedIn()
      updateScanButtonState()
      showStatus(loginStatus, 'Signed in successfully!', 'success')
      // Switch to scan tab
      setTimeout(() => {
        tabs[0].click()
      }, 500)
    } else {
      showStatus(loginStatus, 'Unexpected response from server', 'error')
    }
  } catch (err) {
    showStatus(loginStatus, `Connection error: Is the server running at ${API_BASE}?`, 'error')
  } finally {
    loginBtn.disabled = false
    loginBtn.textContent = 'Sign In'
  }
})

// Allow Enter key in login form
loginPassword.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') loginBtn.click()
})

// ── Auth: Logout ──────────────────────────────────────────────────────
logoutBtn.addEventListener('click', async () => {
  authToken = null
  userEmail = null
  await chrome.storage.local.remove(['authToken', 'userEmail'])
  updateScanButtonState()
  showLoggedOut()
})

// ── Settings ──────────────────────────────────────────────────────
saveSettingsBtn.addEventListener('click', async () => {
  let url = serverUrlInput.value.trim()
  if (!url) url = 'https://contract-sentinal.vercel.app'
  // Remove trailing slash
  url = url.replace(/\/+$/, '')
  API_BASE = url
  await chrome.storage.local.set({ serverUrl: url })
  showStatus(settingsStatus, 'Settings saved!', 'success')
})

// ── Scan ──────────────────────────────────────────────────────
scanBtn.addEventListener('click', async () => {
  const address = addressInput.value.trim()
  const chain = chainSelect.value

  if (!/^0x[a-fA-F0-9]{40}$/.test(address)) return

  // Check if logged in
  if (!authToken) {
    loginPrompt.classList.remove('hidden')
    return
  }
  loginPrompt.classList.add('hidden')

  scanBtn.disabled = true
  scanBtn.innerHTML = '<div class="spinner"></div> Scanning...'
  resultDiv.innerHTML = ''

  try {
    const res = await fetch(`${API_BASE}/api/scan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify({ contractAddress: address, chainId: chain }),
    })

    // Handle 401 - token expired
    if (res.status === 401) {
      authToken = null
      await chrome.storage.local.remove(['authToken'])
      showLoggedOut()
      loginPrompt.classList.remove('hidden')
      resultDiv.innerHTML = `
        <div class="result danger">
          <div class="verdict" style="color: #ef4444;">Session Expired</div>
          <div class="summary">Please sign in again from the Account tab.</div>
        </div>
      `
      return
    }

    const data = await res.json()

    if (data.error) {
      resultDiv.innerHTML = `
        <div class="result danger">
          <div class="verdict" style="color: #ef4444;">Error</div>
          <div class="summary">${escapeHtml(data.error)}</div>
        </div>
      `
    } else {
      const riskClass = data.riskScore <= 25 ? 'safe' : data.riskScore <= 70 ? 'warn' : 'danger'
      const riskColor = riskClass === 'safe' ? '#10b981' : riskClass === 'warn' ? '#f59e0b' : '#ef4444'
      const chainName = CHAIN_NAMES[chain] || 'Unknown'

      let findingsHtml = ''
      if (data.findings?.length > 0) {
        findingsHtml = `
          <div style="margin-top:12px; border-top: 1px solid #27272a; padding-top: 12px;">
            <div style="font-size:11px;font-weight:600;color:#a1a1aa;margin-bottom:6px;text-transform:uppercase;letter-spacing:0.5px;">
              Findings (${data.findings.length})
            </div>
            ${data.findings.map(f => `
              <div class="finding ${f.severity || 'low'}">
                ${escapeHtml(f.title || f.pattern || 'Unknown finding')}
              </div>
            `).join('')}
          </div>
        `
      }

      resultDiv.innerHTML = `
        <div class="result ${riskClass}">
          <div class="chain-badge">${chainName}</div>
          <div class="score ${riskClass}">${data.riskScore}/100</div>
          <div class="verdict" style="color: ${riskColor}">
            ${escapeHtml(data.verdict || 'Unknown')}
          </div>
          ${data.contractName ? `<div style="text-align:center;font-size:13px;color:#a1a1aa;margin-bottom:8px">${escapeHtml(data.contractName)}</div>` : ''}
          ${(data.summary || data.explanation) ? `<div class="summary">${escapeHtml(data.summary || data.explanation)}</div>` : ''}
          ${findingsHtml}
          <a href="${API_BASE}/dashboard/scan/${data.id}" target="_blank" class="view-btn">View Full Report →</a>
        </div>
      `

      // Send result to content script for page overlay
      try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
        if (tab?.id) {
          chrome.tabs.sendMessage(tab.id, {
            type: 'SCAN_RESULT',
            data: { ...data, chainName }
          })
        }
      } catch { }
    }
  } catch (err) {
    resultDiv.innerHTML = `
      <div class="result danger">
        <div class="verdict" style="color: #ef4444;">Connection Error</div>
        <div class="summary">Could not connect to ContractSentinel server at ${escapeHtml(API_BASE)}. Make sure the app is running.</div>
      </div>
    `
  } finally {
    scanBtn.disabled = false
    scanBtn.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
      </svg>
      Scan Contract
    `
  }
})

// ── UI Helpers ──────────────────────────────────────────────────────
function showLoggedIn() {
  userBar.classList.remove('hidden')
  userEmailSpan.textContent = userEmail
  loginForm.classList.add('hidden')
  loggedInInfo.classList.remove('hidden')
  loggedInEmail.textContent = userEmail
  loginPrompt.classList.add('hidden')
}

function showLoggedOut() {
  userBar.classList.add('hidden')
  loginForm.classList.remove('hidden')
  loggedInInfo.classList.add('hidden')
}

function showStatus(el, message, type) {
  el.innerHTML = `<div class="status-msg ${type}">${escapeHtml(message)}</div>`
  setTimeout(() => { el.innerHTML = '' }, 5000)
}

function escapeHtml(text) {
  if (!text) return ''
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

// ── Start ──────────────────────────────────────────────────────
init()
