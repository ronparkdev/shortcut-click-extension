/* eslint-disable @typescript-eslint/no-explicit-any */
import { UploadOutlined, DownloadOutlined } from '@ant-design/icons'
import { Card, Statistic, Select, Button, Upload, message, Layout, Flex } from 'antd'
import type { DefaultOptionType } from 'antd/es/select'
import React, { useState } from 'react'

const { Option } = Select

const ImportOrExport: React.FC = () => {
  const [localItemCount, setLocalItemCount] = useState(0)
  const [remoteItemCount, setRemoteItemCount] = useState(0)
  const [selectedItems, setSelectedItems] = useState([])

  const items = [
    { id: 1, name: 'Item 1' },
    { id: 2, name: 'Item 2' },
    { id: 3, name: 'Item 3' },
    // ... more items
  ]

  const handleItemSelect = (value: any) => {
    setSelectedItems(value)
  }

  const handleImport = (info: any) => {
    if (info.file.status === 'done') {
      const reader = new FileReader()
      reader.onload = e => {
        try {
          const importedData = JSON.parse(e.target.result)
          // Process the imported data here
          message.success(`${info.file.name} 파일을 성공적으로 임포트했습니다.`)
          // Update local item count (예시)
          setLocalItemCount(importedData.length)
        } catch (error) {
          message.error('JSON 파싱 중 오류가 발생했습니다.')
        }
      }
      reader.readAsText(info.file.originFileObj)
    } else if (info.file.status === 'error') {
      message.error(`${info.file.name} 파일 업로드에 실패했습니다.`)
    }
  }

  const handleExport = () => {
    const dataStr = JSON.stringify(selectedItems, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr)
    const exportFileDefaultName = 'exported_items.json'

    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
  }

  return (
    <Card title="Import & Export Shortcuts">
      <Flex gap={8}>
        <Statistic title="로컬 아이템 갯수" value={localItemCount} />
        <Statistic title="리모트 아이템 갯수" value={remoteItemCount} />
      </Flex>

      <Select
        mode="multiple"
        style={{ width: '100%', marginTop: 16 }}
        placeholder="아이템 선택"
        onChange={handleItemSelect}>
        {items.map(item => (
          <Option key={item.id} value={item.id}>
            {item.name}
          </Option>
        ))}
      </Select>

      <Upload
        accept=".json"
        showUploadList={false}
        customRequest={({ file, onSuccess }) => {
          setTimeout(() => {
            onSuccess?.('ok')
          }, 0)
        }}
        onChange={handleImport}>
        <Button icon={<UploadOutlined />} style={{ marginTop: 16, marginRight: 8 }}>
          JSON 임포트
        </Button>
      </Upload>

      <Button
        icon={<DownloadOutlined />}
        onClick={handleExport}
        style={{ marginTop: 16 }}
        disabled={selectedItems.length === 0}>
        JSON 엑스포트
      </Button>
    </Card>
  )
}

export { ImportOrExport }
