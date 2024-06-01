export const get = async <T>(key: string, initialValue: T): Promise<T> => {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get([key], result => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError)
      } else {
        resolve(result[key] ?? initialValue)
      }
    })
  })
}

export const set = async <T>(key: string, value: T): Promise<void> => {
  return new Promise((resolve, reject) => {
    chrome.storage.local.set({ [key]: value }, () => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError)
      } else {
        resolve()
      }
    })
  })
}

export const listen = <T>(key: string, callback: (newValue: T) => void): (() => void) => {
  const handleStorageChange = (changes: { [key: string]: chrome.storage.StorageChange }) => {
    if (changes[key]) {
      callback(changes[key].newValue)
    }
  }

  chrome.storage.local.onChanged.addListener(handleStorageChange)

  // Return a cleanup function to remove the listener
  return () => {
    chrome.storage.local.onChanged.removeListener(handleStorageChange)
  }
}

export const ChromeStorageUtils = {
  get,
  set,
  listen,
}
