import type { TargetConfig } from 'services/config'

void (async () => {
  let lastElement: Element | null = null
  let lastTargets: TargetConfig[] = []
  let mode: 'standby' | 'addTarget' = 'standby'

  // Top priority functions (for save mouse position for contextmenu)

  const [{ DomService }] = await Promise.all([import('services/dom')])

  document.addEventListener(
    'contextmenu',
    event => {
      lastElement = DomService.getElementFromPoint(event.clientX, event.clientY)
    },
    { capture: true },
  )

  // Middle priority functions (for hotkey)

  const [{ ConfigService }, { HotKeyService }, { UrlUtils }, { ChromeStorageUtils }] = await Promise.all([
    import('services/config'),
    import('services/hotKey'),
    import('utils/url'),
    import('utils/chromeStorage'),
  ])

  ChromeStorageUtils.get<TargetConfig[]>('sync', ConfigService.TARGETS_KEY, []).then(targets => {
    lastTargets = targets
  })

  ChromeStorageUtils.listen<TargetConfig[]>('sync', ConfigService.TARGETS_KEY, targets => {
    lastTargets = targets
  })

  document.addEventListener('keydown', async event => {
    const url = UrlUtils.getCurrentUrl()
    const hotKey = HotKeyService.parse(event)

    const hitTargets = lastTargets
      .filter(target => {
        if (target.url.endsWith('/*')) {
          if (url.endsWith('/')) {
            return url.startsWith(target.url.replace('/*', '/'))
          } else {
            return url.startsWith(target.url.replace('/*', ''))
          }
        } else {
          return url === target.url
        }
      })
      .filter(target => HotKeyService.checkIsSame(hotKey, target.hotKey))

    hitTargets
      .flatMap(target => DomService.findElementsByXPath(target.selector))
      .forEach(element => {
        if (element instanceof HTMLElement) {
          element.click()
        }
      })
  })

  // Low priority functions (for setting)

  const [{ DomHighlightService }, { NOTIFICATION_CLASSNAME, showAddTargetToast, cancelAddTarget }] = await Promise.all([
    import('services/domHighlight'),
    import('notification'),
  ])

  ChromeStorageUtils.listen<string | null>('local', ConfigService.FOCUSING_SELECTOR, selector => {
    DomHighlightService.highlight(selector)
  })

  document.addEventListener('mousemove', event => {
    if (mode === 'addTarget') {
      const element = DomService.getElementFromPoint(event.clientX, event.clientY)

      let clickableElement = element !== null ? DomService.findVisibleClickableAndSufficientSizeParent(element) : null

      if (clickableElement?.closest(`.${NOTIFICATION_CLASSNAME}`)) {
        clickableElement = null
      }

      DomHighlightService.highlight(clickableElement)

      lastElement = clickableElement
    }
  })

  document.addEventListener(
    'click',
    event => {
      if (mode === 'addTarget') {
        event.preventDefault()
        event.stopPropagation()

        if (lastElement !== null) {
          showDialog({ element: lastElement })
        }

        cancelAddTarget()

        mode = 'standby'
      }
    },
    { capture: true },
  )

  DomHighlightService.injectStyle()

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

  const showDialog = async ({ element }: { element: Element }) => {
    const selector = getXPath(element)
    const defaultUrl = UrlUtils.getCurrentUrl()
    void render({ visible: true, defaultSelector: selector, defaultUrl })
  }

  const render = async ({
    visible,
    defaultSelector,
    defaultUrl,
  }: {
    visible: boolean
    defaultSelector?: string
    defaultUrl?: string
  }) => {
    const [React, { createRoot }, { TargetEditLayer }] = await Promise.all([
      import('react'),
      import('react-dom/client'),
      import('components/TargetEditLayer'),
    ])

    const root = createRoot(DomService.getRootElement())
    const { StrictMode } = React

    root.render(
      <StrictMode>
        {visible && (
          <TargetEditLayer
            defaultSelector={defaultSelector}
            defaultUrl={defaultUrl}
            onChangeHighlight={DomHighlightService.highlight}
            onClose={() => {
              render({ visible: false })
            }}
          />
        )}
      </StrictMode>,
    )
  }

  // Listen for messages from the background script
  chrome.runtime.onMessage.addListener(request => {
    if (request.action === 'openShortcutDialog') {
      const clickableElement =
        lastElement !== null && lastElement instanceof HTMLElement
          ? DomService.findVisibleClickableAndSufficientSizeParent(lastElement)
          : null

      if (!clickableElement) {
        alert('The element located at the current cursor could not be found.')
        return
      }

      showDialog({ element: clickableElement })
    }

    if (request.action === 'addTarget') {
      mode = 'addTarget'
      showAddTargetToast(() => {
        mode = 'standby'
        cancelAddTarget()
      })
    }
  })
})()
