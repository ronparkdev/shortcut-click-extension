import { DeleteOutlined, PlusOutlined } from '@ant-design/icons'
import { Button, List, Card, message } from 'antd'
import React, { useEffect } from 'react'

import { useChromeStorage } from 'hooks/chromeStorage'
import { useTargetsConfig } from 'hooks/config'
import useCurrentUrl from 'hooks/currentUrl'
import { ConfigService } from 'services/config'
import { HotKeyService } from 'services/hotKey'

const TargetPopup: React.FC = () => {
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

          window.close()
        })
      }
    })
  }

  const filteredTargets = targets
    .map((target, offset) => [target, offset] as const)
    .filter(([target]) => {
      if (target.url.endsWith('/*')) {
        if (url.endsWith('/')) {
          return url.startsWith(target.url.replace('/*', '/'))
        } else {
          return url.startsWith(target.url.replace('/*', ''))
        }
      } else {
        return url === target.url
      }
    })

  return (
    <div style={{ padding: '2px' }}>
      <Card
        title="Current Shortcuts"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={addTarget}
            title={'Click here to set a new shortcut for an item on this page.'}>
            Add New Shortcut
          </Button>
        }>
        <List
          bordered
          dataSource={filteredTargets}
          renderItem={([item, offset]) => (
            <List.Item
              actions={[
                <Button type="link" onClick={() => removeTarget(offset)} icon={<DeleteOutlined />} key={0}>
                  Remove
                </Button>,
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
                    }}>{`URL: ${item.url}`}</div>
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
      </Card>
    </div>
  )
}

export { TargetPopup as CurrentTargetPopup }
