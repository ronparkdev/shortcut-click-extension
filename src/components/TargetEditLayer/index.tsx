import { CloudServerOutlined, DesktopOutlined, QuestionCircleOutlined } from '@ant-design/icons'
import { Button, Slider, Modal, Typography, Alert, Input, Radio, Tooltip, Flex, Switch, Form, Space } from 'antd'
import type { FC } from 'react'
import React, { useEffect, useLayoutEffect, useMemo, useState } from 'react'
import Draggable from 'react-draggable'
import { useHotkeys } from 'react-hotkeys-hook'

import { useLastUsedUrlPattern, useTargetsConfig } from 'hooks/config'
import type { TargetConfig } from 'services/config'
import type { HotKey } from 'services/hotKey'
import { HotKeyService } from 'services/hotKey'
import { ToastService } from 'services/toast'
import { DomUtils } from 'utils/dom'
import { isDevelopment } from 'utils/env'
import { UrlUtils } from 'utils/url'

const { Title, Text } = Typography

type Props = {
  onChangeHighlight: (element: Element | null) => void
  onClose: () => void
  targetElement: Element
  targetUrl: string
  prevTarget?: TargetConfig
}

export const TargetEditLayer: FC<Props> = ({ onChangeHighlight, onClose, targetElement, targetUrl, prevTarget }) => {
  const [open, setOpen] = useState(true)

  const [isFocusedInput, setFocusedInput] = useState(false)
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

  const [selector, setSelector] = useState<string | null>(() => {
    if (prevTarget?.selector) {
      return prevTarget.selector
    }

    return DomUtils.getSafeXPath(targetElement) ?? null
  })

  const urlParts = useMemo(() => targetUrl.split('/'), [targetUrl])
  const [urlPartMaxIndex, setUrlPartMaxIndex] = useState(urlParts.length)
  const urlPattern = `${urlParts.slice(0, urlPartMaxIndex).join('/')}/*`

  const [hotKey, setHotKey] = useState<HotKey | null>(prevTarget?.hotKey ?? null)
  const [location, setLocation] = useState<'sync' | 'local'>(prevTarget?.location ?? 'local')

  const [isHotKeyListening, setHotKeyListening] = useState(!prevTarget?.hotKey)
  const [isVisibleAdvancedOptions, setVisibleAdvancedOptions] = useState(() => {
    if (prevTarget?.selector) {
      return prevTarget.selector !== DomUtils.getSafeXPath(targetElement)
    }
    return false
  })
  const [errorMessage, setErrorMessage] = useState('')

  const handleChangeSlider = (index: number) => {
    setElementIndex(index)

    const selector = DomUtils.getSafeXPath(elements[index])
    setSelector(selector)
  }

  useLayoutEffect(() => {
    onChangeHighlight(elements[elementIndex])
  }, [elementIndex])

  useEffect(() => {
    keyRef.current?.focus()
  }, [])

  useEffect(() => {
    const urlPartMaxIndex = (() => {
      if (prevTarget) {
        return prevTarget.url.split('/').length - 1
      }
      if (lastUsedUrlPattern && UrlUtils.checkIsMatchedUrl(lastUsedUrlPattern, targetUrl)) {
        return lastUsedUrlPattern.split('/').length - 1
      }
      return urlParts.length
    })()

    setUrlPartMaxIndex(urlPartMaxIndex)
  }, [lastUsedUrlPattern])

  const handleClose = () => {
    onChangeHighlight(null)
    onClose()
    setOpen(false)
  }

  const handleSave = async () => {
    if (hotKey === null || selector === null) {
      return
    }

    setErrorMessage('')

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
          HotKeyService.checkIsSame(hotKey, target.hotKey) && selector === target.selector && urlPattern === target.url,
      )

    try {
      if (matchedTarget) {
        await setTargets([
          ...targets.filter(target => target !== matchedTarget),
          { selector, url: urlPattern, hotKey, location },
        ])
      } else {
        await setTargets([...targets, { selector, url: urlPattern, hotKey, location }])
      }

      setLastUsedUrlPattern(urlPattern)
      ToastService.showSavedToast()
      handleClose()
    } catch (e) {
      if ((e as { message: string })?.message === 'QUOTA_BYTES_PER_ITEM quota exceeded') {
        setErrorMessage(
          'You have reached the limit of what can be saved with sync.\nReplace it with local, or clean up unnecessary sync shortcuts.',
        )
      } else {
        setErrorMessage(String(e))
      }
    }
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

      return DomUtils.findElementsByXPath(selector).includes(elements[elementIndex]) ? 'valid' : 'elementNotIncluded'
    } catch {
      return 'invalid'
    }
  })()
  const isValid = HotKeyService.isValid(hotKey) && selectorState === 'valid'

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
        <Title level={4} style={{ marginTop: 15, marginBottom: 25 }}>
          {isDevelopment ? '[D]' : ''}
          {prevTarget ? 'Edit' : 'Set'} Shortcut for This Element
        </Title>
      }
      modalRender={modal => (
        <Draggable disabled={isFocusedInput}>
          <div style={{ cursor: 'move' }}>{modal}</div>
        </Draggable>
      )}
      centered>
      <Form labelCol={{ span: 6 }} wrapperCol={{ span: 25 }} layout="horizontal">
        <Form.Item
          label={
            <>
              Key{' '}
              <Tooltip placement="bottomLeft" title={'Press the keys you want to set as a shortcut for this item'}>
                <QuestionCircleOutlined />
              </Tooltip>
            </>
          }
          name="key">
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
        {!isVisibleAdvancedOptions && (
          <Form.Item
            label={
              <>
                Element{' '}
                <Tooltip
                  placement="bottomLeft"
                  title={'Adjust the slider to select the specific range of the item you want to set a shortcut for'}>
                  <QuestionCircleOutlined />
                </Tooltip>
              </>
            }
            name="element">
            <Slider
              min={0}
              max={elements.length - 1}
              value={elementIndex}
              defaultValue={elementIndex}
              onChange={handleChangeSlider}
              tooltip={{ open: false }}
            />
          </Form.Item>
        )}
        <Form.Item
          label={
            <>
              URL{' '}
              <Tooltip
                placement="bottomLeft"
                title={
                  'Adjust the slider to decide if the shortcut should apply to the entire website, this specific page, or a custom path'
                }>
                <QuestionCircleOutlined />
              </Tooltip>
            </>
          }
          name="url">
          <Input.TextArea readOnly={true} variant="filled" value={urlPattern} autoSize />
          <Slider
            min={2}
            max={urlParts.length}
            value={urlPartMaxIndex}
            onChange={setUrlPartMaxIndex}
            tooltip={{ open: false }}
          />
        </Form.Item>
        <Form.Item
          label={
            <>
              Location{' '}
              <Tooltip
                placement="bottomLeft"
                title={
                  'Where to save. SYNC is saved to your Chrome account, but there may be a limit to the number. LOCAL is saved to your current computer.'
                }>
                <QuestionCircleOutlined />
              </Tooltip>
            </>
          }
          name="location">
          <Radio.Group defaultValue={location} onChange={e => setLocation(e.target.value!)} size={'small'}>
            <Radio.Button value="local">
              <DesktopOutlined /> Local
            </Radio.Button>
            <Radio.Button value="sync">
              <CloudServerOutlined /> Sync
            </Radio.Button>
          </Radio.Group>
        </Form.Item>
        <Form.Item label={'Advanced'} name="advanced">
          <Flex gap={'small'} vertical>
            <Flex>
              <Switch
                size="small"
                defaultChecked
                value={isVisibleAdvancedOptions}
                onChange={value => setVisibleAdvancedOptions(value)}
              />
              <Space />
            </Flex>
            {isVisibleAdvancedOptions && (
              <>
                <Text>You can modify the XPath selector directly.</Text>
                <Input.TextArea
                  variant="outlined"
                  value={selector ?? ''}
                  autoSize
                  onFocus={() => setFocusedInput(true)}
                  onBlur={() => setFocusedInput(false)}
                  onChange={e => setSelector(e.target.value)}
                  status={selectorState === 'valid' ? '' : 'error'}
                />
              </>
            )}
          </Flex>
        </Form.Item>
      </Form>
      {isVisibleAdvancedOptions && selectorState !== 'valid' && (
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
      {!!errorMessage.length && (
        <Alert
          style={{ marginTop: 8 }}
          description={errorMessage}
          type="error"
          showIcon
          closable
          onClose={() => setErrorMessage('')}
        />
      )}
    </Modal>
  )
}
