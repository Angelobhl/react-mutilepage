import React from 'react';
import { List, InputItem, NavBar, Icon } from 'antd-mobile';

interface VerificationCodeState {
  code: string,
  show: boolean
}

class VerificationCode extends React.Component<{}, VerificationCodeState> {
  constructor(props: {}) {
    super(props)

    this.state = {
      code: '',
      show: false
    }

    this.handleCode = this.handleCode.bind(this)
    this.triggerPanel = this.triggerPanel.bind(this)
    this.submitLogin = this.submitLogin.bind(this)
  }

  handleCode (val: string) {
    this.setState({
      code: val
    })
  }

  triggerPanel (show?: boolean) {
    this.setState({show: show || !this.state.show})
  }

  submitLogin () {
    console.log(this.state.code)
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
          <div className="hd">输入验证码</div>
          <div className="sub-hd">验证码已发送至 +86 15558075287</div>
          <div className="bd">
            <List>
              <InputItem
                type="digit"
                placeholder="请输入验证码"
                maxLength={4}
                onChange={this.handleCode}
              >
              </InputItem>
            </List>
            <div className="extra-txt align-right">60s后重新发送</div>
          </div>
        </div>
        <div className="login-btn-layer">
          <button
            className="login-btn"
            disabled={!this.state.code}
            onClick={this.submitLogin}
          >登录</button>
        </div>
      </div>
    )
  }
}

export default VerificationCode;