import { CloudServerOutlined, DeleteOutlined, DesktopOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons'
import { Button, List, Card, message } from 'antd'
import React, { useEffect } from 'react'

import { useChromeStorage } from 'hooks/chromeStorage'
import { useTargetsConfig } from 'hooks/config'
import useCurrentUrl from 'hooks/currentUrl'
import { ConfigService } from 'services/config'
import { HotKeyService } from 'services/hotKey'
import { isDevelopment } from 'utils/env'
import { UrlUtils } from 'utils/url'

export const TargetPopup: React.FC = () => {
  const url = useCurrentUrl()
  const [targets, setTargets] = useTargetsConfig()
  const [focusingSelector, setFocusingSelector] = useChromeStorage<string | null>(
    'local',
    ConfigService.FOCUSING_SELECTOR,
    null,
  )

  useEffect(() => {
    document.body.style.width = '600px'

    return () => {
      setFocusingSelector(null)
    }
  }, [])

  const close = () => {
    setFocusingSelector(null)
    window.close()
  }

  const editTarget = async (offset: number) => {
    const target = targets[offset]
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      if (tabs[0].id) {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'editTarget', target }, response => {
          console.log('Response from content script:', response)

          close()
        })
      }
    })
  }

  const openOptions = () => {
    chrome.runtime.openOptionsPage()
  }

  const removeTarget = async (offset: number) => {
    try {
      await setTargets([...targets.slice(0, offset), ...targets.slice(offset + 1)])
      message.success('Target removed')
    } catch (error) {
      message.error('Failed to remove target')
    }
  }

  const addTarget = async () => {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      if (tabs[0].id) {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'addTarget' }, response => {
          console.log('Response from content script:', response)

          close()
        })
      }
    })
  }

  const filteredTargets = targets
    .map((target, offset) => [target, offset] as const)
    .filter(([target]) => UrlUtils.checkIsMatchedUrl(target.url, url))

  return (
    <div style={{ padding: '2px' }}>
      <Card
        title={`${isDevelopment ? '[D]' : ''}Shortcuts for this Page`}
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={addTarget}
            title={'Click here to set a new shortcut for an item on this page.'}>
            Add
          </Button>
        }>
        <List
          bordered
          dataSource={filteredTargets}
          renderItem={([item, offset]) => (
            <List.Item
              actions={[
                <Button type="link" onClick={() => editTarget(offset)} icon={<EditOutlined />} key={0} />,
                <Button type="link" onClick={() => removeTarget(offset)} icon={<DeleteOutlined />} key={1} />,
              ]}
              style={{ backgroundColor: focusingSelector === item.selector ? 'lightblue' : undefined }}
              onMouseEnter={() => {
                setFocusingSelector(item.selector)
              }}
              onMouseLeave={() => {
                if (focusingSelector === item.selector) {
                  setFocusingSelector(null)
                }
              }}>
              <List.Item.Meta
                title={
                  <div
                    style={{
                      whiteSpace: 'normal',
                      wordWrap: 'break-word',
                    }}>
                    {item.location === 'sync' ? <CloudServerOutlined /> : <DesktopOutlined />} {item.url}
                  </div>
                }
                description={
                  <div
                    style={{
                      whiteSpace: 'normal',
                      wordWrap: 'break-word',
                    }}>{`HotKey: ${HotKeyService.getText(item.hotKey)}`}</div>
                }
              />
            </List.Item>
          )}
        />
        <Button onClick={openOptions} style={{ width: '100%', marginTop: 8 }}>
          View all shortcuts
        </Button>
      </Card>
    </div>
  )
}
