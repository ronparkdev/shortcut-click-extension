import type { TargetConfig } from 'services/config'

void (async () => {
  let lastElement: HTMLElement | null = null
  let lastTargets: TargetConfig[] = []
  let mode: 'standby' | 'addTarget' = 'standby'

  const [{ DomService }] = await Promise.all([import('services/dom')])

  document.addEventListener(
    'contextmenu',
    event => {
      lastElement = DomService.getElementFromPoint(event.clientX, event.clientY)
    },
    { capture: true },
  )

  const [
    { default: getXPath },
    { ConfigService },
    { DomHighlightService },
    { HotKeyService },
    { UrlUtils },
    { ChromeStorageUtils },
  ] = await Promise.all([
    import('get-xpath'),
    import('services/config'),
    import('services/domHighlight'),
    import('services/hotKey'),
    import('utils/url'),
    import('utils/chromeStorage'),
  ])

  document.addEventListener('mousemove', event => {
    if (mode === 'addTarget') {
      const element = DomService.getElementFromPoint(event.clientX, event.clientY)

      const clickableElement = element !== null ? DomService.findVisibleClickableAndSufficientSizeParent(element) : null

      if (clickableElement !== null) {
        DomHighlightService.highlight(clickableElement)
      }

      lastElement = clickableElement
    }
  })

  document.addEventListener('click', event => {
    if (mode === 'addTarget') {
      event.preventDefault()

      if (lastElement !== null) {
        showDialog({ element: lastElement })
      }

      DomHighlightService.highlight(null)

      mode = 'standby'
    }
  })

  ChromeStorageUtils.get<TargetConfig[]>(ConfigService.TARGETS_KEY, []).then(targets => {
    lastTargets = targets
  })
  ChromeStorageUtils.listen<TargetConfig[]>(ConfigService.TARGETS_KEY, targets => {
    lastTargets = targets
  })

  DomHighlightService.injectStyle()

  const showDialog = ({ element }: { element: HTMLElement }) => {
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
    }
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
})()
