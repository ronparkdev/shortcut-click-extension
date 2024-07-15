import { ConfigService, type TargetConfig } from 'services/config'

import { useChromeStorage } from './chromeStorage'

const DEFAULT_TARGETS: TargetConfig[] = []

const useTargetsConfig = () => {
  return useChromeStorage<TargetConfig[]>('local', ConfigService.TARGETS_KEY, DEFAULT_TARGETS)
}

export { useTargetsConfig }
