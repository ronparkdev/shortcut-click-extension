import type { HotKey } from 'services/hotKey'

export type TargetConfig = {
  selector: string
  url: string
  hotKey: HotKey
}

export const ConfigService = {
  TARGETS_KEY: 'targets',
  FOCUSING_SELECTOR: 'focusingSelector',
  LAST_USED_URL_PATTERN: 'lastUsedUrlPattern',
}
