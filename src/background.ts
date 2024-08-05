const isDevelopment = process.env.NODE_ENV === 'development'

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'addShortcut',
    title: `${isDevelopment ? '[D]' : ''}Set Shortcut`,
    contexts: ['all'],
  })
})

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'addShortcut' && tab?.id) {
    chrome.tabs.sendMessage(tab.id, { action: 'openShortcutDialog' })
  }
})
