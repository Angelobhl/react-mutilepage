declare namespace MqttSDKCore {
  interface Options {
    clientId: string,
    username: string,
    password: string,
    keepalive?: number,
    reconnectPeriod?: number
  }

  type MessageType = 'TEXT' | 'TIP' | 'CARD' | 'IMAGE' | 'AUDIO' | 'VIDEO' | 'FILE'

  type MqttMainTopicCmd = 'chat' | 'err' | 'mark' | 'fetch' | 'newconv'
  type MqttChatTopicCmd = 'chat'

  interface User {
    nickname: string,
    avatar: string,
    gender: number
  }

  interface Listener {
    (...args: any[]): void
  }
}

declare namespace MqttMessage {
  interface CommonBoby {
    ver: string,
    [propName: string]: any
    extra?: {
      [propName: string]: any
    }
  }

  interface TextBody extends CommonBoby {
    text: string
  }

  interface TipBoby extends CommonBoby {
    text: string
  }

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

  interface CommonCmdBoby {
    cmd: MqttSDKCore.MqttMainTopicCmd | MqttSDKCore.MqttChatTopicCmd,
    direct: number,
    time?: number,
    [propName: string]: any
  }

  interface ChatCmd {
    cmd: 'chat',
    direct: number,
    time?: number,
    data: {
      'from_uid': number,
      'to_uid': number,
      sn: number,
      'msg_type': MqttSDKCore.MessageType,
      body: CommonBoby | TextBody | TipBoby | CardBody,
      time?: number
    }
  }

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

  interface FetchCmdData {
    'from_uid': number,
    'to_uid': number,
    body: CommonBoby | TextBody | TipBoby | CardBody
  }
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
  interface FetchDownCmd {
    cmd: 'fetch',
    direct: number,
    time?: number,
    data: FetchCmdData[]
  }

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

  interface ChatListItem {}
}

declare class MqttSDK {

  source: string
  url: string
  options: MqttSDKCore.Options
  client: MQTT.Client | null
  connestStatus: number
  subscribeTopics: string[]

  eventEmitter: EventEmitter

  constructor (source: string, url: string)

  conect (options: MqttSDKCore.Options): void

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
  on (event: string, listener: MqttSDKCore.Listener): void

  // 取消监听
  off (event: string, listener: MqttSDKCore.Listener): void

  // 取消监听全部
  offAll (event: string): void

  // 发布消息
  trigger (event: string, ...args: any[]): void
}

declare class IMClient {
  core: MqttSDK
  url: string
  uid: number
  mainTopic: string
  http: HttpRequest
  curChatOpend: number[]

  chatList: MqttMessage.ChatListItem[]

  constructor ()

  listen (): void

  hanldeConnect (): void

  hanldeClose (): void

  hanleMainMsg (data: MqttMessage.CommonCmdBoby): void

  conect (uid: number, opts: MqttSDKCore.Options): void

  close (): void

  getHistoryLists (): Promise<MqttMessage.ChatListItem[]>

  chatStart (toUid: number, listener: MqttSDKCore.Listener): void

  // 结束聊天
  chatEnd (toUid: number): void

  // 聊天对话框获取历史消息
  fetchHistory (toUid: number, page: number = 1): void

  // 标记已读
  readedFlagMark (toUid: number, msgId: number[]): void

  // 标记全部已读
  readedAllFlagMark (): void

  // 聊天发消息
  sendChatTextMsg (toUid: number, content: string): void
  sendChatMsg (toUid: number, msgBody: MqttMessage.TextBody, type: MqttSDKCore.MessageType): void

  getChatTopic (toUid: number) : void
}
