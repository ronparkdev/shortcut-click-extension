import type { CollapseProps } from 'antd'
import { Button, Slider, Modal, Typography, Collapse, Alert, Input } from 'antd'
import { showSavedToast } from 'notification'
import type { FC } from 'react'
import React, { useEffect, useMemo, useState } from 'react'
import Draggable from 'react-draggable'
import { useHotkeys } from 'react-hotkeys-hook'

import { useLastUsedUrlPattern, useTargetsConfig } from 'hooks/config'
import type { TargetConfig } from 'services/config'
import { DomService } from 'services/dom'
import type { HotKey } from 'services/hotKey'
import { HotKeyService } from 'services/hotKey'
import { UrlUtils } from 'utils/url'

const { Title, Paragraph } = Typography

type Props = {
  onChangeHighlight: (element: Element | null) => void
  onClose: () => void
  targetElement: Element
  targetUrl: string
  prevTarget?: TargetConfig
}

export const TargetEditLayer: FC<Props> = ({ onChangeHighlight, onClose, targetElement, targetUrl, prevTarget }) => {
  const [open, setOpen] = useState(true)
  const [selector, setSelector] = useState<string | null>(prevTarget?.selector ?? null)

  const [targets, setTargets] = useTargetsConfig()
  const [lastUsedUrlPattern, setLastUsedUrlPattern] = useLastUsedUrlPattern()

  const elements = useMemo(() => {
    const elements: Element[] = []

    let el: Element | null = targetElement
    while (el !== null) {
      elements.unshift(el)
      el = el.parentElement
    }

    return elements
  }, [targetElement])

  const [elementIndex, setElementIndex] = useState(elements.length - 1)

  const element = elements[elementIndex]

  useMemo(() => {
    setSelector(DomService.getSafeXPath(element))
    onChangeHighlight(element)
  }, [element])

  const urlParts = useMemo(() => targetUrl.split('/'), [targetUrl])
  const [urlPartMaxIndex, setUrlPartMaxIndex] = useState(urlParts.length)
  const urlPattern = `${urlParts.slice(0, urlPartMaxIndex).join('/')}/*`

  const [hotKey, setHotKey] = useState<HotKey | null>(prevTarget?.hotKey ?? null)

  const [isHotKeyListening, setHotKeyListening] = useState(!prevTarget?.hotKey)

  useEffect(() => {
    keyRef.current?.focus()
  }, [])

  useEffect(() => {
    const urlPartMaxIndex = (() => {
      if (prevTarget) {
        return prevTarget.url.split('/').length - 1
      }
      if (lastUsedUrlPattern && UrlUtils.checkIsMatchedUrl(lastUsedUrlPattern, targetUrl)) {
        console.log('boom!')
        return lastUsedUrlPattern.split('/').length - 1
      }
      return urlParts.length
    })()

    console.log({ urlPartMaxIndex, lastUsedUrlPattern })

    setUrlPartMaxIndex(urlPartMaxIndex)
  }, [lastUsedUrlPattern])

  const handleClose = () => {
    onChangeHighlight(null)
    onClose()
    setOpen(false)
  }

  const handleSave = () => {
    if (hotKey !== null && selector !== null) {
      const matchedTarget =
        (prevTarget &&
          targets.find(
            target =>
              HotKeyService.checkIsSame(prevTarget.hotKey, target.hotKey) &&
              prevTarget.selector === target.selector &&
              prevTarget.url === target.url,
          )) ||
        targets.find(
          target =>
            HotKeyService.checkIsSame(hotKey, target.hotKey) &&
            selector === target.selector &&
            urlPattern === target.url,
        )

      if (matchedTarget) {
        setTargets([...targets.filter(target => target !== matchedTarget), { selector, url: urlPattern, hotKey }])
      } else {
        setTargets([...targets, { selector, url: urlPattern, hotKey }])
      }
    }
    setLastUsedUrlPattern(urlPattern)
    showSavedToast()
    handleClose()
  }

  const keyRef = useHotkeys<HTMLButtonElement>('*', event => {
    event.preventDefault()
    setHotKey(HotKeyService.parse(event))
  })

  const selectorState = (() => {
    try {
      if (selector === null) {
        return 'invalid'
      }

      return DomService.findElementsByXPath(selector).includes(element) ? 'valid' : 'elementNotIncluded'
    } catch {
      return 'invalid'
    }
  })()
  const isValid = HotKeyService.isValid(hotKey) && selectorState === 'valid'

  const items: CollapseProps['items'] = [
    {
      key: '1',
      label: 'Shortcut Key',
      children: (
        <div>
          <Paragraph>Press the keys you want to set as a shortcut for this item.</Paragraph>
          <Button
            ref={keyRef}
            onFocus={() => setHotKeyListening(true)}
            onBlur={() => setHotKeyListening(false)}
            type={isHotKeyListening ? 'primary' : undefined}>
            {hotKey
              ? HotKeyService.getText(hotKey)
              : isHotKeyListening
                ? 'Press keys to record shortcut'
                : 'Click here to record shortcut'}
          </Button>
        </div>
      ),
    },
    {
      key: '2',
      label: 'Select Item',
      children: (
        <div>
          <Paragraph>
            Adjust the slider to select the specific range of the item you want to set a shortcut for.
          </Paragraph>
          <Slider
            min={0}
            max={elements.length - 1}
            value={elementIndex}
            onChange={setElementIndex}
            tooltip={{ open: false }}
          />
        </div>
      ),
    },
    {
      key: '3',
      label: 'URL Range',
      children: (
        <div>
          <Paragraph>
            Adjust the slider to decide if the shortcut should apply to the entire website, this specific page, or a
            custom path.
          </Paragraph>
          <Input.TextArea readOnly={true} variant="filled" value={urlPattern} autoSize />
          <Slider
            min={2}
            max={urlParts.length}
            value={urlPartMaxIndex}
            onChange={setUrlPartMaxIndex}
            tooltip={{ open: false }}
          />
        </div>
      ),
    },
    {
      key: '4',
      label: 'Advanced options',
      children: (
        <div>
          <Paragraph>You can modify the XPath selector directly.</Paragraph>
          <Input.TextArea
            variant="outlined"
            value={selector ?? ''}
            autoSize
            onChange={e => setSelector(e.target.value)}
            status={selectorState === 'valid' ? '' : 'error'}
          />
          {selectorState !== 'valid' && (
            <Alert
              style={{ marginTop: 8 }}
              description={
                selectorState === 'elementNotIncluded'
                  ? 'The modified xpath does not match the element'
                  : 'There was an error in the xpath selector'
              }
              type="error"
              showIcon
            />
          )}
        </div>
      ),
    },
  ]

  return (
    <Modal
      open={open}
      okButtonProps={{ disabled: !isValid }}
      onOk={handleSave}
      onCancel={handleClose}
      onClose={handleClose}
      mask={false}
      maskClosable={false}
      title={
        <Title level={3} style={{ marginTop: 15 }}>
          {prevTarget ? 'Edit' : 'Set'} Shortcut for This Element
        </Title>
      }
      modalRender={modal => (
        <Draggable>
          <div style={{ cursor: 'move' }}>{modal}</div>
        </Draggable>
      )}
      centered>
      <Collapse defaultActiveKey={['1', '2', '3']} items={items} />
    </Modal>
  )
}
