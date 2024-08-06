export type HotKey = Pick<KeyboardEvent, 'altKey' | 'ctrlKey' | 'metaKey' | 'shiftKey' | 'location' | 'key' | 'code'>

const HOTKEY_KEYS: (keyof HotKey)[] = ['altKey', 'ctrlKey', 'metaKey', 'shiftKey', 'location', 'code']

const LEGACY_HOTKEY_KEYS: (keyof HotKey)[] = ['altKey', 'ctrlKey', 'metaKey', 'shiftKey', 'location', 'key']

const KEYS = [
  { key: 'Backspace', code: 'Backspace' },
  { key: 'Tab', code: 'Tab' },
  { key: 'Enter', code: 'Enter' },
  { key: 'Shift', code: 'ShiftLeft' },
  { key: 'Shift', code: 'ShiftRight' },
  { key: 'Control', code: 'ControlLeft' },
  { key: 'Control', code: 'ControlRight' },
  { key: 'Alt', code: 'AltLeft' },
  { key: 'Alt', code: 'AltRight' },
  { key: 'Pause', code: 'Pause' },
  { key: 'CapsLock', code: 'CapsLock' },
  { key: 'Escape', code: 'Escape' },
  { key: '', code: 'Space' },
  { key: 'PageUp', code: 'PageUp' },
  { key: 'PageDown', code: 'PageDown' },
  { key: 'End', code: 'End' },
  { key: 'Home', code: 'Home' },
  { key: 'ArrowLeft', code: 'ArrowLeft' },
  { key: 'ArrowUp', code: 'ArrowUp' },
  { key: 'ArrowRight', code: 'ArrowRight' },
  { key: 'ArrowDown', code: 'ArrowDown' },
  { key: 'PrintScreen', code: 'PrintScreen' },
  { key: 'Insert', code: 'Insert' },
  { key: 'Delete', code: 'Delete' },
  { key: '0', code: 'Digit0' },
  { key: '1', code: 'Digit1' },
  { key: '2', code: 'Digit2' },
  { key: '3', code: 'Digit3' },
  { key: '4', code: 'Digit4' },
  { key: '5', code: 'Digit5' },
  { key: '6', code: 'Digit6' },
  { key: '7', code: 'Digit7' },
  { key: '8', code: 'Digit8' },
  { key: '9', code: 'Digit9' },
  { key: 'A', code: 'KeyA' },
  { key: 'B', code: 'KeyB' },
  { key: 'C', code: 'KeyC' },
  { key: 'D', code: 'KeyD' },
  { key: 'E', code: 'KeyE' },
  { key: 'F', code: 'KeyF' },
  { key: 'G', code: 'KeyG' },
  { key: 'H', code: 'KeyH' },
  { key: 'I', code: 'KeyI' },
  { key: 'J', code: 'KeyJ' },
  { key: 'K', code: 'KeyK' },
  { key: 'L', code: 'KeyL' },
  { key: 'M', code: 'KeyM' },
  { key: 'N', code: 'KeyN' },
  { key: 'O', code: 'KeyO' },
  { key: 'P', code: 'KeyP' },
  { key: 'Q', code: 'KeyQ' },
  { key: 'R', code: 'KeyR' },
  { key: 'S', code: 'KeyS' },
  { key: 'T', code: 'KeyT' },
  { key: 'U', code: 'KeyU' },
  { key: 'V', code: 'KeyV' },
  { key: 'W', code: 'KeyW' },
  { key: 'X', code: 'KeyX' },
  { key: 'Y', code: 'KeyY' },
  { key: 'Z', code: 'KeyZ' },
  { key: 'Meta', code: 'MetaLeft' },
  { key: 'Meta', code: 'MetaRight' },
  { key: 'ContextMenu', code: 'ContextMenu' },
  { key: '0', code: 'Numpad0' },
  { key: '1', code: 'Numpad1' },
  { key: '2', code: 'Numpad2' },
  { key: '3', code: 'Numpad3' },
  { key: '4', code: 'Numpad4' },
  { key: '5', code: 'Numpad5' },
  { key: '6', code: 'Numpad6' },
  { key: '7', code: 'Numpad7' },
  { key: '8', code: 'Numpad8' },
  { key: '9', code: 'Numpad9' },
  { key: '*', code: 'NumpadMultiply' },
  { key: '+', code: 'NumpadAdd' },
  { key: '-', code: 'NumpadSubtract' },
  { key: '.', code: 'NumpadDecimal' },
  { key: '/', code: 'NumpadDivide' },
  { key: 'F1', code: 'F1' },
  { key: 'F2', code: 'F2' },
  { key: 'F3', code: 'F3' },
  { key: 'F4', code: 'F4' },
  { key: 'F5', code: 'F5' },
  { key: 'F6', code: 'F6' },
  { key: 'F7', code: 'F7' },
  { key: 'F8', code: 'F8' },
  { key: 'F9', code: 'F9' },
  { key: 'F10', code: 'F10' },
  { key: 'F11', code: 'F11' },
  { key: 'F12', code: 'F12' },
  { key: 'NumLock', code: 'NumLock' },
  { key: 'ScrollLock', code: 'ScrollLock' },
  { key: 'AudioVolumeMute', code: '' },
  { key: 'AudioVolumeDown', code: '' },
  { key: 'AudioVolumeUp', code: '' },
  { key: 'LaunchMediaPlayer', code: '' },
  { key: 'LaunchApplication1', code: '' },
  { key: 'LaunchApplication2', code: '' },
  { key: ';', code: 'Semicolon' },
  { key: '=', code: 'Equal' },
  { key: ',', code: 'Comma' },
  { key: '-', code: 'Minus' },
  { key: '.', code: 'Period' },
  { key: '/', code: 'Slash' },
  { key: '`', code: 'Backquote' },
  { key: '[', code: 'BracketLeft' },
  { key: '\\', code: 'Backslash' },
  { key: ']', code: 'BracketRight' },
  { key: "'", code: 'Quote' },
]

const parse = (event: KeyboardEvent) => {
  const { altKey, ctrlKey, metaKey, shiftKey, location, key, code } = event
  return { altKey, ctrlKey, metaKey, shiftKey, location, key: key?.toUpperCase(), code }
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
    if (hotKey.code !== undefined) {
      const textFromCode = KEYS.find(key => hotKey.code === key.code)?.key

      if (textFromCode) {
        keys.push(textFromCode)
      } else {
        keys.push(`${hotKey.code}(${hotKey.key})`)
      }
    } else {
      const textFromKey = (() => {
        if (hotKey.key === ' ') {
          return 'Space'
        } else {
          return hotKey.key?.toUpperCase()
        }
      })()

      keys.push(textFromKey)
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
