import { useState, useEffect } from 'react'

const useCurrentUrl = (): string => {
  const [currentUrl, setCurrentUrl] = useState<string>('')

  useEffect(() => {
    // Function to get the current tab's URL
    const getCurrentTabUrl = () => {
      chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        const activeTab = tabs[0]
        if (activeTab && activeTab.url) {
          setCurrentUrl(activeTab.url)
        }
      })
    }

    // Initial URL fetch
    getCurrentTabUrl()

    // Listener for URL changes
    const handleMessage = (message: { type: string; url: string }) => {
      if (message.type === 'URL_CHANGED') {
        setCurrentUrl(message.url)
      }
    }

    chrome.runtime.onMessage.addListener(handleMessage)

    // Cleanup listener on component unmount
    return () => {
      chrome.runtime.onMessage.removeListener(handleMessage)
    }
  }, [])

  return currentUrl
}

export default useCurrentUrl
