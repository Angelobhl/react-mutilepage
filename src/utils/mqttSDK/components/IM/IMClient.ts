import MqttSDK from '../../core/core'

class IMClient {
  core: MqttSDK
  url: string = ''

  constructor () {
    this.core = new MqttSDK('client', this.url)
  }

  listen (uid: number) {
    this.core.on('mqtt/connect', this.hanldeConnect)

    this.core.on(`im/region/${uid}`, this.hanleMainMsg)
  }

  hanldeConnect () {}

  hanleMainMsg (data: any) {}

  conect (uid: number, opts: MqttSDKOptions) {
    this.listen(uid)
    this.subscript(uid)

    this.core.conect(opts)
  }

  subscript (uid: number) {
    this.core.subscribe([`im/region/${uid}`])
  }
}

export default IMClient
