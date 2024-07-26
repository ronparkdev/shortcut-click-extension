void (async () => {
  const [React, { createRoot }, { DomUtils }, { TargetPopup }] = await Promise.all([
    import('react'),
    import('react-dom/client'),
    import('utils/dom'),
    import('components/TargetPopup'),
  ])

  const root = createRoot(DomUtils.getRootElement())
  const { StrictMode } = React

  root.render(
    <StrictMode>
      <TargetPopup />
    </StrictMode>,
  )
})()
