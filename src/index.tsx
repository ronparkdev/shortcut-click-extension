import React from 'react'
import ReactDOM from 'react-dom/client'

import { TargetEditLayer } from './components/TargetEditLayer'

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)
root.render(
  <React.StrictMode>
    <TargetEditLayer />
  </React.StrictMode>,
)
