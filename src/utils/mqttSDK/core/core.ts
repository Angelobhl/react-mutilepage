import MQTT from 'mqtt'
import {MqttConnestStatus} from '../types/types'
import {EventEmitter} from 'events'

const DefalutProp: MqttSDKCore.Options = {
  clientId: '',
  username: '',
  password: '',
  keepalive: 50,
  reconnectPeriod: 1000
}
/**
 * MqttSDK类
 */
class MqttSDK {
  /**
   * 应用来源
   */
  source: string = ''
  /**
   * 服务器url
   */
  url: string = ''
  /**
   * 连接参数
   */
  options: MqttSDKCore.Options = DefalutProp
  /**
   * mqtt client
   */
  client: MQTT.Client | null = null
  /**
   * 连接状态
   */
  connestStatus: number = MqttConnestStatus.Noconnect
  /**
   * 带订阅的topic
   */
  subscribeTopics: string[] = []

  /**
   * event bus
   */
  eventEmitter: EventEmitter = new EventEmitter()

  /**
   * 构造函数
   * @param source 应用来源
   * @param url 服务器地址
   */
  constructor (source: string, url: string) {
    this.source = source
    this.url = url
  }

  /**
   * 连接mqtt
   * @param options 连接参数
   */
  conect (options: MqttSDKCore.Options) {
    this.options = Object.assign(DefalutProp, options)
    this.client = MQTT.connect(this.url, this.options)
    this.setConnectStatus(MqttConnestStatus.Connecting)
    this.listen()
  }

  /**
   * 关闭mqtt
   */
  close () {
    if (this.client) {
      this.client.end()
    }
    this.subscribeTopics = []
  }

  /**
   * 设置连接状态
   * @param status 状态码
   */
  setConnectStatus (status: number) {
    this.connestStatus = status
  }

  /**
   * 监听
   */
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
        this.trigger('mqtt/close')
      })

      client.on('disconnect', () => {
        this.setConnectStatus(MqttConnestStatus.Noconnect)
        this.client = null
        this.trigger('mqtt/close')
      })

      client.on('error', () => {
        this.setConnectStatus(MqttConnestStatus.Noconnect)
        this.trigger('mqtt/close')
      })

      client.on('end', () => {
        this.setConnectStatus(MqttConnestStatus.Noconnect)
        this.client = null
        this.trigger('mqtt/close')
      })

      client.on('reconnect', () => {
        this.setConnectStatus(MqttConnestStatus.Reconnecting)
        this.client = null
      })
    }
  }

  /**
   * 订阅topic
   * @param topics 要订阅的topic数组
   */
  subscribe (topics: string[] = []) {
    topics.length && this.subscribeTopics.push(...topics)

    if (this.client && this.connestStatus === MqttConnestStatus.Connected) {
      let topic: string
      for (topic of this.subscribeTopics) {
        console.log('core subscribe', topic)
        const s = topic
        this.client.subscribe(topic, (e) => {
          console.log('core subscribe result', s, e)
        })
      }
      this.subscribeTopics = []
    }
  }

  /**
   * 取消订阅
   * @param topic 要取消订阅的topic
   */
  unsubscribe (topic: string) {
    if (this.client) {
      this.client.unsubscribe(topic)
    }
  }

  /**
   * 处理收到的消息
   * @param topic 订阅的topic
   * @param message topic的消息内容
   */
  onMessage (topic: string, message: string) {
    const data = JSON.parse(message)
    this.trigger(topic, data)
  }

  /**
   * 向mqtt发送消息
   * @param topic 消息目标的topic
   * @param data 消息的内容，json体
   */
  sendMessage (topic: string, data: any) {
    let msg: string = ''

    if (typeof data !== 'string') {
      msg = JSON.stringify(data)
    } else {
      msg = data
    }

    console.log('core sendMessage', topic, data, msg)
    this.client && this.client.publish(topic, msg)
  }

  /**
   * 监听event bus的消息
   * @param event 消息名称
   * @param listener 消息处理函数
   */
  on (event: string, listener: MqttSDKCore.Listener) {
    event = this.source + '/' + event
    this.eventEmitter.on(event, listener)
  }

  /**
   * 取消监听event bus的消息
   * @param event 消息名称
   * @param listener 消息处理函数
   */
  off (event: string, listener: MqttSDKCore.Listener) {
    event = this.source + '/' + event
    this.eventEmitter.removeListener(event, listener)
  }

  /**
   * 取消监听event bus的消息
   * @param event 消息名称
   */
  offAll (event: string) {
    event = this.source + '/' + event
    this.eventEmitter.removeAllListeners(event)
  }

  /**
   * 发布event bus消息
   * @param event 消息名称
   * @param args 消息内容
   */
  trigger (event: string, ...args: any[]) {
    event = this.source + '/' + event
    console.log('core trigger', event, ...args)
    this.eventEmitter.emit(event, ...args)
  }
}

export default MqttSDK
