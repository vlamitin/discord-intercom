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

    onUserChange = (login, token) => console.warn('onTokenChange!: ', login, token)

    constructor(onUserChange) {
        this.onUserChange = onUserChange
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
        this.onUserChange(this.login, token)
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

    render = () => {
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
    broadcastAttachmentsContent = document.querySelector('#broadcast-attachments-content')
    broadcastSegmentsContent = document.querySelector('.broadcast-segments')
    addAttachmentBtn = document.querySelector('#add-attachment-btn')
    removeAttachmentsBtn = document.querySelector('#remove-attachments-btn')
    broadcastSubmitBtn = document.querySelector('#broadcast-submit-btn')

    broadcastResultBlock = document.querySelector('#broadcast-result')
    broadcastResultContent = document.querySelector('#broadcast-result-content')
    oneMoreMessageBtn = document.querySelector('#one-more-message-btn')

    token = ''
    segments = []

    message = ''

    broadcastResultContentString = ''

    constructor(token, segments) {
        this.token = token
        this.segments = segments

        this.broadcastInput.addEventListener('input', this.handleMessageChange)
        this.broadcastAttachmentsContent.addEventListener('input', this.render)
        this.addAttachmentBtn.addEventListener('click', this.handleAddAttachment)
        this.removeAttachmentsBtn.addEventListener('click', this.handleRemoveAttachments)
        this.broadcastForm.addEventListener('submit', this.handleSend)
        this.oneMoreMessageBtn.addEventListener('click', this.handleOneMoreMessageClick)
    }

    setSegments = segments => {
        this.segments = segments
        this.render()
    }

    setToken = token => {
        this.token = token
        this.updateSegmentsList();
        this.render()
    }

    updateSegmentsList = () => {
        fetch('/api/discord/roles', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': this.token
            }
        })
            .then(res => {
                return res.json()
            })
            .then(res => {
                this.setSegments(res.map(role => {
                    return {name: role.name, id: role.id};
                }))
            })
    }

    valid = () => {
        if (!this.message) return false
        if (this.getAttachmentData().some(attachment => !attachment.url || !attachment.name)) return false
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

    handleAddAttachment = () => {
        this.broadcastAttachmentsContent.innerHTML += `
            <div class="attachment" data-type="attachment-block">
                <label>
                    Имя файла
                    <input data-type="attachment-name" />
                </label>
                <label>
                    URL
                    <input data-type="attachment-url"/>
                </label>
            </div>
        `
        this.render()
    }

    handleRemoveAttachments = () => {
        this.broadcastAttachmentsContent.innerHTML = ''
        this.render()
    }

    getAttachmentData = () => {
        const result = []
        Array.from(document.querySelector('#broadcast-attachments-content')
            .querySelectorAll('*[data-type="attachment-block"]'))
            .forEach(block => {
                result.push({
                    name: block.querySelector('*[data-type="attachment-name"]').value,
                    url: block.querySelector('*[data-type="attachment-url"]').value,
                })
            })

        return result
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
                message: this.message,
                segments: Array.prototype.map.call(
                    document.querySelectorAll('.broadcast-segment-item:checked'), item => item.value),
                attachments: this.getAttachmentData()
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

    render = () => {
        if (!this.token) {
            this.setBroadcastBlockVisible(false)
            return
        }

        this.setBroadcastBlockVisible(true)

        this.broadcastSegmentsContent.innerHTML = (this.segments || []).map(segment => `
            <label for="seg-${segment.id}">${segment.name}</label>
            <input id="seg-${segment.id}" class="broadcast-segment-item" type="checkbox" name="segments" value="discord-role-${segment.id}"/>   
        `).join("\n");

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

    render = () => {
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

    function handleUserChange(login, token) {
        broadcastMessageModel.setToken(token)
        copyUsersModel.setToken(token)
        localStorage.setItem('userInfo', JSON.stringify({
            login,
            token
        }))
    }

    const loginModel = new LoginModel(handleUserChange)
    loginModel.render()

    const userInfo = localStorage.getItem('userInfo')
    if (userInfo) {
        const {login, token} = JSON.parse(userInfo)
        loginModel.login = login
        loginModel.setToken(token)
    }
}
