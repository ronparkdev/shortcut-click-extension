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

// Function to escape single quotes in text for XPath
const escapeXPathText = (text: string): string => {
  if (text.includes("'")) {
    return `concat('${text.split("'").join("', \"'\", '")}')`
  } else {
    return `'${text}'`
  }
}

// Function to get all text content of an element, including children
const getAllTextContent = (element: Element): string => {
  return Array.from(element.childNodes)
    .filter(node => node.nodeType === Node.TEXT_NODE)
    .map(node => node.textContent?.trim() || '')
    .join(' ')
    .trim()
}

// Function to generate XPath for a given element
const getXPath = (element: Element): string => {
  // Create an array to store the path components
  const pathElements: string[] = []

  let currentElement: Element | null = element

  // Traverse up the tree to build the XPath
  while (currentElement !== null) {
    // Check if the element has an ID attribute
    if (currentElement.id) {
      pathElements.unshift(`//*[@id='${currentElement.id}']`)
      break
    } else {
      // Find the element's position among its siblings
      const index = getElementIndex(currentElement)
      const tagName = currentElement.tagName.toLowerCase()

      // Include the text content if the element has text
      const text = getAllTextContent(element)
      if (text) {
        pathElements.unshift(`/${tagName}[${index}][contains(., ${escapeXPathText(text)})]`)
      } else {
        pathElements.unshift(`/${tagName}[${index}]`)
      }

      // Move to the parent element
      currentElement = currentElement.parentElement
    }
  }

  return pathElements.join('')
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
  scrollToElement,
}
