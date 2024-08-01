import { useCallback, useMemo } from 'react'

import { ConfigService, type SavedTargetConfig, type TargetConfig } from 'services/config'

import { useChromeStorage } from './chromeStorage'

const DEFAULT_TARGETS: SavedTargetConfig[] = []

const useTargetsConfig = () => {
  const [localConfigs, setLocalConfigs] = useChromeStorage<SavedTargetConfig[]>(
    'local',
    ConfigService.TARGETS_KEY,
    DEFAULT_TARGETS,
  )

  const [syncConfigs, setSyncConfigs] = useChromeStorage<SavedTargetConfig[]>(
    'sync',
    ConfigService.TARGETS_KEY,
    DEFAULT_TARGETS,
  )

  const configs = useMemo(
    (): TargetConfig[] => [
      ...syncConfigs.map(config => ({ ...config, location: 'sync' as const })),
      ...localConfigs.map(config => ({ ...config, location: 'local' as const })),
    ],
    [localConfigs, syncConfigs],
  )

  const setConfigs = useCallback(
    async (newConfigs: TargetConfig[]) => {
      const localConfigs = newConfigs
        .filter(({ location }) => location === 'local')
        .filter(({ selector, hotKey, url }) => ({ selector, hotKey, url }))

      const syncConfigs = newConfigs
        .filter(({ location }) => location === 'sync')
        .filter(({ selector, hotKey, url }) => ({ selector, hotKey, url }))

      // Try failable sync config first
      await setSyncConfigs(syncConfigs)
      await setLocalConfigs(localConfigs)
    },
    [setLocalConfigs, setSyncConfigs],
  )

  return [configs, setConfigs] as const
}

const useLastUsedUrlPattern = () => {
  return useChromeStorage<string | null>('local', ConfigService.LAST_USED_URL_PATTERN, null)
}

export { useTargetsConfig, useLastUsedUrlPattern }
