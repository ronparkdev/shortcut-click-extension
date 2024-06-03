import { DeleteOutlined } from '@ant-design/icons'
import { Button, List, Card, message } from 'antd'
import { useTargetsConfig } from 'hooks/config'
import useCurrentUrl from 'hooks/currentUrl'
import React, { useEffect } from 'react'

const CurrentTargetPopup: React.FC = () => {
  const url = useCurrentUrl()

  const [targets, setTargets] = useTargetsConfig()

  useEffect(() => {
    document.body.style.width = '600px'
  }, [])

  const removeTarget = async (offset: number) => {
    try {
      alert(JSON.stringify({ f: targets, t: [...targets.slice(0, offset), ...targets.slice(offset + 1)] }))
      await setTargets([...targets.slice(0, offset), ...targets.slice(offset + 1)])
      message.success('Target removed')
    } catch (error) {
      message.error('Failed to remove target')
    }
  }

  const filteredTargets = targets.filter(target => {
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
      <Card title="Config">
        <List
          bordered
          dataSource={filteredTargets}
          renderItem={(item, offset) => (
            <List.Item
              actions={[
                <Button type="link" onClick={() => removeTarget(offset)} icon={<DeleteOutlined />} key={0}>
                  Remove
                </Button>,
              ]}>
              <List.Item.Meta
                title={
                  <div style={{ whiteSpace: 'normal', wordWrap: 'break-word' }}>{`Selector: ${item.selector}`}</div>
                }
                description={
                  <div
                    style={{
                      whiteSpace: 'normal',
                      wordWrap: 'break-word',
                    }}>{`URL: ${item.url} | HotKey: ${item.hotKey.key}`}</div>
                }
              />
            </List.Item>
          )}
        />
      </Card>
    </div>
  )
}

export { CurrentTargetPopup }
