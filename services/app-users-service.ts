import { AppUser } from './domain/app-user'

export class AppUsersService {
    users: AppUser[] = []

    constructor(users: AppUser[]) {
        this.users = users
    }

    getTokenByCreds = (login: string, password: string): string | void => {
        try {
            const user: AppUser = this.users.find(user => user.login === login && user.password === password)
            if (!user) {
                return null
            }

            return `Basic ${Buffer.from(login + ':' + password).toString('base64')}`
        } catch (e) {
            return null
        }
    }

    getUserByToken = (token: string): AppUser | void => {
        try {
            const [login, password] = Buffer.from(token.split(' ')[1], 'base64')
                .toString()
                .split(':')

            return this.users.find(user => user.login === login && user.password === password)
        } catch (e) {
            return null
        }
    }
}
