import React from 'react'
import { MqttServiceClientContext } from './Context'
import MqttSDK from '../../core/core'

function MqttServiceClientProvider({ context = null, children }) {
  const Context = context || MqttServiceClientContext

  const service = new MqttSDK()

  return <Context.Provider value={{service}}>{children}</Context.Provider>
}

export default MqttServiceClientProvider
