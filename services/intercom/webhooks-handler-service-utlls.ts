import * as jsdom from 'jsdom'

export interface ParsedMessage {
    textRows: string[]
    imageUrls: string[]
}

export function parseMessageBody(htmlPart: string): ParsedMessage {
    const result: ParsedMessage = {
        textRows: [],
        imageUrls: []
    }

    /* TODO забенчмаркать. А вдруг это долго? Мб эффективнее создать 1 инстанс jsdom.JSDOM работать внутри него? */
    const dom = new jsdom.JSDOM(`<!DOCTYPE html>${htmlPart}`)

    Array.from(dom.window.document.querySelectorAll('p'))
        .forEach((paragr: HTMLParagraphElement) => result.textRows.push(...paragr.innerHTML.split('<br>')))
    Array.from(dom.window.document.querySelectorAll('img'))
        .forEach((img: HTMLImageElement) => result.imageUrls.push(img.src))

    result.textRows = result.textRows.map(row => row.replace('&nbsp;', ''))

    return result
}

export function extractFileNameFromUrl(url: string): string {
    const parts = url.split('/')
    return parts[parts.length - 1]
}

/* yes, parse html with regex */
function stripHtmlText(htmlString: string): string {
    const TAGS_REGEX: RegExp = /<[^>]+>/g
    return htmlString.replace(TAGS_REGEX, '')
}
