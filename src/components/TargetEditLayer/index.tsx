import { Button, Slider, Modal, Form, Typography } from 'antd'
import { useTargetsConfig } from 'hooks/config'
import type { FC } from 'react'
import React, { useEffect, useMemo, useState } from 'react'
import Draggable from 'react-draggable'
import { useHotkeys } from 'react-hotkeys-hook'
import type { HotKey } from 'services/hotKey'
import { HotKeyService } from 'services/hotKey'

const { Title, Text } = Typography

type Props = {
  onChangeHighlight: (xPathSelector: string | null) => void
  onClose: () => void
  defaultSelector?: string
  defaultUrl?: string
}

export const TargetEditLayer: FC<Props> = ({
  onChangeHighlight,
  onClose,
  defaultSelector = '#VPContent > div > div > div.aside > div.aside-container > div > div > nav > div > ul > li:nth-child(5) > ul > li:nth-child(12) > a',
  defaultUrl = 'https://naver.com/test/1/2/3/4/5/6',
}) => {
  const [open, setOpen] = useState(true)

  const [targets, setTargets] = useTargetsConfig()

  const selectors = useMemo(() => defaultSelector.split('/'), [defaultSelector])
  const [selectorMaxIndex, setSelectorMaxIndex] = useState(Math.max(0, selectors.length))
  const selector = selectors.slice(0, selectorMaxIndex).join('/')

  const urlParts = useMemo(() => defaultUrl.split('/'), [defaultUrl])
  const [urlPartMaxIndex, setUrlPartMaxIndex] = useState(urlParts.length)
  const url = `${urlParts.slice(0, urlPartMaxIndex).join('/')}/*`

  const [hotKey, setHotKey] = useState<HotKey | null>(null)

  const [isHotKeyListening, setHotKeyListening] = useState(false)

  useEffect(() => {
    onChangeHighlight(selector)
  }, [selector])

  const handleClose = () => {
    onChangeHighlight(null)
    onClose()
    setOpen(false)
  }

  const handleSave = () => {
    if (hotKey !== null) {
      setTargets([...targets, { selector, url, hotKey }])
    }
    showSavedToast()
    handleClose()
  }

  const keyRef = useHotkeys<HTMLButtonElement>('*', event => {
    event.preventDefault()
    setHotKey(HotKeyService.parse(event))
  })

  const isValid = HotKeyService.isValid(hotKey)

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
          Setup
        </Title>
      }
      modalRender={modal => (
        <Draggable>
          <div style={{ cursor: 'move' }}>{modal}</div>
        </Draggable>
      )}
      centered>
      <Form layout="vertical">
        <Form.Item
          label={
            <Text strong style={{ fontSize: '16px' }}>
              Selector
            </Text>
          }
          style={{ marginBottom: 12 }}>
          <Text>{selector}</Text>
          <Slider min={2} max={selectors.length} defaultValue={selectorMaxIndex} onChange={setSelectorMaxIndex} />
        </Form.Item>
        <Form.Item
          label={
            <Text strong style={{ fontSize: '16px' }}>
              URL
            </Text>
          }
          style={{ marginBottom: 12 }}>
          <Text>{url}</Text>
          <Slider min={2} max={urlParts.length} defaultValue={urlPartMaxIndex} onChange={setUrlPartMaxIndex} />
        </Form.Item>
        <Form.Item
          label={
            <Text strong style={{ fontSize: '16px' }}>
              Shortcut Key
            </Text>
          }
          style={{ marginBottom: 12 }}>
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
        </Form.Item>
      </Form>
    </Modal>
  )
}
