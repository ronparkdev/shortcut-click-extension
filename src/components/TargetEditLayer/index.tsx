import React from "react"

export const TargetEditLayer = () => {
    return <>Test</>
}

// let lastMousePosition: { x: number; y: number } | null = null;

// document.addEventListener("mousemove", (event) => {
//   lastMousePosition = {
//     x: event.pageX,
//     y: event.pageY,
//   };
// });

// function openShortcutDialog() {
//   if (!lastMousePosition) return null;
//   const element = document.elementFromPoint(
//     lastMousePosition.x,
//     lastMousePosition.y
//   );

//   const initialSelector = getElementSelector(element);

//   let dialog = document.createElement("div");
//   dialog.id = "shortcut-dialog";
//   dialog.style.position = "fixed";
//   dialog.style.top = "50%";
//   dialog.style.left = "50%";
//   dialog.style.transform = "translate(-50%, -50%)";
//   dialog.style.padding = "20px";
//   dialog.style.backgroundColor = "white";
//   dialog.style.border = "1px solid black";
//   dialog.style.zIndex = 10000;

//   dialog.innerHTML = `
//       <label for="element-selector">Select Element:</label>
//       <input type="range" id="element-selector" name="element-selector" min="0" max="10">
//       <span id="element-display">${initialSelector}</span>
//       <label for="site-selector">Select Site:</label>
//       <input type="range" id="site-selector" name="site-selector" min="0" max="2">
//       <label for="key-selector">Shortcut Key:</label>
//       <input type="text" id="key-selector" name="key-selector">
//       <button id="save-shortcut">Save</button>
//     `;

//   document.body.appendChild(dialog);

//   const elSelector = document.getElementById("element-selector");

//   document
//     .getElementById("element-selector")
//     .addEventListener("input", (event) => {
//       document.getElementById("element-display").textContent = getSelectorPath(
//         event.target.value
//       );
//     });

//   document.getElementById("save-shortcut").addEventListener("click", () => {
//     let elementSelector =
//       document.getElementById("element-display").textContent;
//     let siteSelector = document.getElementById("site-selector").value;
//     let keySelector = document.getElementById("key-selector").value;

//     let selectedSite = ["current", "wildcard", "super-wildcard"][siteSelector];

//     chrome.storage.sync.get("shortcuts", (data) => {
//       let shortcuts = data.shortcuts || [];
//       shortcuts.push({
//         element: elementSelector,
//         site: selectedSite,
//         key: keySelector,
//       });

//       chrome.storage.sync.set({ shortcuts }, () => {
//         alert("Shortcut saved!");
//         dialog.remove();
//       });
//     });
//   });

//   function getSelectorPath(value) {
//     return initialSelector;
//   }
// }

// // Listen for keydown events to trigger shortcuts
// // document.addEventListener('keydown', (event) => {
// //   chrome.storage.sync.get('shortcuts', (data) => {
// //     let shortcuts = data.shortcuts || [];
// //     let currentURL = window.location.href;

// //     shortcuts.forEach((shortcut) => {
// //       if (shortcut.key === event.key) {
// //         if (matchSite(currentURL, shortcut.site)) {
// //           let targetElement = document.querySelector(shortcut.element);
// //           if (targetElement) {
// //             targetElement.click();
// //           }
// //         }
// //       }
// //     });
// //   });
// // });

// function matchSite(currentURL, sitePattern) {
//   if (sitePattern === "current") {
//     return currentURL === window.location.href;
//   } else if (sitePattern === "wildcard") {
//     let wildcardPattern = new RegExp("^" + sitePattern.replace(/\*/g, ".*"));
//     return wildcardPattern.test(currentURL);
//   } else if (sitePattern === "super-wildcard") {
//     return true;
//   }
//   return false;
// }

// function getElementSelector(element) {
//   if (!element) return null;
//   let path = [];
//   while (element.parentElement) {
//     let tag = element.tagName.toLowerCase();
//     if (element.id) {
//       tag += `#${element.id}`;
//       path.unshift(tag);
//       break;
//     } else {
//       let siblingIndex = 0;
//       for (let sibling of element.parentElement.children) {
//         if (sibling === element) break;
//         if (sibling.tagName === element.tagName) siblingIndex++;
//       }
//       tag += `:nth-of-type(${siblingIndex + 1})`;
//     }
//     path.unshift(tag);
//     element = element.parentElement;
//   }
//   return path.join(" > ");
// }
