// ContractSentinel Service Worker

chrome.runtime.onInstalled.addListener(() => {
  console.log('[ContractSentinel] Extension installed')

  // Create context menu for right-click scanning
  chrome.contextMenus?.create({
    id: 'cs-scan-address',
    title: 'Scan with ContractSentinel',
    contexts: ['selection'],
  })
})

// Handle context menu clicks
chrome.contextMenus?.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === 'cs-scan-address') {
    const text = info.selectionText?.trim()
    if (text && /^0x[a-fA-F0-9]{40}$/.test(text)) {
      // Open popup with the selected address
      // Store it temporarily so popup can pick it up
      await chrome.storage.local.set({ pendingAddress: text })
      chrome.action.openPopup()
    }
  }
})

// Listen for tab updates to detect when user navigates to a block explorer
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    const isExplorer = [
      'etherscan.io', 'polygonscan.com', 'arbiscan.io',
      'optimistic.etherscan.io', 'bscscan.com', 'app.uniswap.org'
    ].some(domain => tab.url.includes(domain))

    if (isExplorer) {
      // Update badge to show extension is active on this page
      chrome.action.setBadgeBackgroundColor({ color: '#10b981', tabId })
      chrome.action.setBadgeText({ text: '●', tabId })
    }
  }
})
