import MQTT from 'mqtt'
import {MqttConnestStatus} from '../types/types'
import {EventEmitter} from 'events'

const DefalutProp: MqttSDKOptions = {
  clientId: '',
  username: '',
  password: '',
  keepalive: 50,
  reconnectPeriod: 1000
}

class MqttSDK {
  source: string = ''
  url: string = ''
  options: MqttSDKOptions = DefalutProp
  client: MQTT.Client | null = null
  connestStatus: number = MqttConnestStatus.Noconnect
  subscribeTopics: string[] = []

  eventEmitter: EventEmitter = new EventEmitter()

  constructor (source: string, url: string) {
    this.source = source
    this.url = url
  }

  conect (options: MqttSDKOptions) {
    this.options = Object.assign(DefalutProp, options)
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
        this.trigger('mqtt/connect')
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
  onMessage (topic: string, message: string) {
    const data = JSON.parse(message)
    this.trigger(topic, data)
  }

  // 发送消息
  sendMessage () {}

  // 获取会话列表

  // 获取会话

  // 监听消息
  on (event: string, listener: (...args: any[]) => void) {
    event = this.source + '/' + event
    this.eventEmitter.on(event, listener)
  }

  // 取消监听
  off (event: string, listener: (...args: any[]) => void) {
    event = this.source + '/' + event
    this.eventEmitter.removeListener(event, listener)
  }

  // 取消监听全部
  offAll (event: string) {
    event = this.source + '/' + event
    this.eventEmitter.removeAllListeners(event)
  }

  // 发布消息
  trigger (event: string, ...args: any[]) {
    event = this.source + '/' + event
    this.eventEmitter.emit(event, ...args)
  }
}

export default MqttSDK
