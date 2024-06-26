import { ConfigService, type TargetConfig } from 'services/config'

import { useChromeStorage } from './chromeStorage'

const useTargetsConfig = () => {
  return useChromeStorage<TargetConfig[]>('local', ConfigService.TARGETS_KEY, [])
}

export { useTargetsConfig }
