import React from 'react'
import copy from 'copy-to-clipboard'
import pbkdf2 from 'pbkdf2-sha256'

const bookmarklet = `javascript:window.open('https://password2-pb.now.sh/#' + new URL(document.location).host, '_blank');`
const alphabetRFC1924 = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', '!', '#', '$', '%', '&', '(', ')', '*', '+', '-', ';', '<', '=', '>', '?', '@', '^', '_', '`', '{', '|', '}', '~']

export default class extends React.Component {
  constructor (props) {
    super(props)
    this.generate = this.generate.bind(this)
    this.copy = this.copy.bind(this)
    this.keydown = this.keydown.bind(this)
    this.state = { password: '' }
  }

  componentDidMount () {
    if (document.referrer) {
      this.tldInput.value = new URL(document.referrer).host.replace(/^www./, '')
    }
    if (document.location.hash) {
      this.tldInput.value = document.location.hash.slice(1).replace(/^www./, '')
    }
    this.generate()
  }

  generate () {
    let masterPassword = this.masterPasswordInput.value
    if ((masterPassword || masterPassword.length < 1) && ('localStorage' in window) && !this.setInitialPassword) {
      this.setInitialPassword = true
      masterPassword = localStorage.getItem('master') || ''
      this.masterPasswordInput.value = masterPassword
    }

    const salt = `${this.tldInput.value}${this.usernameInput.value}`
    const password = Array.from(pbkdf2(masterPassword, salt, 1000, 16)).map((byte) => alphabetRFC1924[byte % alphabetRFC1924.length]).join('')
    this.setState({ password })
  }

  copy () {
    copy(this.state.password)
    this.passwordEl.style.animationName = 'flash'
    setTimeout(() => {
      if (this.passwordEl) {
        this.passwordEl.style.animationName = ''
      }
    }, 1000)
  }

  keydown (ev) {
    if (ev.keyCode === 13) {
      this.copy()
      if (ev.metaKey) {
        window.close()
      }
    }
  }

  render () {
    const { password } = this.state
    return (
      <div>
        <div className='app'>
          <a className='bookmarklet' href={bookmarklet} onClick={(e) => e.preventDefault()}>~ psswrd</a>
          <div>
            <input id='tld' type='text' placeholder='tld' autoCapitalize='none' onKeyDown={this.keydown} onChange={this.generate} ref={(input) => { this.tldInput = input }} />
            <input id='username' type='text' placeholder='username' autoCapitalize='none' autoFocus onKeyDown={this.keydown} onChange={this.generate} ref={(input) => { this.usernameInput = input }} />
            <input type='password' placeholder='master password' onKeyDown={this.keydown} onChange={this.generate} ref={(input) => { this.masterPasswordInput = input }} />
            <div className='password' ref={(el) => { this.passwordEl = el }}>
              {this.masterPasswordInput && this.masterPasswordInput.value.length > 0 ? password : 'master password required'}
              <button onClick={this.copy}>copy</button>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

