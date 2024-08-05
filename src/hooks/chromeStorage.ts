import { useState, useEffect, useCallback } from 'react'

import type { StorageType } from 'utils/chromeStorage'
import { ChromeStorageUtils } from 'utils/chromeStorage'

const useChromeStorage = <T>(type: StorageType, key: string, initialValue: T) => {
  const [storedValue, setStoredValue] = useState<T>(initialValue)

  const getStoredValue = useCallback(async () => {
    try {
      const value = await ChromeStorageUtils.get<T>(type, key, initialValue)
      setStoredValue(value)
    } catch (error) {
      console.error(error)
    }
  }, [key, initialValue])

  const setValue = useCallback(
    async (value: T, { force = false }: { force?: boolean } = {}) => {
      const isSameValue = JSON.stringify(storedValue) === JSON.stringify(value)

      if (isSameValue && !force) {
        // console.log('skipped by same value', { type, key, storedValue, value, force })
        return
      }

      await ChromeStorageUtils.set<T>(type, key, value)
      setStoredValue(value)
    },
    [storedValue],
  )

  useEffect(() => {
    getStoredValue()

    return ChromeStorageUtils.listen<T>(type, key, setStoredValue)
  }, [getStoredValue, key])

  return [storedValue, setValue] as const
}

export { useChromeStorage }
