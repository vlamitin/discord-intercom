const INTERVAL_JOB: string = 'intervalJob'

type Status = 'started' | 'stopped'
export const STARTED: Status = 'started'
export const STOPPED: Status = 'stopped'

export class BaseJob {

    started: boolean = false
    type: string = ''

    constructor(type: string) {
        this.type = type
    }

    protected start(): void {
        this.started = true
        console.debug(new Date().toISOString(), 'info', `Job ${this.type} ${STARTED}`)
    }

    protected stop(): void {
        this.started = false
        console.debug(new Date().toISOString(), 'info', `Job ${this.type} ${STOPPED}`)
    }

    get status(): string {
        return this.started ? STARTED : STOPPED
    }
}

/* fires some cb every intervalInMs ms */
export class IntervalJob extends BaseJob {

    timeOutMs: number

    timeOutId: NodeJS.Timer

    intervalInMs: number = 60 * 1000

    constructor(intervalInMs: number) {
        super(INTERVAL_JOB)
        this.intervalInMs = intervalInMs
    }

    startInterval(cb: () => void): void {
        this.adjustTO()
        this.cbWithInterval(cb)
        super.start()
    }

    stopInterval(): void {
        clearTimeout(this.timeOutId)
        super.stop()
    }

    private cbWithInterval(cb: () => void): void {
        clearTimeout(this.timeOutId)
        this.timeOutId = setTimeout(() => {
            cb()
            this.adjustTO()
            this.cbWithInterval(cb)
        }, this.timeOutMs)
    }

    private adjustTO(): void {
        const now: number = Date.now()
        this.timeOutMs = getNextIntervalFoldMs(this.intervalInMs, now) - now
        console.debug(new Date().toISOString(), 'info', `Job ${this.type}: timeout adjusted to ${this.timeOutMs} ms`)
    }
}

function getNextIntervalFoldMs(interval: number, startDate: number): number {
    let intervalEndZeroCount: number = String(interval)
        .split('')
        .reverse()
        .reduce((prevCount: number, char: string) => {
            if (char === '0') {
                return prevCount + 1
            }
            return prevCount
        }, 0)

    let paddedZeros: string = String.fromCharCode(
        ...Array.from(
            Array(intervalEndZeroCount)
        ).map(() => '0'.charCodeAt(0))
    )

    let stringStart: string = String(startDate)
    let slicedStart: string = stringStart.slice(0, stringStart.length - intervalEndZeroCount)

    let slicedNextTimeMs: string = slicedStart

    do {
        slicedNextTimeMs = String(Number(slicedNextTimeMs) + 1)
    } while (Number(slicedNextTimeMs + paddedZeros) % interval !== 0)

    return Number(slicedNextTimeMs + paddedZeros)
}
