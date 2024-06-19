const ROOT_ID = '_shortcut_click_extension_root_'

export const getElementFromPoint = (x: number, y: number): HTMLElement | null => {
  const element = document.elementFromPoint(x, y)
  return element instanceof HTMLElement ? element : null
}

const isElementVisible = (element: HTMLElement | null): boolean => {
  if (!element) return false

  const style = getComputedStyle(element)
  return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0'
}

const isElementClickable = (element: HTMLElement | null): boolean => {
  if (!element) return false

  const style = getComputedStyle(element)
  return style.pointerEvents !== 'none'
}

const isElementSizeSufficient = (element: HTMLElement | null): boolean => {
  if (!element) return false

  const rect = element.getBoundingClientRect()
  return rect.width * rect.height > 8
}

const findVisibleClickableAndSufficientSizeParent = (element: HTMLElement | null): HTMLElement | null => {
  let currentElement = element

  while (currentElement) {
    if (
      isElementVisible(currentElement) &&
      isElementClickable(currentElement) &&
      isElementSizeSufficient(currentElement)
    ) {
      return currentElement
    }
    currentElement = currentElement.parentElement as HTMLElement | null
  }

  return null
}

const getRootElement = () => {
  return (
    document.getElementById(ROOT_ID) ??
    (() => {
      const el = document.createElement('div')
      el.id = ROOT_ID
      document.body.append(el)
      return el
    })()
  )
}

const findElementsByXPath = (xPathSelector: string) => {
  const result = []

  const nodesSnapshot = document.evaluate(xPathSelector, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null)
  for (let i = 0; i < nodesSnapshot.snapshotLength; i++) {
    result.push(nodesSnapshot.snapshotItem(i))
  }

  return result
}

export const DomService = {
  findElementsByXPath,
  findVisibleClickableAndSufficientSizeParent,
  getElementFromPoint,
  getRootElement,
}
