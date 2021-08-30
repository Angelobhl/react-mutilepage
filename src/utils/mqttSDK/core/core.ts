import MQTT from 'mqtt'
import {MqttConnestStatus} from '../types/types'

const DefalutProp: MqttSDKOptions = {
  clientId: '',
  username: '',
  password: '',
  keepalive: 50,
  reconnectPeriod: 1000
}

class MqttSDK {
  url: string = ''
  options: MqttSDKOptions = DefalutProp
  client: MQTT.Client | null = null
  connestStatus: number = MqttConnestStatus.Noconnect
  subscribeTopics: string[] = []

  conect (prop: MqttSDKProp) {
    this.url = prop.url
    this.options = Object.assign(DefalutProp, prop.options)
    this.client = MQTT.connect(this.url, this.options)
    this.setConnectStatus(MqttConnestStatus.Connecting)
    this.listen()
  }

  close () {
    if (this.client) {
      this.client.end()
    }
    this.subscribeTopics = []
  }

  setConnectStatus (status: number) {
    this.connestStatus = status
  }

  listen () {
    const client = this.client
    if (client) {
      client.on('connect', () => {
        this.setConnectStatus(MqttConnestStatus.Connected)
        this.subscribe()
      })

      client.on('message', (topic: string, message: string) => {
        this.onMessage(topic, message)
      })

      client.on('close', () => {
        this.setConnectStatus(MqttConnestStatus.Noconnect)
      })

      client.on('disconnect', () => {
        this.setConnectStatus(MqttConnestStatus.Noconnect)
        this.client = null
      })

      client.on('error', () => {
        this.setConnectStatus(MqttConnestStatus.Noconnect)
      })

      client.on('end', () => {
        this.setConnectStatus(MqttConnestStatus.Noconnect)
        this.client = null
      })

      client.on('reconnect', () => {
        this.setConnectStatus(MqttConnestStatus.Reconnecting)
        this.client = null
      })
    }
  }

  subscribe (topics: string[] = []) {
    topics.length && this.subscribeTopics.push(...topics)

    if (this.client && this.connestStatus === MqttConnestStatus.Connected) {
      let topic: string
      for (topic of this.subscribeTopics) {
        this.client.subscribe(topic)
      }
      this.subscribeTopics = []
    }
  }

  unsubscribe (topic: string) {
    if (this.client) {
      this.client.unsubscribe(topic)
    }
  }

  // 收到消息
  onMessage (topic: string, message: string) {}

  // 发送消息
  sendMessage () {}

  // 获取会话列表

  // 获取会话
}

export default MqttSDK
