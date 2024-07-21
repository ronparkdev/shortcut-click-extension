import { ConfigService, type TargetConfig } from 'services/config'

import { useChromeStorage } from './chromeStorage'

const DEFAULT_TARGETS: TargetConfig[] = []

const useTargetsConfig = () => {
  return useChromeStorage<TargetConfig[]>('local', ConfigService.TARGETS_KEY, DEFAULT_TARGETS)
}

const useLastUsedUrlPattern = () => {
  return useChromeStorage<string | null>('local', ConfigService.LAST_USED_URL_PATTERN, null)
}

export { useTargetsConfig, useLastUsedUrlPattern }
