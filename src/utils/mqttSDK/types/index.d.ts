declare interface MqttSDKOptions {
  clientId: string,
  username: string,
  password: string,
  keepalive?: number,
  reconnectPeriod?: number
}

declare interface MqttSDKProp {
  url: string,
  options: MqttSDKOptions
}

declare class MqttSDK {
  source: string
  url: string
  options: MqttSDKOptions
  client: MQTT.Client | null
  connestStatus: number
  subscribeTopics: string[]

  eventEmitter: EventEmitter

  constructor (source: string, url: string)

  conect (options: MqttSDKOptions): void

  close (): void

  setConnectStatus (status: number): void

  listen (): void

  subscribe (topics: string[] = []): void

  unsubscribe (topic: string): void

  // 收到消息
  onMessage (topic: string, message: string): void

  // 发送消息
  sendMessage (topic: string, data: any): void

  // 监听消息
  on (event: string, listener: (...args: any[]) => void): void

  // 取消监听
  off (event: string, listener: (...args: any[]) => void): void

  // 取消监听全部
  offAll (event: string): void

  // 发布消息
  trigger (event: string, ...args: any[]): void
}
