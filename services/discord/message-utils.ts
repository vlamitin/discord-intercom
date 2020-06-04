import { User } from "discord.js"

export function fillMessageWithUserProps(messageContent: string, user: User): string {
    let result = messageContent
    const matched = Array.from(messageContent.matchAll(/{{(\w+)}}/g)) || []
    matched.forEach(matchedTuple => {
        if (matchedTuple[1] in user) {
            result = result.replace(matchedTuple[0], user[matchedTuple[1]])
        }
    })

    return result
}
