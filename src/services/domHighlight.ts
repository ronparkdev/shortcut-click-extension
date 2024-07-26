import { DomUtils } from 'utils/dom'

const highlight = (target: string | Element | null) => {
  // Remove any existing highlights
  Array.from(document.querySelectorAll('.element-highlight')).forEach(el => el.classList.remove('element-highlight'))

  if (target !== null) {
    if (target instanceof Element) {
      target.classList.add('element-highlight')
    } else {
      DomUtils.findElementsByXPath(target).forEach(el => el instanceof Element && el.classList.add('element-highlight'))
    }
  }
}

const injectStyle = () => {
  // Add CSS for the highlight effect
  const style = document.createElement('style')
  style.innerHTML = `
  .element-highlight {
    outline: 2px solid red !important;
  }
`

  document.head.appendChild(style)
}

export const DomHighlightService = { highlight, injectStyle }
