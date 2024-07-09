export type HotKey = Pick<KeyboardEvent, 'altKey' | 'ctrlKey' | 'metaKey' | 'shiftKey' | 'location' | 'key' | 'code'>

const HOTKEY_KEYS: (keyof HotKey)[] = ['altKey', 'ctrlKey', 'metaKey', 'shiftKey', 'location', 'code']

const LEGACY_HOTKEY_KEYS: (keyof HotKey)[] = ['altKey', 'ctrlKey', 'metaKey', 'shiftKey', 'location', 'key']

const parse = (event: KeyboardEvent) => {
  const { altKey, ctrlKey, metaKey, shiftKey, location, key } = event
  return { altKey, ctrlKey, metaKey, shiftKey, location, key: key.toUpperCase() }
}

const getText = (hotKey: HotKey) => {
  const keys = []
  // command(또는 cmd) ⌘
  // shift ⇧
  // option(또는 alt) ⌥
  // control(또는 ctrl) ⌃

  const isAppleDevice = navigator.userAgent.includes('Mac') || /iPad|iPhone|iPod/.test(navigator.userAgent)
  if (hotKey.altKey) keys.push(isAppleDevice ? 'Option(⌥)' : 'Alt')
  if (hotKey.ctrlKey) keys.push(isAppleDevice ? 'Control(⌃)' : 'Ctrl')
  if (hotKey.metaKey) keys.push(isAppleDevice ? 'Cmd(⌘)' : 'Cmd')
  if (hotKey.shiftKey) keys.push(isAppleDevice ? 'Shift(⇧)' : 'Shift')
  if (hotKey.location === 0) {
    if (hotKey.key === ' ') {
      keys.push('Space')
    } else {
      keys.push(hotKey.key.toUpperCase())
    }
  }
  return keys.join(' + ')
}

const isValid = (hotKey: HotKey | null) => {
  if (hotKey === null) {
    return false
  }

  return hotKey.location === 0
}

const checkIsSame = (hotKey1: HotKey, hotKey2: HotKey) => {
  return (
    HOTKEY_KEYS.every(key => hotKey1[key] === hotKey2[key]) ||
    LEGACY_HOTKEY_KEYS.every(key => hotKey1[key] === hotKey2[key])
  )
}

export const HotKeyService = { parse, getText, isValid, checkIsSame }
