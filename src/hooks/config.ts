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
      ...localConfigs.map(config => ({ ...config, location: 'local' as const })),
      ...syncConfigs.map(config => ({ ...config, location: 'sync' as const })),
    ],
    [localConfigs, syncConfigs],
  )

  const setConfigs = useCallback(async (configs: TargetConfig[]) => {
    const localConfigs = configs
      .filter(({ location }) => location === 'local')
      .filter(({ selector, hotKey, url }) => ({ selector, hotKey, url }))

    const syncConfigs = configs
      .filter(({ location }) => location === 'sync')
      .filter(({ selector, hotKey, url }) => ({ selector, hotKey, url }))

    await Promise.all([setLocalConfigs(localConfigs), setSyncConfigs(syncConfigs)])
  }, [])

  return [configs, setConfigs] as const
}

const useLastUsedUrlPattern = () => {
  return useChromeStorage<string | null>('local', ConfigService.LAST_USED_URL_PATTERN, null)
}

export { useTargetsConfig, useLastUsedUrlPattern }
