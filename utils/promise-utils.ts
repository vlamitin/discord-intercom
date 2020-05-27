/* returns results */
export function processPromises(lazyPromises: Array<() => Promise<any>>, maxCallsPerSec: number): Promise<any[]> {
    return new Promise(async resolve => {
        let results: any[] = []

        function* generateWorkers() {
            let processedCount: number = 0
            while (processedCount < lazyPromises.length) {
                let nextProcessedCount = processedCount + maxCallsPerSec
                yield processChunk(lazyPromises.slice(processedCount, nextProcessedCount))

                processedCount = nextProcessedCount
            }
        }

        for await (let workersChunk of generateWorkers()) {
            const chunkOfCalledPromises: any[] = await workersChunk
            const chunkResults = await Promise.all(chunkOfCalledPromises)

            results = results.concat(chunkResults)
        }

        resolve(results)
    })
}

function processChunk(chunk: Array<() => Promise<any>>): Promise<Array<Promise<any>>> {
    return new Promise(resolve => {
        const result = []
        const timeout: number = 1000 / chunk.length + 1

        let calledPromsCounter = 0
        function recursiveCallPromise(callableProm: () => Promise<any>): void {
            setTimeout(() => {
                if (calledPromsCounter < chunk.length) {
                    result.push(callableProm())
                    calledPromsCounter++
                    recursiveCallPromise(chunk[calledPromsCounter])
                } else {
                    resolve(result)
                }
            }, timeout)
        }

        recursiveCallPromise(chunk[calledPromsCounter])
    })
}
