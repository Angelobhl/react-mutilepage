import MqttSDK from '../../core/core'
import HttpRequest, {ResponseData} from '../../core/axios'
import { AxiosPromise } from 'axios'

/**
 * IMClient类
 */
class IMClient {
  /**
   * MqttSDK实例对象
   */
  core: MqttSDK
  /**
   * mqtt服务器地址
   */
  url: string = 'ws://beta-mqtt.zhanqi.com:18884/ws'
  /**
   * 当前登录用户的uid
   */
  uid: number = 0
  /**
   * 订阅的主要topic
   */
  mainTopic: string = ''
  /**
   * axios实例对象
   */
  http: HttpRequest = new HttpRequest('http://lwfz.beta.zhanqi.com')
  /**
   * 当前开启的会话窗口
   */
  curChatOpend: number[] = []

  /**
   * 消息列表
   */
  chatList: MqttMessage.ChatListItem[] = []

  /**
   * 构造函数
   */
  constructor () {
    this.core = new MqttSDK('client', this.url)
  }

  /**
   * 监听
   */
  listen () {
    this.core.on('mqtt/connect', this.hanldeConnect.bind(this))
    this.core.on('mqtt/close', this.hanldeClose.bind(this))

    // 监听系统topic下行消息
    this.core.on(this.mainTopic, this.hanleMainMsg.bind(this))
  }

  /**
   * mqtt连接成功回调
   */
  hanldeConnect () {}

  /**
   * mqtt断开回调
   */
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

  /**
   * 再进一步广播收到的系统交互topic消息
   * @param data mqtt消息内容
   */
  hanleMainMsg (data: MqttMessage.CommonCmd) {
    console.log('IMClient hanleMainMsg', data)
    this.core.eventEmitter.emit(`${this.mainTopic}/${data.cmd}`, data)

    /// todo
    if (data.cmd === 'newconv') {
      this.chatList.push({
        'un_read_cnt': 1,
        time: data.time as number,
        body: data.data.body,
        user: data.data.User
      })
    }
  }

  /**
   * 连接mqtt
   * @param uid 发起连接的用户uid
   * @param opts 连接参数
   */
  conect (uid: number, opts: MqttSDKCore.Options) {
    this.uid = uid
    this.mainTopic = `im/region/userchan/${uid}`
    this.listen()
    this.core.subscribe([this.mainTopic])
    this.core.conect(opts)
  }

  /**
   * 断开mqtt
   */
  close () {
    this.core.close()
  }

  /**
   * 获取历史消息队列
   * @returns 返回消息列表
   */
  async getHistoryLists (): Promise<MqttMessage.ChatListItem[]> {
    const {data: {code, data}} = await (this.http.request({
      url: '/msg/im/v1/chat/conversion/list',
      method: 'GET'
    }) as AxiosPromise<ResponseData>)

    if (code === 0) {
      this.chatList = data
    }

    return this.chatList
  }

  /**
   * 开始聊天
   * @param toUid 聊天对象uid
   * @param listener 聊天消息监听函数
   */
  chatStart (toUid: number, listener: MqttSDKCore.Listener) {
    if (!this.curChatOpend.includes(toUid)) {
      this.curChatOpend.push(toUid)
      const topic = this.getChatTopic(toUid)
      this.core.on(topic, listener)
      this.core.subscribe([topic])
    }
  }

  /**
   * 结束聊天
   * @param toUid 聊天对象uid
   */
  chatEnd (toUid: number) {
    const topic = this.getChatTopic(toUid)
    this.core.offAll(topic)
    this.core.unsubscribe(topic)
  }

  /**
   * 聊天对话框获取历史消息
   * @param toUid 聊天对象uid
   * @param page 页数
   */
  fetchHistory (toUid: number, page: number = 1) {
    const data: MqttMessage.FetchUpCmd = {
      cmd: 'fetch',
      direct: 0,
      data: {uid: toUid, page: page, size: 10}
    }
    this.core.sendMessage(this.mainTopic, data)
  }

  /**
   * 标记已读
   * @param toUid 聊天对象uid
   * @param msgId 消息id数组
   */
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

  /**
   * 标记全部已读
   */
  readedAllFlagMark () {}

  /**
   * 聊天发文字消息
   * @param toUid 聊天对象uid
   * @param content 文字内容
   */
  sendChatTextMsg (toUid: number, content: string) {
    let msgBody: MqttMessage.TextBody = {
      ver: '1.0',
      text: content
    }

    this.sendChatMsg<MqttMessage.TextBody>(toUid, msgBody, 'TEXT')
  }
  /**
   * 发消息
   * @param toUid 聊天对象uid
   * @param msgBody 聊天消息体
   * @param type 消息类型 'TEXT' | 'TIP' | 'CARD' | 'IMAGE' | 'AUDIO' | 'VIDEO' | 'FILE'
   */
  sendChatMsg <T extends MqttMessage.CommonBoby>(toUid: number, msgBody: T, type: MqttMessage.MessageType) {
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

  /**
   * 获取聊天需要订阅的topic
   * @param toUid 聊天对象
   * @returns 订阅的topic
   */
  getChatTopic (toUid: number) {
    if (this.uid > toUid) {
      return `im/region/chat/${this.uid}/${toUid}`
    } else {
      return `im/region/chat/${toUid}/${this.uid}`
    }
  }
}

export default IMClient
