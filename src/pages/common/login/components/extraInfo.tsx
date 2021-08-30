import React from 'react';
import { List, InputItem, NavBar, Icon } from 'antd-mobile';

interface ExtraInfoState {
  nickname: string,
  password: string,
  show: boolean
}

class ExtraInfo extends React.Component<{}, ExtraInfoState> {
  constructor(props: {}) {
    super(props)

    this.state = {
      nickname: '',
      password: '',
      show: false
    }

    this.triggerPanel = this.triggerPanel.bind(this)
    this.handleNickname = this.handleNickname.bind(this)
    this.handlePassword = this.handlePassword.bind(this)
  }

  triggerPanel (show?: boolean) {
    this.setState({show: show || !this.state.show})
  }

  handleNickname (val: string) {
    this.setState({
      nickname: val
    })
  }

  handlePassword (val: string) {
    this.setState({
      password: val
    })
  }

  submitExtraInfo () {
    console.log(this.state.password, this.state.nickname)
  }

  render () {
    return (
      <div className="login-step-panel" style={{ display: this.state.show ? '' : 'none' }}>
        <NavBar
          mode="light"
          icon={<Icon type="left" />}
          onLeftClick={() => {this.triggerPanel()}}
        ></NavBar>
        <div className="login-form-area">
          <div className="hd">输入昵称和密码</div>
          <div className="bd">
            <List>
              <InputItem
                placeholder="昵称为6-24位中英文字符"
                maxLength={24}
                onChange={this.handleNickname}
              >
              </InputItem>
              <InputItem
                type="password"
                placeholder="密码为6-20位字母和数字的组合"
                onChange={this.handlePassword}
              ></InputItem>
            </List>
          </div>
        </div>
        <div className="login-btn-layer">
          <button
            className="login-btn"
            disabled={!this.state.nickname || !this.state.password}
            onClick={this.submitExtraInfo}
          >登录</button>
        </div>
        <div className="login-btn-layer">
          <button
            className="login-btn no-bg"
          >跳过</button>
        </div>
      </div>
    )
  }
}

export default ExtraInfo;