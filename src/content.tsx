import type { TargetConfig } from 'services/config'

void (async () => {
  let lastElement: Element | null = null
  let lastTargets: TargetConfig[] = []

  document.addEventListener(
    'contextmenu',
    event => {
      const element = document.elementFromPoint(event.clientX, event.clientY)
      lastElement = element ?? null
    },
    { capture: true },
  )

  const [
    { default: getXPath },
    { ConfigService },
    { DomService },
    { DomHighlightService },
    { HotKeyService },
    { UrlUtils },
    { ChromeStorageUtils },
  ] = await Promise.all([
    import('get-xpath'),
    import('services/config'),
    import('services/dom'),
    import('services/domHighlight'),
    import('services/hotKey'),
    import('utils/url'),
    import('utils/chromeStorage'),
  ])

  ChromeStorageUtils.get<TargetConfig[]>(ConfigService.TARGETS_KEY, []).then(targets => {
    lastTargets = targets
  })
  ChromeStorageUtils.listen<TargetConfig[]>(ConfigService.TARGETS_KEY, targets => {
    lastTargets = targets
  })

  DomHighlightService.injectStyle()

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
    if (request.action === 'openShortcutDialog' && lastElement !== null) {
      const defaultSelector = getXPath(lastElement)
      const defaultUrl = UrlUtils.getCurrentUrl()
      void render({ visible: true, defaultSelector, defaultUrl })
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
