export type StorageType = 'sync' | 'local' | 'session'

export const get = async <T>(type: StorageType, key: string, initialValue: T): Promise<T> => {
  return new Promise((resolve, reject) => {
    chrome.storage[type].get([key], result => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError)
      } else {
        resolve(result[key] ?? initialValue)
      }
    })
  })
}

export const set = async <T>(type: StorageType, key: string, value: T): Promise<void> => {
  return new Promise((resolve, reject) => {
    chrome.storage[type].set({ [key]: value }, () => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError)
      } else {
        resolve()
      }
    })
  })
}

export const listen = <T>(type: StorageType, key: string, callback: (newValue: T) => void): (() => void) => {
  const handleStorageChange = (changes: { [key: string]: chrome.storage.StorageChange }) => {
    if (changes[key]) {
      callback(changes[key].newValue)
    }
  }

  chrome.storage[type].onChanged.addListener(handleStorageChange)

  // Return a cleanup function to remove the listener
  return () => {
    chrome.storage[type].onChanged.removeListener(handleStorageChange)
  }
}

export const ChromeStorageUtils = {
  get,
  set,
  listen,
}
