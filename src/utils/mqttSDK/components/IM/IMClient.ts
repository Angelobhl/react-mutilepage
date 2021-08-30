import MqttSDK from '../../core/core'
import HttpRequest, {ResponseData} from '../../core/axios'
import { AxiosPromise } from 'axios'

class IMClient {
  core: MqttSDK
  url: string = ''
  uid: number = 0
  mainTopic: string = ''
  http: HttpRequest = new HttpRequest('')
  curChatOpend: number[] = []

  constructor () {
    this.core = new MqttSDK('client', this.url)
  }

  listen () {
    this.core.on('mqtt/connect', this.hanldeConnect)
    this.core.on('mqtt/close', this.hanldeClose)

    // 监听系统topic下行消息
    this.core.on(this.mainTopic, this.hanleMainMsg)
  }

  hanldeConnect () {}

  hanldeClose () {
    // 结束当前全部聊天
    while (this.curChatOpend.length) {
      this.chatEnd(this.curChatOpend[0])
    }
    this.core.off('mqtt/connect', this.hanldeConnect)
    this.core.off(this.mainTopic, this.hanleMainMsg)
    this.core.unsubscribe(this.mainTopic)
  }

  // 再进一步广播收到的系统交互topic消息
  hanleMainMsg (data: any) {
    this.core.eventEmitter.emit(`${this.mainTopic}/${data.cmd}`, data)
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
  getHistoryLists (): AxiosPromise<ResponseData> {
    return this.http.request({
      url: '',
      method: 'GET'
    })
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
      data: {uid: toUid, page: page, size: 10}
    }
    this.core.sendMessage(this.mainTopic, data)
  }

  // 标记已读
  readedFlagMark (toUid: number, msgId: number[]) {
    const data: MqttMessage.MarkCmd = {
      cmd: 'mark',
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

    this.sendChatMsg(toUid, msgBody, 'Text')
  }
  sendChatMsg (toUid: number, msgBody: MqttMessage.TextBody, type: MqttSDKCore.MessageType) {
    const messageData: MqttMessage.ChatCmd = {
      cmd: 'chat',
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
