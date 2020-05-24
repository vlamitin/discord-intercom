class LoginModel {
    loginForm = document.querySelector('#login-form')
    loginInput = document.querySelector('#login-input')
    loginErrContent = document.querySelector('#login-err-content')
    passwordInput = document.querySelector('#password-input')
    submitBtn = document.querySelector('#login-submit-btn')

    userInfoBlock = document.querySelector('#user-info')
    userInfoContent = document.querySelector('#user-info-content')
    logoutBtn = document.querySelector('#logout-btn')

    login = ''
    password = ''
    loginErrContentMessage = ''
    token = ''

    userInfoContentString = ''

    onTokenChange = (token) => console.warn('onTokenChange!: ', token)

    constructor(onTokenChange) {
        this.onTokenChange = onTokenChange
        this.loginInput.addEventListener('input', this.handleLoginChange)
        this.passwordInput.addEventListener('input', this.handlePasswordChange)
        this.loginForm.addEventListener('submit', this.handleLogin)
        this.logoutBtn.addEventListener('click', this.handleLogout)
    }

    valid = () => {
        if (!this.login) return false
        if (!this.password) return false
        return true
    }

    setToken = (token) => {
        this.token = token
        this.loginErrContentMessage = ''
        this.setUserContent(`Hello, ${this.login}`)

        this.render()
        this.onTokenChange(token)
    }

    setFormVisible = (visible) => {
        if (visible) {
            this.loginForm.style.display = 'block'
        } else {
            this.loginForm.style.display = 'none'
        }
    }

    setUserInfoBlockVisible = (visible) => {
        if (visible) {
            this.userInfoBlock.style.display = 'block'
        } else {
            this.userInfoBlock.style.display = 'none'
        }
    }

    setUserContent = (contentString) => {
        this.userInfoContentString = contentString
    }

    handleLoginChange = (event) => {
        this.login = event.target.value
        this.loginErrContentMessage = ''
        this.render()
    }

    handlePasswordChange = (event) => {
        this.password = event.target.value
        this.loginErrContentMessage = ''
        this.render()
    }

    handleLogin = (event) => {
        event.preventDefault()

        fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                login: this.login,
                password: this.password
            })
        })
            .then(res => {
                if (res.status === 401) {
                    this.loginErrContentMessage = 'Неверный логин или пароль'
                    this.setLoggedIn(false)
                    throw new Error(`request failed with ${res.status}: ${res.statusText}`)
                }

                if (res.status === 200) {
                    return res.json()
                }

                throw new Error(`request failed with ${res.status}: ${res.statusText}`)
            })
            .then(res => {
                this.setToken(res.token)
            })
            .catch(e => {
                console.warn('err while login', e)
            })
    }

    handleLogout = () => {
        this.setToken('')
    }

    render() {
        this.setFormVisible(!this.token)
        this.setUserInfoBlockVisible(Boolean(this.token))

        if (Boolean(this.token)) {
            this.userInfoContent.innerHTML = this.userInfoContentString
        } else {
            this.loginInput.value = this.login
            this.passwordInput.value = this.password
            this.loginErrContent.innerHTML = this.loginErrContentMessage
            this.submitBtn.disabled = !this.valid()
        }
    }
}

class BroadcastMessageModel {
    broadcastBlock = document.querySelector('#broadcast-block')

    broadcastForm = document.querySelector('#broadcast-form')
    broadcastInput = document.querySelector('#broadcast-input')
    broadcastSubmitBtn = document.querySelector('#broadcast-submit-btn')

    broadcastResultBlock = document.querySelector('#broadcast-result')
    broadcastResultContent = document.querySelector('#broadcast-result-content')
    oneMoreMessageBtn = document.querySelector('#one-more-message-btn')

    token = ''

    message = ''

    broadcastResultContentString = ''

    constructor(token) {
        this.token = token

        this.broadcastInput.addEventListener('input', this.handleMessageChange)
        this.broadcastForm.addEventListener('submit', this.handleSend)
        this.oneMoreMessageBtn.addEventListener('click', this.handleOneMoreMessageClick)
    }

    setToken = token => {
        this.token = token
        this.render()
    }

    valid = () => {
        if (!this.message) return false
        return true
    }

    setBroadcastResultContentString = (contentString) => {
        this.broadcastResultContentString = contentString
    }

