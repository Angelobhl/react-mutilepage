import React from 'react'

export const MqttServiceClientContext = /*#__PURE__*/ React.createContext(null)

if (process.env.NODE_ENV !== 'production') {
  MqttServiceClientContext.displayName = 'MqttClient'
}

export default MqttServiceClientContext
