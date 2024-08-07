import type { Root } from 'react-dom/client'

import type { TargetConfig } from 'services/config'

void (async () => {
  let lastRightClick: { element: Element } | null = null
  let lastElement: Element | null = null
  let lastLocalTargets: TargetConfig[] = []
  let lastSyncTargets: TargetConfig[] = []
  let mode: 'standby' | 'addTarget' = 'standby'

  // Top priority functions (for save mouse position for contextmenu)

  const [{ DomUtils }] = await Promise.all([import('utils/dom')])

  document.addEventListener(
    'contextmenu',
    event => {
      const element = DomUtils.getElementFromPoint(event.clientX, event.clientY)
      lastRightClick =
        element !== null
          ? {
              element,
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
    lastLocalTargets = targets
  })

  ChromeStorageUtils.listen<TargetConfig[]>('local', ConfigService.TARGETS_KEY, targets => {
    lastLocalTargets = targets
  })

  ChromeStorageUtils.get<TargetConfig[]>('sync', ConfigService.TARGETS_KEY, []).then(targets => {
    lastSyncTargets = targets
  })

  ChromeStorageUtils.listen<TargetConfig[]>('sync', ConfigService.TARGETS_KEY, targets => {
    lastSyncTargets = targets
  })

  document.addEventListener('keydown', async event => {
    const url = UrlUtils.getCurrentUrl()
    const hotKey = HotKeyService.parse(event)

    const hitTargets = [...lastLocalTargets, ...lastSyncTargets]
      .filter(target => UrlUtils.checkIsMatchedUrl(target.url, url))
      .filter(target => HotKeyService.checkIsSame(hotKey, target.hotKey))

    hitTargets
      .flatMap(target => DomUtils.findElementsByXPath(target.selector))
      .forEach(element => {
        if (element instanceof HTMLElement) {
          element.click()
          DomHighlightService.highlight(element)
          setTimeout(() => DomHighlightService.highlight(null), 300)
        }
      })
  })

  // Low priority functions (for setting)

  const [{ DomHighlightService }, { ToastService }] = await Promise.all([
    import('services/domHighlight'),
    import('services/toast'),
  ])

  ChromeStorageUtils.listen<string | null>('local', ConfigService.FOCUSING_SELECTOR, selector => {
    DomHighlightService.highlight(selector)

    if (selector !== null) {
      const [element] = DomUtils.findElementsByXPath(selector)

      if (element instanceof HTMLElement) {
        DomUtils.scrollToElement(element)
      }
    }
  })

  document.addEventListener('mousemove', event => {
    if (mode === 'addTarget') {
      const element = DomUtils.getElementFromPoint(event.clientX, event.clientY)

      let clickableElement = element !== null ? DomUtils.findVisibleClickableAndSufficientSizeParent(element) : null

      if (clickableElement?.closest(`.${ToastService.NOTIFICATION_CLASSNAME}`)) {
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

        ToastService.cancelAddTarget()

        mode = 'standby'
      }
    },
    { capture: true },
  )

  DomHighlightService.injectStyle()

  const showDialog = async ({ element, prevTarget }: { element: Element; prevTarget?: TargetConfig }) => {
    const currentUrl = UrlUtils.getCurrentUrl()
    void render({ visible: true, targetElement: element, targetUrl: currentUrl, prevTarget })
  }

  let currentRoot: Root | null = null

  const render = async ({
    visible,
    targetElement,
    targetUrl,
    prevTarget,
  }: {
    visible: boolean
    targetElement: Element
    targetUrl: string
    prevTarget?: TargetConfig
  }) => {
    const [React, { createRoot }, { TargetEditLayer }] = await Promise.all([
      import('react'),
      import('react-dom/client'),
      import('components/TargetEditLayer'),
    ])

    const root = (currentRoot = currentRoot ?? createRoot(DomUtils.getRootElement()))
    const { StrictMode } = React

    root.render(
      <StrictMode>
        {visible && (
          <TargetEditLayer
            targetElement={targetElement}
            targetUrl={targetUrl}
            prevTarget={prevTarget}
            onChangeHighlight={DomHighlightService.highlight}
            onClose={() => {
              render({ visible: false, targetElement, targetUrl })
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
      ToastService.showAddTargetToast(() => {
        mode = 'standby'
        ToastService.cancelAddTarget()
      })
    }

    if (request.action === 'openShortcutDialog') {
      if (lastRightClick !== null) {
        lastElement = lastRightClick.element
      }

      const clickableElement =
        lastElement !== null && lastElement instanceof HTMLElement
          ? DomUtils.findVisibleClickableAndSufficientSizeParent(lastElement)
          : lastElement

      if (!clickableElement) {
        setAddTargetMode()
        return
      }

      showDialog({ element: clickableElement })
    }

    if (request.action === 'editTarget') {
      const target = request.target as TargetConfig
      const [element] = DomUtils.findElementsByXPath(target.selector)

      if (!element) {
        alert('No such element was found on this page.')
        return
      }

      DomHighlightService.highlight(element)

      showDialog({ element, prevTarget: target })
    }

    if (request.action === 'addTarget') {
      setAddTargetMode()
    }
  })
})()
