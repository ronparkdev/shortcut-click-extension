import { CloudServerOutlined, DeleteOutlined, DesktopOutlined, EditOutlined } from '@ant-design/icons'
import { Button, List, Card, message } from 'antd'
import { TargetEditLayer } from 'components/TargetEditLayer'
import React, { useCallback, useEffect, useRef, useState } from 'react'

import { useTargetsConfig } from 'hooks/config'
import type { TargetConfig } from 'services/config'
import { HotKeyService } from 'services/hotKey'

const ShortcutList: React.FC = () => {
  const writingCountRef = useRef<number>(0)

  const [targets, setTargets] = useTargetsConfig()
  const [editingTarget, setEditingTarget] = useState<TargetConfig | null>(null)
  const [sortedTargets, setSortedTargets] = useState<TargetConfig[]>(targets)

  const updateSortedTargets = useCallback(() => {
    setSortedTargets(prevSortedTargets =>
      targets.sort((left, right) => {
        let leftIndex = prevSortedTargets.findIndex(
          target =>
            HotKeyService.checkIsSame(target.hotKey, left.hotKey) &&
            target.url === left.url &&
            target.selector === left.selector,
        )
        if (leftIndex === -1) {
          leftIndex = targets.indexOf(left)
        }
        let rightIndex = prevSortedTargets.findIndex(
          target =>
            HotKeyService.checkIsSame(target.hotKey, right.hotKey) &&
            target.url === right.url &&
            target.selector === right.selector,
        )
        if (rightIndex === -1) {
          rightIndex = targets.indexOf(right)
        }
        return leftIndex === -1 || rightIndex === -1 ? 1 : leftIndex - rightIndex
      }),
    )
  }, [targets])

  useEffect(() => {
    if (writingCountRef.current === 0) {
      updateSortedTargets()
    }
  }, [updateSortedTargets])

  const setTargetLocation = async (target: TargetConfig, location: TargetConfig['location']) => {
    const index = targets.indexOf(target)
    if (index === -1) {
      return
    }

    try {
      writingCountRef.current += 1

      await setTargets(
        targets.map(t => {
          if (t === target) {
            return { ...target, location }
          }
          return t
        }),
      )

      message.success(`This shortcut changed to ${location}`)
    } catch (error) {
      message.error('Failed to update')
    } finally {
      writingCountRef.current -= 1
    }
  }

  const editTarget = async (target: TargetConfig) => {
    setEditingTarget(target)
  }

  const removeTarget = async (target: TargetConfig) => {
    try {
      await setTargets(targets.filter(t => t !== target))
      message.success('Target removed')
    } catch (error) {
      message.error('Failed to remove target')
    }
  }

  return (
    <>
      <Card title="All Shortcuts">
        <List
          bordered
          dataSource={sortedTargets}
          renderItem={(item, offset) => (
            <List.Item
              key={offset}
              actions={[
                item.location === 'sync' && (
                  <Button
                    type="link"
                    onClick={() => setTargetLocation(item, 'local')}
                    icon={<CloudServerOutlined />}
                    key={0}>
                    Synced
                  </Button>
                ),
                item.location === 'local' && (
                  <Button
                    type="link"
                    onClick={() => setTargetLocation(item, 'sync')}
                    icon={<DesktopOutlined />}
                    key={0}>
                    Local
                  </Button>
                ),
                <Button type="link" onClick={() => editTarget(item)} icon={<EditOutlined />} key={1} />,
                <Button type="link" onClick={() => removeTarget(item)} icon={<DeleteOutlined />} key={2} />,
              ].filter(item => !!item)}>
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
      {editingTarget !== null && (
        <TargetEditLayer
          prevTarget={editingTarget}
          onClose={() => setEditingTarget(null)}
          targetElement={null}
          targetUrl={null}
        />
      )}
    </>
  )
}

export { ShortcutList }
