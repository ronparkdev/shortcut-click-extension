import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { TargetEditLayer } from './components/TargetEditLayer'

// Listen for messages from the background script
chrome.runtime.onMessage.addListener(request => {
  console.log(request)
  if (request.action === 'openShortcutDialog') {
    const root = createRoot(document.getElementById('root')!)

    root.render(
      <StrictMode>
        <TargetEditLayer />
      </StrictMode>,
    )
  }
})
