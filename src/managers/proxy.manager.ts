import { rand, runScript } from '../utils'

const INITIATOR_TICKRATE = 35

export type CallbackFn = Function

export interface Callback {
    resolve: CallbackFn
    reject: CallbackFn
}

// since extensions are sandboxed by default, we inject a "proxy function" into the page to escape the sandbox and use the window.postMessage API to call it
export class ProxyManager {
    private calls = 0
    private callbacks: Map<number, Callback>

    private initiated = false
    private containerKey: string

    constructor() {
        this.onMessage = this.onMessage.bind(this)
    }

    private init() {
        this.containerKey = `sakura_${rand(1, 1000)}`

        runScript(`(key) => {
            window[key] = {
                functions: new Map(),
                respond: (data, status, callId) => {
                    if (callId) {
                        window.postMessage({
                            action: 'sakura-proxy-result',
                            data,
                            status.
                            callId,
                        })
                    }
                },
                onMessage: async (e) => {
                    if (event.source != window) return
                    if (event.data.action === 'sakura-call-proxy') {
                        const { name, callId, args } = event.data
                        const fn = window[key].functions.get(name)

                        if (fn) {
                            try {
                                const res = await fn(...args)
    
                                respond(res, true, callId)
                            } catch (err) {
                                respond(err, false, callId)
                            }
                        }
                    }
                },
                bind: () => window.addEventListener('message', window[key].onMessage),
                unbind: () => window.removeEventListener('message', window[key].onMessage)
            }

            window[key].bind()
        }`, this.containerKey)

        this.bind()
    }

    private addCallback(callback: Callback): number {
        const id = this.calls++

        this.callbacks.set(id, callback)

        return id
    }

    private removeCallback(id: number): void {
        this.callbacks.delete(id)
    }

    private onMessage(event: MessageEvent): void {
        if (event.source != window) return
        if (event.data.action === `sakura-proxy-result`) {
            const { callId } = event.data
            const callback = this.callbacks.get(callId)
            const res = event.data.data

            if (event.data.status) {
                callback.resolve(res)
            } else {
                callback.reject(res)
            }

            this.removeCallback(callId)
        }
    }

    private bind() {        
        window.addEventListener('message', this.onMessage)
    }

    private unbind() {
        window.removeEventListener('message', this.onMessage)
    }

    create(name: string, fn: Function | string): void {
        if (!this.initiated) {
            this.init()
        }

        name = name.replace("'", "\\'")
        
        runScript(`(name, key) => {
            window[key].functions.set(name, ${fn})
        }`, name, this.containerKey)
    }

    createInitiator(
        name: string,
        fn: () => boolean | Promise<boolean>,
        tickRate = INITIATOR_TICKRATE
    ): Promise<void> {
        const fnName = `init-${name}`
        
        this.create(fnName, `() => {
            return new Promise(async (resolve) => {
                const init = ${fn}
                const attempt = async () => {
                        let res

                        try {
                            res = await init()
                        } catch (err) {
                            res = false
                        }

                        return res
                    })
                }

                const sleep = (ms) => {
                    return new Promise((resolve) => {
                        setTimeout(resolve, ms)
                    })
                }

                let active = true

                while (active) {
                    if (await attempt()) {
                        active = false
                        resolve()
                    }

                    await sleep(${tickRate})
                }
            })
        }`)

        return this.call(fnName)
    }

    call<T = unknown>(name: string, ...args: unknown[]): Promise<T> {
        return new Promise((resolve, reject) => {
            const callId = this.addCallback({ resolve, reject })

            window.postMessage({
                action: 'sakura-call-proxy',
                name,
                args,
                callId,
            }, location.origin)
        })
    }

    callWithoutResult(name: string, ...args: unknown[]): void {
        window.postMessage({
            action: 'sakura-call-proxy',
            name,
            args,
        }, location.origin)
    }

    public destroy() {
        this.unbind()

        if (this.initiated) {
            runScript(`(key) => {
                window[key].unbind()
            }`, this.containerKey)
        }
    }
}

export default new ProxyManager()
