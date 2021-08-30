import React from 'react'

export const MqttIMClientContext = /*#__PURE__*/ React.createContext(null)

if (process.env.NODE_ENV !== 'production') {
  MqttIMClientContext.displayName = 'MqttClient'
}

export default MqttIMClientContext
