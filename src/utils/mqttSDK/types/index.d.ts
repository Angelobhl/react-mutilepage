/**
 * mqtt核心
 */
declare namespace MqttSDKCore {
  // mqtt连接参数
  interface Options {
    clientId: string,
    username: string,
    password: string,
    keepalive?: number,
    reconnectPeriod?: number
  }

  /**
   * 协议类型
   */
  type MqttMainTopicCmd = 'chat' | 'err' | 'mark' | 'fetch' | 'newconv'
  type MqttChatTopicCmd = 'chat'

  /**
   * 用户信息
   */
  interface User {
    nickname: string,
    avatar: string,
    gender: number,
    avatar: string
  }

  /**
   * 消息监听后处理的函数
   */
  interface Listener {
    (...args: any[]): void
  }
}

declare namespace MqttMessage {
  /**
   * 聊天内容类型
   */
  type MessageType = 'TEXT' | 'TIP' | 'CARD' | 'IMAGE' | 'AUDIO' | 'VIDEO' | 'FILE'

  /**
   * 通用的消息body
   */
  interface CommonBoby {
    ver: string,
    [propName: string]: any
    extra?: {
      [propName: string]: any
    }
  }

  /**
   * 文字类型的消息body
   */
  interface TextBody extends CommonBoby {
    text: string
  }

  /**
   * tip类型的消息body
   */
  interface TipBoby extends CommonBoby {
    text: string
  }

  /**
   * 卡片消息
   */
  interface CardBody extends CommonBoby {
    extra: {
      title: string,
      detail: string,
      width: number,
      height: number,
      scheme: string,
      [propName: string]: any
    }
  }

  /**
   * 通用消息
   */
  interface CommonCmd {
    cmd: MqttSDKCore.MqttMainTopicCmd | MqttSDKCore.MqttChatTopicCmd,
    direct: number,
    time?: number,
    [propName: string]: any
  }

  /**
   * 聊天消息
   */
  interface ChatCmd {
    cmd: 'chat',
    direct: number,
    time?: number,
    data: {
      'from_uid': number,
      'to_uid': number,
      sn: number,
      'msg_type': MessageType,
      body: CommonBoby | TextBody | TipBoby | CardBody,
      time?: number
    }
  }

  /**
   * 错误消息
   */
  interface ErrCmd {
    cmd: 'err',
    direct: number,
    time?: number,
    code: number,
    data: {
      uid: number,
      sn: number,
      message: string
    }
  }

  /**
   * 标记消息
   */
  interface MarkCmd {
    cmd: 'mark',
    direct: number,
    time?: number,
    data: {
      'from_uid': number,
      'to_uid': number,
      'msg_id': number[]
    }
  }

  /**
   * 获取消息
   */
  interface FetchCmdData {
    'from_uid': number,
    'to_uid': number,
    body: CommonBoby | TextBody | TipBoby | CardBody
  }
  /**
   * 获取消息上行
   */
  interface FetchUpCmd {
    cmd: 'fetch',
    direct: number,
    time?: number,
    data: {
      uid: number,
      page: number,
      size: number
    }
  }
  /**
   * 获取消息下行
   */
  interface FetchDownCmd {
    cmd: 'fetch',
    direct: number,
    time?: number,
    data: {
      cnt: number,
      list: FetchCmdData[]
    }
  }

  /**
   * 新消息
   */
  interface NewconvCmd {
    cmd: 'newconv',
    direct: number,
    time?: number,
    data: {
      cnt: number,
      text: string,
      timestamp: string,
      user: MqttSDKCore.User
    }
  }

  /**
   * 聊天列表item
   */
  interface ChatListItem {
    'un_read_cnt': number,
    time: number,
    body: CommonBoby,
    user: MqttSDKCore.User
  }
}

/**
 * MqttSDK类
 */
declare class MqttSDK {
  /**
   * 应用来源
   */
  source: string
  /**
   * 服务器url
   */
  url: string
  /**
   * 连接参数
   */
  options: MqttSDKCore.Options
  /**
   * mqtt client
   */
  client: MQTT.Client | null
  /**
   * 连接状态
   */
  connestStatus: number
  /**
   * 带订阅的topic
   */
  subscribeTopics: string[]

  /**
   * event bus
   */
  eventEmitter: EventEmitter

  /**
   * 构造函数
   * @param source 应用来源
   * @param url 服务器地址
   */
  constructor (source: string, url: string)

