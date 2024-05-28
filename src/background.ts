chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "addShortcut",
    title: "Add Shortcut",
    contexts: ["all"],
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "addShortcut" && tab?.id) {
    chrome.tabs.sendMessage(tab.id, { action: "openShortcutDialog" });
  }
});
