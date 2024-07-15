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
  try {
    const result: Element[] = []

    const nodesSnapshot = document.evaluate(xPathSelector, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null)
    for (let i = 0; i < nodesSnapshot.snapshotLength; i++) {
      const node = nodesSnapshot.snapshotItem(i)
      if (node instanceof Element) {
        result.push(node)
      }
    }

    return result
  } catch {
    return []
  }
}

const getElementIndex = (element: Element): number => {
  let index = 1
  let sibling = element.previousElementSibling
  while (sibling) {
    if (sibling.tagName === element.tagName) {
      index++
    }
    sibling = sibling.previousElementSibling
  }
  return index
}

const escapeXPathText = (text: string): string => {
  if (text.includes("'")) {
    return `concat('${text.split("'").join("', \"'\", '")}')`
  } else {
    return `'${text}'`
  }
}

const getElementText = (element: Element): string => {
  const children = Array.from(element.childNodes)

  const text = children
    .filter(node => node.nodeType === Node.TEXT_NODE)
    .map(node => node.textContent?.trim() || '')
    .join(' ')
    .trim()
  if (text) {
    return text
  }

  for (const element of children.filter((node): node is Element => node instanceof Element)) {
    const text = getElementText(element)
    if (text) {
      return text
    }
  }

  return ''
}

const getXPath = (element: Element, { includeText = true }: { includeText?: boolean } = {}): string | null => {
  // Create an array to store the path components
  const pathElements: string[] = []

  let currentElement: Element | null = element

  const text = getElementText(currentElement)
  if (includeText && text) {
    pathElements.unshift(`[contains(., ${escapeXPathText(text)})]`)
  }

  while (currentElement !== null) {
    if (currentElement.id) {
      pathElements.unshift(`//*[@id='${currentElement.id}']`)
      break
    } else {
      const index = getElementIndex(currentElement)
      const tagName = currentElement.tagName.toLowerCase()

      pathElements.unshift(`/${tagName}[${index}]`)

      currentElement = currentElement.parentElement
    }
  }

  if (pathElements.length === 0) {
    return null
  }

  return pathElements.join('')
}

const getSafeXPath = (element: Element): string | null => {
  const xPathSelector = getXPath(element, { includeText: true })
  if (xPathSelector !== null && findElementsByXPath(xPathSelector).includes(element)) {
    return xPathSelector
  }

  return getXPath(element, { includeText: false })
}

const scrollToElement = (element: HTMLElement) => {
  if (!element) return

  const elementRect = element.getBoundingClientRect()
  const absoluteElementTop = elementRect.top + window.scrollY
  const middle = absoluteElementTop - window.innerHeight / 2 + elementRect.height / 2

  window.scrollTo({
    top: middle,
    behavior: 'smooth',
  })
}

export const DomService = {
  findElementsByXPath,
  findVisibleClickableAndSufficientSizeParent,
  getElementFromPoint,
  getRootElement,
  getXPath,
  getSafeXPath,
  scrollToElement,
}
