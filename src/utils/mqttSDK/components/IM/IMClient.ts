import MqttSDK from '../../core/core'
import HttpRequest, {ResponseData} from '../../core/axios'
import { AxiosPromise } from 'axios'

class IMClient {
  core: MqttSDK
  url: string = 'ws://beta-mqtt.zhanqi.com:18884/ws'
  uid: number = 0
  mainTopic: string = ''
  http: HttpRequest = new HttpRequest('')
  curChatOpend: number[] = []

  chatList: MqttMessage.ChatListItem[] = []

  constructor () {
    this.core = new MqttSDK('client', this.url)
  }

  listen () {
    this.core.on('mqtt/connect', this.hanldeConnect.bind(this))
    this.core.on('mqtt/close', this.hanldeClose.bind(this))

    // 监听系统topic下行消息
    this.core.on(this.mainTopic, this.hanleMainMsg.bind(this))
  }

  hanldeConnect () {}

  hanldeClose () {
    // 结束当前全部聊天
    while (this.curChatOpend.length) {
      this.chatEnd(this.curChatOpend.pop() as number)
    }
    this.core.off('mqtt/connect', this.hanldeConnect.bind(this))
    this.core.off('mqtt/close', this.hanldeClose.bind(this))
    this.core.off(this.mainTopic, this.hanleMainMsg.bind(this))
    this.core.unsubscribe(this.mainTopic)
  }

  // 再进一步广播收到的系统交互topic消息
  hanleMainMsg (data: MqttMessage.CommonCmdBoby) {
    console.log('IMClient hanleMainMsg', data)
    this.core.eventEmitter.emit(`${this.mainTopic}/${data.cmd}`, data)

    /// todo
    if (data.cmd === 'newconv') {
      this.chatList.push({})
    }
  }

  conect (uid: number, opts: MqttSDKCore.Options) {
    this.uid = uid
    this.mainTopic = `im/region/userchan/${uid}`
    this.listen()
    this.core.subscribe([this.mainTopic])
    this.core.conect(opts)
  }

  close () {
    this.core.close()
  }

  // 获取历史消息队列
  async getHistoryLists (): Promise<MqttMessage.ChatListItem[]> {
    const {data: {code, data}} = await (this.http.request({
      url: '',
      method: 'GET'
    }) as AxiosPromise<ResponseData>)

    if (code === 0) {
      this.chatList = data
    }

    return this.chatList
  }

  // 开始聊天
  chatStart (toUid: number, listener: MqttSDKCore.Listener) {
    if (!this.curChatOpend.includes(toUid)) {
      this.curChatOpend.push(toUid)
      const topic = this.getChatTopic(toUid)
      this.core.on(topic, listener)
      this.core.subscribe([topic])
    }
  }

  // 结束聊天
  chatEnd (toUid: number) {
    const topic = this.getChatTopic(toUid)
    this.core.offAll(topic)
    this.core.unsubscribe(topic)
  }

  // 聊天对话框获取历史消息
  fetchHistory (toUid: number, page: number = 1) {
    const data: MqttMessage.FetchUpCmd = {
      cmd: 'fetch',
      direct: 0,
      data: {uid: toUid, page: page, size: 10}
    }
    this.core.sendMessage(this.mainTopic, data)
  }

  // 标记已读
  readedFlagMark (toUid: number, msgId: number[]) {
    const data: MqttMessage.MarkCmd = {
      cmd: 'mark',
      direct: 0,
      data: {
        'from_uid': this.uid,
        'to_uid': toUid,
        'msg_id': msgId
      }
    }
    this.core.sendMessage(this.mainTopic, data)
  }

  // 标记全部已读
  readedAllFlagMark () {}

  // 聊天发消息
  sendChatTextMsg (toUid: number, content: string) {
    let msgBody: MqttMessage.TextBody = {
      ver: '1.0',
      text: content
    }

    this.sendChatMsg(toUid, msgBody, 'TEXT')
  }
  sendChatMsg (toUid: number, msgBody: MqttMessage.TextBody, type: MqttSDKCore.MessageType) {
    const messageData: MqttMessage.ChatCmd = {
      cmd: 'chat',
      direct: 0,
      data: {
        'from_uid': this.uid,
        'to_uid': toUid,
        sn: 18,
        'msg_type': type,
        body: msgBody
      }
    }
    this.core.sendMessage(this.mainTopic, messageData)
  }

  getChatTopic (toUid: number) {
    if (this.uid > toUid) {
      return `im/region/chat/${this.uid}/${toUid}`
    } else {
      return `im/region/chat/${toUid}/${this.uid}`
    }
  }
}

export default IMClient
