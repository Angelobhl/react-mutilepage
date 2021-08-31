import React from 'react';
import {MqttIMClientContext} from '../../../utils/mqttSDK'

class App extends React.Component<{}> {
  client: IMClient | null = null

  static contextType = MqttIMClientContext

  componentDidMount () {
    this.client = this.context.client

    this.client?.core.on('mqtt/connect', this.afterConnect.bind(this))

    this.client?.conect(18, { clientId: '', username: 'region:18', password: 'eyJhbGciOiJIUzI1NiJ9.eyJqdGkiOiIxOCIsImV4cCI6MTYzMjU2MDc5OX0.0pgWj3tHaMXkwkvwxWbyM2TAoMGkw75r9ftrxuWerQY=' })
  }

  afterConnect () {
    console.log('Page afterConnect')
    this.client?.chatStart(48, this.listenMsg.bind(this))
  }

  listenMsg (data: MqttMessage.CommonBoby) {
    console.log(data)
  }

  sendChat () {
    this.client?.sendChatTextMsg(48, '测试聊天')
  }

  render () {
    return (
      <div>
        <input type="button" value="发送" onClick={this.sendChat.bind(this)} />
      </div>
    );
  }
}

export default App;
