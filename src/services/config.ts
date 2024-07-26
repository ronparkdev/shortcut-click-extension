import type { HotKey } from 'services/hotKey'

export type SavedTargetConfig = {
  selector: string
  url: string
  hotKey: HotKey
}

export type TargetConfig = SavedTargetConfig & {
  location: 'local' | 'sync'
}

export const ConfigService = {
  TARGETS_KEY: 'targets',
  FOCUSING_SELECTOR: 'focusingSelector',
  LAST_USED_URL_PATTERN: 'lastUsedUrlPattern',
}
