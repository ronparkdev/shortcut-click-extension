void (async () => {
  const [React, { createRoot }, { DomService }, { CurrentTargetPopup }] = await Promise.all([
    import('react'),
    import('react-dom/client'),
    import('services/dom'),
    import('components/TargetPopup'),
  ])

  const root = createRoot(DomService.getRootElement())
  const { StrictMode } = React

  root.render(
    <StrictMode>
      <CurrentTargetPopup />
    </StrictMode>,
  )
})()
