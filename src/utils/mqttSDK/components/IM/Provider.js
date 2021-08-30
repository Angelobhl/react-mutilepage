import React from 'react'
import { MqttIMClientContext } from './Context'
import MqttSDK from '../../core/core'

function MqttIMClientProvider({ context = null, children }) {
  const Context = context || MqttIMClientContext

  const client = new MqttSDK()

  return <Context.Provider value={{client}}>{children}</Context.Provider>
}

export default MqttIMClientProvider
