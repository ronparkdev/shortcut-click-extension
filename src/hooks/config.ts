import { ConfigService, type TargetConfig } from 'services/config'

import { useChromeStorage } from './chromeStorage'

const useTargetsConfig = () => {
  return useChromeStorage<TargetConfig[]>('sync', ConfigService.TARGETS_KEY, [])
}

export { useTargetsConfig }
