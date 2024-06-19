const ROOT_ID = '_shortcut_click_extension_root_'

export const getElementFromPoint = (x: number, y: number): Element | null => {
  return document.elementFromPoint(x, y)
}

const isElementVisible = (element: Element | null): boolean => {
  if (!element) return false

  const style = getComputedStyle(element)
  return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0'
}

const isElementClickable = (element: Element | null): boolean => {
  if (!element) return false

  const style = getComputedStyle(element)
  return style.pointerEvents !== 'none'
}

const isElementSizeSufficient = (element: Element | null): boolean => {
  if (!element) return false

  const rect = element.getBoundingClientRect()
  return rect.width * rect.height > 8
}

const findVisibleClickableAndSufficientSizeParent = (element: Element | null): Element | null => {
  let currentElement = element

  while (currentElement) {
    if (
      isElementVisible(currentElement) &&
      isElementClickable(currentElement) &&
      isElementSizeSufficient(currentElement)
    ) {
      return currentElement
    }
    currentElement = currentElement.parentElement as Element | null
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
