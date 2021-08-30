import React from 'react'
import { MqttIMClientContext } from './Context'
import IMClient from './IMClient'

function MqttIMClientProvider({ context = null, children }) {
  const Context = context || MqttIMClientContext

  const client = new IMClient()

  return <Context.Provider value={{client}}>{children}</Context.Provider>
}

export default MqttIMClientProvider
