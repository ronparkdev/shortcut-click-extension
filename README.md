# Shortcut Click Extension

## Introduction
The **Shortcut Click** extension for Google Chrome allows users to perform click actions on specific areas of a webpage using custom keyboard shortcuts. This extension aims to enhance productivity by enabling users to automate repetitive clicking tasks.

## Features
- **Assign Shortcuts to Page Areas:** Define keyboard shortcuts that trigger click events on specific areas of a webpage.
- **Context Menu Integration:** Easily assign areas to shortcuts via the right-click context menu.
- **Active Tab and Scripting Permissions:** The extension can interact with the active tab and execute scripts as needed.

## Installation

* [Chrome Web Store](https://chromewebstore.google.com/detail/shortcut-click/jhmecpjngghgimacbfbajlpmcimnfihl)
* [Whale Web Store](https://store.whale.naver.com/detail/bpnlliiailidhhaclfbbhjkfbhfbadfd)

### Manual install

1. Clone the repository:
    ```sh
    git clone https://github.com/ronparkdev/shortcut-click-extension.git
    ```
2. Navigate to the extension directory:
    ```sh
    cd shortcut-click-extension
    ```
3. Load the extension into Chrome:
    - Open Chrome and navigate to `chrome://extensions/`.
    - Enable "Developer mode" by clicking the toggle switch in the top right corner.
    - Click "Load unpacked" and select the extension directory.

## Usage
1. **Assign Shortcuts:**
    - Right-click on the area of a webpage you want to assign a shortcut to.
    - Choose "Assign Shortcut" from the context menu.
    - In the popup, define the keyboard shortcut you want to use.

2. **Use Shortcuts:**
    - Press the defined keyboard shortcut to simulate a click on the assigned area of the webpage.

## Permissions
The extension requires the following permissions:
- `storage`: To store user-defined shortcuts.
- `activeTab`: To interact with the currently active tab.
- `contextMenus`: To add items to the right-click context menu.

## Development
For developers interested in contributing or customizing the extension:
1. Install dependencies:
    ```sh
    pnpm install
    ```
2. Build the extension:
    ```sh
    pnpm build
    ```
3. The build process compiles the TypeScript files and bundles them into the `dist` directory.

## License
This project is licensed under the BSD-3-Clause License.

## Contact
For questions or support, please open an issue on the [GitHub repository](https://github.com/ronparkdev/shortcut-click-extension).
