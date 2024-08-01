void (async () => {
  const [React, { createRoot }, { DomUtils }, { Options }] = await Promise.all([
    import('react'),
    import('react-dom/client'),
    import('utils/dom'),
    import('components/Options'),
  ])

  const root = createRoot(DomUtils.getRootElement())
  const { StrictMode } = React

  root.render(
    <StrictMode>
      <Options />
    </StrictMode>,
  )
})()
