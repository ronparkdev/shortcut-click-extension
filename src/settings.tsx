// document.addEventListener("DOMContentLoaded", () => {
//   loadShortcuts();

//   document.getElementById("clear-shortcuts").addEventListener("click", () => {
//     chrome.storage.sync.clear(() => {
//       loadShortcuts();
//       alert("All shortcuts cleared.");
//     });
//   });
// });

// function loadShortcuts() {
//   chrome.storage.sync.get(["shortcut"], (result) => {
//     const shortcutsList = document.getElementById("shortcuts-list");
//     shortcutsList.innerHTML = "";

//     if (result.shortcut) {
//       const shortcut = result.shortcut;
//       const shortcutItem = document.createElement("div");
//       shortcutItem.textContent = `Element: ${shortcut.element}, Site: ${shortcut.site}, Key: ${shortcut.key}`;
//       shortcutsList.appendChild(shortcutItem);
//     } else {
//       shortcutsList.textContent = "No shortcuts set.";
//     }
//   });
// }
