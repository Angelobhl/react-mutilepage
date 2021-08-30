import React, {ReactNode} from 'react'
import IMClient from './IMClient'

const client = new IMClient()
const MqttIMClientContext = /*#__PURE__*/ React.createContext({client})

if (process.env.NODE_ENV !== 'production') {
  MqttIMClientContext.displayName = 'MqttClient'
}

const MqttIMClientProvider: React.FC<{ children: ReactNode }> = (props) => {
  return <MqttIMClientContext.Provider value={{client}}>{props.children}</MqttIMClientContext.Provider>
}

export default MqttIMClientProvider
export {MqttIMClientProvider, MqttIMClientContext}