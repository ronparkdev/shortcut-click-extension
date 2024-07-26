import { CloseCircleOutlined } from '@ant-design/icons'
import { Button, message } from 'antd'
import React from 'react'

const NOTIFICATION_CLASSNAME = '__shortclick_extension_notification__'

const MESSAGE_KEY = 'addTarget'

const showAddTargetToast = (onClose: () => void) => {
  message.open({
    className: NOTIFICATION_CLASSNAME,
    content: (
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <span style={{ flex: 1 }}>Click the component you want to add</span>
        <Button type="link" onClick={onClose} icon={<CloseCircleOutlined />} />
      </div>
    ),
    key: MESSAGE_KEY,
    duration: 0, // duration 0 to make the message stay until it's closed
  })
}

const showSavedToast = () => {
  message.success({
    className: NOTIFICATION_CLASSNAME,
    content: 'Shortcut set successfully!',
    key: MESSAGE_KEY,
    duration: 1500,
  })
}

const cancelAddTarget = () => {
  message.destroy(MESSAGE_KEY)
}

export const ToastService = { NOTIFICATION_CLASSNAME, showAddTargetToast, showSavedToast, cancelAddTarget }
