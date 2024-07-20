import type { CollapseProps } from 'antd'
import { Button, Slider, Modal, Typography, Collapse, Alert, Input } from 'antd'
import { showSavedToast } from 'notification'
import type { FC } from 'react'
import React, { useEffect, useMemo, useState } from 'react'
import Draggable from 'react-draggable'
import { useHotkeys } from 'react-hotkeys-hook'

import { useTargetsConfig } from 'hooks/config'
import { DomService } from 'services/dom'
import type { HotKey } from 'services/hotKey'
import { HotKeyService } from 'services/hotKey'

const { Title, Paragraph } = Typography

type Props = {
  onChangeHighlight: (element: Element | null) => void
  onClose: () => void
  defaultElement: Element
  defaultUrl: string
}

export const TargetEditLayer: FC<Props> = ({ onChangeHighlight, onClose, defaultElement, defaultUrl }) => {
  const [open, setOpen] = useState(true)
  const [selector, setSelector] = useState<string | null>(null)

  const [targets, setTargets] = useTargetsConfig()

  const elements = useMemo(() => {
    const elements: Element[] = []

    let el: Element | null = defaultElement
    while (el !== null) {
      elements.unshift(el)
      el = el.parentElement
    }

    return elements
  }, [defaultElement])

  const [elementIndex, setElementIndex] = useState(elements.length - 1)

  const element = elements[elementIndex]

  useMemo(() => {
    setSelector(DomService.getSafeXPath(element))
    onChangeHighlight(element)
  }, [element])

  const urlParts = useMemo(() => defaultUrl.split('/'), [defaultUrl])
  const [urlPartMaxIndex, setUrlPartMaxIndex] = useState(urlParts.length)
  const url = `${urlParts.slice(0, urlPartMaxIndex).join('/')}/*`

  const [hotKey, setHotKey] = useState<HotKey | null>(null)

  const [isHotKeyListening, setHotKeyListening] = useState(false)

  useEffect(() => {
    keyRef.current?.focus()
  }, [])

  const handleClose = () => {
    onChangeHighlight(null)
    onClose()
    setOpen(false)
  }

  const handleSave = () => {
    if (hotKey !== null && selector !== null) {
      setTargets([...targets, { selector, url, hotKey }])
    }
    showSavedToast()
    handleClose()
  }

  const keyRef = useHotkeys<HTMLButtonElement>('*', event => {
    event.preventDefault()
    setHotKey(HotKeyService.parse(event))
  })

  const isSelectorValid = selector !== null && DomService.findElementsByXPath(selector).includes(element)
  const isValid = HotKeyService.isValid(hotKey) && isSelectorValid

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
          <Input.TextArea readOnly={true} variant="filled" value={url} autoSize />
          <Slider
            min={2}
            max={urlParts.length}
            defaultValue={urlPartMaxIndex}
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
            status={isSelectorValid ? '' : 'error'}
          />
          {!isSelectorValid && (
            <Alert description="The modified xpath does not match the element." type="error" showIcon />
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
          Set Shortcut for This Item
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
