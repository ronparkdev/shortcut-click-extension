import { ExportOutlined, UnorderedListOutlined } from '@ant-design/icons'
import { Layout, Menu } from 'antd'
import React, { useState } from 'react'

import { ImportOrExport } from './ImportOrExport'
import { ShortcutList } from './ShortcutList'

const { Sider, Content } = Layout

const AppLayout = () => {
  const [collapsed, setCollapsed] = useState(false)

  const [menu, setMenu] = useState(1)

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        theme="light"
        trigger={null}
        collapsible
        collapsed={collapsed}
        breakpoint="lg"
        onBreakpoint={broken => {
          setCollapsed(broken)
        }}>
        <Menu theme="light" mode="inline" selectedKeys={[String(menu)]} onClick={e => setMenu(Number(e.key))}>
          <Menu.Item key="1" icon={<UnorderedListOutlined />}>
            Shortcuts
          </Menu.Item>
          <Menu.Item key="2" icon={<ExportOutlined />}>
            Import/Export
          </Menu.Item>
        </Menu>
      </Sider>
      <Layout className="site-layout">
        <Content
          style={{
            margin: '24px 16px',
            padding: 24,
            minHeight: 280,
          }}>
          {menu === 1 && <ShortcutList />}
          {menu === 2 && <ImportOrExport />}
        </Content>
      </Layout>
    </Layout>
  )
}

export { AppLayout }
