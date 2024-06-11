const ROOT_ID = '_shortcut_click_extension_root_'

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

const findClickableParentXPathSelector = (xPathSelector: string, minSize: number = 10) => {
  const parts = xPathSelector.split('/')
  const possibleSelectors = parts
    .map((_, i) => i)
    .reverse()
    .map(i => parts.slice(0, i + 1).join('/'))

  return (
    possibleSelectors.find((selector, offset) => {
      const reversedOffset = possibleSelectors.length - offset - 1
      return ['a', 'button', 'summary'].some(tag => parts[reversedOffset].startsWith(tag))
    }) ??
    possibleSelectors.find(selector => {
      const parentElements = findElementsByXPath(selector)

      return parentElements.some(element => {
        if (element instanceof HTMLElement) {
          const rect = element.getBoundingClientRect()
          return rect.width * rect.height >= minSize
        }

        return false
      })
    })
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

export const DomService = { getRootElement, findClickableParentXPathSelector, findElementsByXPath }
