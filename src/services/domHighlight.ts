import { DomService } from './dom'

const highlight = (target: string | HTMLElement | null) => {
  // Remove any existing highlights
  Array.from(document.querySelectorAll('.element-highlight')).forEach(el => el.classList.remove('element-highlight'))

  if (target !== null) {
    if (target instanceof HTMLElement) {
      target.classList.add('element-highlight')
    } else {
      DomService.findElementsByXPath(target).forEach(
        el => el instanceof Element && el.classList.add('element-highlight'),
      )
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
