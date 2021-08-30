import MqttSDK from '../../core/core'

class IMClient {
  core: MqttSDK
  url: string = ''
  uid: number = 0
  mainTopic: string = ''

  constructor () {
    this.core = new MqttSDK('client', this.url)
  }

  listen () {
    this.core.on('mqtt/connect', this.hanldeConnect)

    this.core.on(this.mainTopic, this.hanleMainMsg)
  }

  hanldeConnect () {
    this.core.sendMessage(this.mainTopic, {cmd: 'fetch', data: {size: 10}})
  }

  hanleMainMsg (data: any) {
    this.core.eventEmitter.emit(`im/region/${this.uid}/${data.cmd}`, data)
  }

  conect (uid: number, opts: MqttSDKOptions) {
    this.uid = uid
    this.mainTopic = `im/region/${uid}`
    this.listen()
    this.subscript()

    this.core.conect(opts)
  }

  subscript () {
    this.core.subscribe([this.mainTopic])
  }
}

export default IMClient
