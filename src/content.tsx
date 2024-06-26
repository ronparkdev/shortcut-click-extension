import type { TargetConfig } from 'services/config'

void (async () => {
  let lastRightClick: { element: Element; date: Date } | null = null
  let lastElement: Element | null = null
  let lastTargets: TargetConfig[] = []
  let mode: 'standby' | 'addTarget' = 'standby'

  // Top priority functions (for save mouse position for contextmenu)

  const [{ DomService }] = await Promise.all([import('services/dom')])

  document.addEventListener(
    'contextmenu',
    event => {
      const element = DomService.getElementFromPoint(event.clientX, event.clientY)
      lastRightClick =
        element !== null
          ? {
              element,
              date: new Date(),
            }
          : null
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

  ChromeStorageUtils.get<TargetConfig[]>('local', ConfigService.TARGETS_KEY, []).then(targets => {
    lastTargets = targets
  })

  ChromeStorageUtils.listen<TargetConfig[]>('local', ConfigService.TARGETS_KEY, targets => {
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

    if (selector !== null) {
      const [element] = DomService.findElementsByXPath(selector)

      if (element instanceof HTMLElement) {
        DomService.scrollToElement(element)
      }
    }
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

  const showDialog = async ({ element }: { element: Element }) => {
    const selector = DomService.getXPath(element)
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
    const setAddTargetMode = () => {
      mode = 'addTarget'
      showAddTargetToast(() => {
        mode = 'standby'
        cancelAddTarget()
      })
    }

    if (request.action === 'openShortcutDialog') {
      if (lastRightClick !== null && Math.abs(lastRightClick.date.getTime() - new Date().getTime()) < 500) {
        lastElement = lastRightClick.element
      }

      const clickableElement =
        lastElement !== null && lastElement instanceof HTMLElement
          ? DomService.findVisibleClickableAndSufficientSizeParent(lastElement)
          : null

      if (!clickableElement) {
        setAddTargetMode()
        return
      }

      showDialog({ element: clickableElement })
    }

    if (request.action === 'addTarget') {
      setAddTargetMode()
    }
  })
})()
