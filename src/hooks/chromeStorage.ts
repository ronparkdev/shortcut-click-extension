import { useState, useEffect, useCallback } from 'react'
import { ChromeStorageUtils } from 'utils/chromeStorage'

const useChromeStorage = <T>(key: string, initialValue: T) => {
  const [storedValue, setStoredValue] = useState<T>(initialValue)

  const getStoredValue = useCallback(async () => {
    try {
      const value = await ChromeStorageUtils.get<T>(key, initialValue)
      setStoredValue(value)
    } catch (error) {
      console.error(error)
    }
  }, [key, initialValue])

  const setValue = async (value: T) => {
    try {
      await ChromeStorageUtils.set<T>(key, value)
      setStoredValue(value)
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    getStoredValue()

    return ChromeStorageUtils.listen<T>(key, setStoredValue)
  }, [getStoredValue, key])

  return [storedValue, setValue] as const
}

export { useChromeStorage }
