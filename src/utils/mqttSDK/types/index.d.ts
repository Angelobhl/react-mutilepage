declare namespace MqttSDKCore {
  interface Options {
    clientId: string,
    username: string,
    password: string,
    keepalive?: number,
    reconnectPeriod?: number
  }

  type MessageType = 'Text' | 'Tip' | 'Card' | 'IMAGE' | 'Audio' | 'Video' | 'FILE'

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

  interface ChatCmd {
    cmd: 'chat',
    data: {
      'from_uid': number,
      'to_uid': number,
      sn: number,
      'msg_type': MqttSDKCore.MessageType,
      body: CommonBoby | TextBody | TipBoby | CardBody
    }
  }

  interface ErrCmd {
    cmd: 'err',
    code: number,
    data: {
      uid: number,
      sn: number,
      message: string
    }
  }

  interface MarkCmd {
    cmd: 'mark',
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
    data: {
      uid: number,
      page: number,
      size: number
    }
  }
  interface FetchDownCmd {
    cmd: 'fetch',
    data: FetchCmdData[]
  }

  interface NewconvCmd {
    cmd: 'newconv',
    data: {
      cnt: number,
      text: string,
      timestamp: string,
      user: MqttSDKCore.User
    }
  }
}
