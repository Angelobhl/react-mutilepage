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