  /**
   * 连接mqtt
   * @param options 连接参数
   */
  conect (options: MqttSDKCore.Options): void

  /**
   * 关闭mqtt
   */
  close (): void

  /**
   * 设置连接状态
   * @param status 状态码
   */
  setConnectStatus (status: number): void

  /**
   * 监听
   */
  listen (): void

  /**
   * 订阅topic
   * @param topics 要订阅的topic数组
   */
  subscribe (topics: string[] = []): void

  /**
   * 取消订阅
   * @param topic 要取消订阅的topic
   */
  unsubscribe (topic: string): void

  /**
   * 处理收到的消息
   * @param topic 订阅的topic
   * @param message topic的消息内容
   */
  onMessage (topic: string, message: string): void

  /**
   * 向mqtt发送消息
   * @param topic 消息目标的topic
   * @param data 消息的内容，json体
   */
  sendMessage (topic: string, data: any): void

  /**
   * 监听event bus的消息
   * @param event 消息名称
   * @param listener 消息处理函数
   */
  on (event: string, listener: MqttSDKCore.Listener): void

  /**
   * 取消监听event bus的消息
   * @param event 消息名称
   * @param listener 消息处理函数
   */
  off (event: string, listener: MqttSDKCore.Listener): void

  /**
   * 取消监听event bus的消息
   * @param event 消息名称
   */
  offAll (event: string): void

  /**
   * 发布event bus消息
   * @param event 消息名称
   * @param args 消息内容
   */
  trigger (event: string, ...args: any[]): void
}

/**
 * IMClient类
 */
declare class IMClient {
  /**
   * MqttSDK实例对象
   */
  core: MqttSDK
  /**
   * mqtt服务器地址
   */
  url: string
  /**
   * 当前登录用户的uid
   */
  uid: number
  /**
   * 订阅的主要topic
   */
  mainTopic: string
  /**
   * axios实例对象
   */
  http: HttpRequest
  /**
   * 当前开启的会话窗口
   */
  curChatOpend: number[]
  /**
   * 消息列表
   */
  chatList: MqttMessage.ChatListItem[]

  /**
   * 构造函数
   */
  constructor ()

  /**
   * 监听
   */
  listen (): void

  /**
   * mqtt连接成功回调
   */
  hanldeConnect (): void

  /**
   * mqtt断开回调
   */
  hanldeClose (): void

  /**
   * 再进一步广播收到的系统交互topic消息
   * @param data mqtt消息内容
   */
  hanleMainMsg (data: MqttMessage.CommonCmd): void

  /**
   * 连接mqtt
   * @param uid 发起连接的用户uid
   * @param opts 连接参数
   */
  conect (uid: number, opts: MqttSDKCore.Options): void

  /**
   * 断开mqtt
   */
  close (): void

  /**
   * 获取历史消息队列
   * @returns 返回消息列表
   */
  getHistoryLists (): Promise<MqttMessage.ChatListItem[]>

  /**
   * 开始聊天
   * @param toUid 聊天对象uid
   * @param listener 聊天消息监听函数
   */
  chatStart (toUid: number, listener: MqttSDKCore.Listener): void

  /**
   * 结束聊天
   * @param toUid 聊天对象uid
   */
  chatEnd (toUid: number): void

  /**
   * 聊天对话框获取历史消息
   * @param toUid 聊天对象uid
   * @param page 页数
   */
  fetchHistory (toUid: number, page: number = 1): void

  /**
   * 标记已读
   * @param toUid 聊天对象uid
   * @param msgId 消息id数组
   */
  readedFlagMark (toUid: number, msgId: number[]): void

  /**
   * 标记全部已读
   */
  readedAllFlagMark (): void

  /**
   * 聊天发文字消息
   * @param toUid 聊天对象uid
   * @param content 文字内容
   */
  sendChatTextMsg (toUid: number, content: string): void
  /**
   * 发消息
   * @param toUid 聊天对象uid
   * @param msgBody 聊天消息体
   * @param type 消息类型 'TEXT' | 'TIP' | 'CARD' | 'IMAGE' | 'AUDIO' | 'VIDEO' | 'FILE'
   */
  sendChatMsg <T extends MqttMessage.CommonBoby>(toUid: number, msgBody: T, type: MqttSDKCore.MessageType): void

  /**
   * 获取聊天需要订阅的topic
   * @param toUid 聊天对象
   * @returns 订阅的topic
   */
  getChatTopic (toUid: number) : string
}
