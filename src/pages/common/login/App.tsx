import React from 'react';
import { List, InputItem, Icon } from 'antd-mobile';
import CountryList from './components/countryList';
import VerificationCode from './components/verificationCode';
import ExtraInfo from './components/extraInfo';
import {MqttIMClientContext} from '../../../utils/mqttSDK'

interface AppState {
  loginType: string,
  countryCode: string,
  mobile: string,
  password: string
}

class App extends React.Component<{}, AppState> {
  countryListRef: React.RefObject<CountryList>;
  VerificationCodeRef: React.RefObject<VerificationCode>;
  ExtraInfoRef: React.RefObject<ExtraInfo>;

  static contextType = MqttIMClientContext

  constructor(props: {}) {
    super(props)

    this.state = {
      loginType: 'password',
      countryCode: '+86',
      mobile: '',
      password: ''
    }

    this.countryListRef = React.createRef();
    this.VerificationCodeRef = React.createRef();
    this.ExtraInfoRef = React.createRef();

    this.chooseCountry = this.chooseCountry.bind(this)
    this.handleCountrySelect = this.handleCountrySelect.bind(this)
    this.switchLoginType = this.switchLoginType.bind(this)
    this.handleMobileChange = this.handleMobileChange.bind(this)
    this.handlePassword = this.handlePassword.bind(this)
    this.handleLogin = this.handleLogin.bind(this)
    this.handleSendMsg = this.handleSendMsg.bind(this)
  }

  chooseCountry () {
    this.countryListRef.current && this.countryListRef.current.triggerPanel(true)
  }

  componentDidMount () {
    console.log(this.context)
  }

  handleCountrySelect (code: string) {
    this.setState({
      countryCode: code
    })
  }

  handleMobileChange (value: string) {
    this.setState({
      mobile: value
    })
  }

  handlePassword (value: string) {
    this.setState({
      password: value
    })
  }

  handleLogin () {
    console.log(this.state.mobile, this.state.password)
  }

  handleSendMsg () {
    console.log(this.state.mobile)
    this.VerificationCodeRef.current && this.VerificationCodeRef.current.triggerPanel(true)
  }

  switchLoginType () {
    this.setState({
      loginType: this.state.loginType === 'password' ? 'verificationCode' : 'password'
    })
  }

  render () {
    return (
      <div>
        <div className="login-page">
          <div className="login-form-area">
            <div className="hd">
              欢迎登录G Plus
            </div>
            <div className="bd">
              <List>
                <InputItem
                  type="digit"
                  placeholder="请输入您的手机号码"
                  onChange={this.handleMobileChange}
                >
                  <div className="country-txt" onClick={this.chooseCountry}>
                    <span className="country-code">{this.state.countryCode}</span><Icon type="down" />
                  </div>
                </InputItem>
                {this.state.loginType === 'password' && 
                  <InputItem
                    type="password"
                    placeholder="请输入您的密码"
                    onChange={this.handlePassword}
                  ></InputItem>
                }
              </List>
              {this.state.loginType === 'verificationCode' && <div className="extra-txt">未注册手机验证后即完成注册</div>}
            </div>
            <div className="ft">
              <span onClick={this.switchLoginType}>{this.state.loginType === 'password' ? '短信验证码登录' : '账号密码登录'}</span>
            </div>
          </div>
          <div className="login-btn-layer">
            {this.state.loginType === 'password'
            ? <button
                className="login-btn"
                onClick={this.handleLogin}
                disabled={!this.state.mobile || !this.state.password}
              >登录</button>
            : <button
                className="login-btn"
                onClick={this.handleSendMsg}
                disabled={!this.state.mobile}
              >获取验证码</button>
            }
          </div>
          <div className="login-protocol">
            <i className="agree-btn"></i>
            已阅读并同意 <a href="/">《用户协议》</a><a href="/">《隐私政策》</a>
          </div>
        </div>
        <CountryList countrySelect={this.handleCountrySelect} ref={this.countryListRef} />
        <VerificationCode ref={this.VerificationCodeRef} />
        <ExtraInfo ref={this.ExtraInfoRef} />
      </div>
    );
  }
}

export default App;
