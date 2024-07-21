const addLastSep = (urlString: string) => (urlString.endsWith('/') ? urlString : `${urlString}/`)

const removeLastSep = (urlString: string) =>
  urlString.endsWith('/') ? urlString.slice(0, urlString.length - 1) : urlString

const checkIsMatchedUrl = (urlPattern: string, url: string): boolean => {
  if (urlPattern.endsWith('/*')) {
    return addLastSep(url).startsWith(urlPattern.replace('/*', '/'))
  }

  return url === urlPattern
}

const getCurrentUrl = (urlString: string = window.location.href) => {
  const url = new URL(urlString)
  url.hash = ''
  url.search = ''
  return removeLastSep(url.toString())
}

const getCurrentTabUrl = async (): Promise<string> => {
  return await new Promise<string>(resolve => {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      const activeTab = tabs[0]
      resolve(getCurrentUrl(activeTab?.url ?? ''))
      if (activeTab && activeTab.url) {
        getCurrentUrl(activeTab.url)
      }
    })
  })
}

export const UrlUtils = { checkIsMatchedUrl, getCurrentUrl, getCurrentTabUrl }
