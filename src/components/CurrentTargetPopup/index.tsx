import { DeleteOutlined, SearchOutlined } from '@ant-design/icons'
import { Button, List, Card, message, Input } from 'antd'
import { useTargetsConfig } from 'hooks/config'
import useCurrentUrl from 'hooks/currentUrl'
import React, { useState, useEffect } from 'react'
import { UrlUtils } from 'utils/url'

const CurrentTargetPopup: React.FC = () => {
  const url = useCurrentUrl()

  const [targets, setTargets] = useTargetsConfig()
  const [filter, setFilter] = useState<string>(url)

  useEffect(() => {
    document.body.style.width = '600px'
    void UrlUtils.getCurrentTabUrl().then(setFilter)
  }, [])

  useEffect(() => {
    setFilter(url)
  }, [url])

  const removeTarget = async (offset: number) => {
    try {
      await setTargets([...targets.slice(0, offset), ...targets.slice(offset + 1)])
      message.success('Target removed')
    } catch (error) {
      message.error('Failed to remove target')
    }
  }

  const filteredTargets = targets.filter(target => target.url.includes(filter))

  return (
    <div style={{ padding: '2px' }}>
      <Card
        title="Config"
        extra={
          <Input
            placeholder="Filter by URL"
            value={filter}
            onChange={e => setFilter(e.target.value)}
            prefix={<SearchOutlined />}
            key={0}
          />
        }>
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