    setBroadcastBlockVisible = (visible) => {
        if (visible) {
            this.broadcastBlock.style.display = 'block'
        } else {
            this.broadcastBlock.style.display = 'none'
        }
    }

    setFormVisible = (visible) => {
        if (visible) {
            this.broadcastForm.style.display = 'block'
        } else {
            this.broadcastForm.style.display = 'none'
        }
    }

    setBroadcastResultBlockVisible = (visible) => {
        if (visible) {
            this.broadcastResultBlock.style.display = 'block'
        } else {
            this.broadcastResultBlock.style.display = 'none'
        }
    }

    handleMessageChange = (event) => {
        this.message = event.target.value
        this.render()
    }

    handleSend = (event) => {
        event.preventDefault()

        fetch('/api/discord/messages/broadcast', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': this.token
            },
            body: JSON.stringify({
                message: this.message
            })
        })
            .then(res => {
                return res.json()
            })
            .then(res => {
                this.setBroadcastResultContentString('Сообщение успешно отправлено')
                this.render()
            })
    }

    handleOneMoreMessageClick = (event) => {
        event.preventDefault()

        this.setBroadcastResultContentString('')
        this.render()
    }

    render() {
        if (!this.token) {
            this.setBroadcastBlockVisible(false)
            return
        }

        this.setBroadcastBlockVisible(true)

        this.setFormVisible(!this.broadcastResultContentString)
        this.setBroadcastResultBlockVisible(Boolean(this.broadcastResultContentString))

        if (Boolean(this.broadcastResultContentString)) {
            this.broadcastResultContent.innerHTML = this.broadcastResultContentString
        } else {
            this.broadcastInput.value = this.message
            this.broadcastSubmitBtn.disabled = !this.valid()
        }
    }
}

class CopyUsersModel {
    copyUsersBlock = document.querySelector('#copy-users-block')

    copyUsersBtn = document.querySelector('#copy-users-btn')

    copyUsersResultBlock = document.querySelector('#copy-users-result')
    copyUsersResultContent = document.querySelector('#copy-users-result-content')

    token = ''
    copyResultContentString = ''

    constructor(token) {
        this.token = token
        this.copyUsersBtn.addEventListener('click', this.handleCopyUsers)
    }

    setToken = token => {
        this.token = token
        this.render()
    }

    setCopyResultContentString = (contentString) => {
        this.copyResultContentString = contentString
    }

    setCopyUsersBlockVisible = (visible) => {
        if (visible) {
            this.copyUsersBlock.style.display = 'block'
        } else {
            this.copyUsersBlock.style.display = 'none'
        }
    }

    setBtnVisible = (visible) => {
        if (visible) {
            this.copyUsersBtn.style.display = 'block'
        } else {
            this.copyUsersBtn.style.display = 'none'
        }
    }

    setResultBlockVisible = (visible) => {
        if (visible) {
            this.copyUsersResultBlock.style.display = 'block'
        } else {
            this.copyUsersResultBlock.style.display = 'none'
        }
    }

    handleCopyUsers = (event) => {
        event.preventDefault()

        fetch('/api/integration/copy-discord-users-to-intercom', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': this.token
            },
        })
            .then(res => {
                return res.json()
            })
            .then(res => {
                this.setCopyResultContentString(`
Найдено пользователей Дискорда: ${res.discordUsersCount}
Из них - ботов:                 ${res.discordBotsCount}
Скопировано в Интерком:         ${res.copiedToIntercom}
Уже было в Интерком:            ${res.alreadyExistInIntercom}
                `)
                this.render()
            })
    }

    render() {
        if (!this.token) {
            this.setCopyUsersBlockVisible(false)
            return
        }

        this.setCopyUsersBlockVisible(true)

        this.setBtnVisible(!this.copyResultContentString)
        this.setResultBlockVisible(Boolean(this.copyResultContentString))

        if (Boolean(this.copyResultContentString)) {
            this.copyUsersResultContent.innerHTML = this.copyResultContentString
        }
    }
}

window.onload = function () {
    const broadcastMessageModel = new BroadcastMessageModel(false)
    broadcastMessageModel.render()

    const copyUsersModel = new CopyUsersModel(false)
    copyUsersModel.render()

    function handleTokenChange(token) {
        broadcastMessageModel.setToken(token)
        copyUsersModel.setToken(token)
    }

    const loginModel = new LoginModel(handleTokenChange)
    loginModel.render()
}
