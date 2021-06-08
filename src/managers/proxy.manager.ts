import { EventEmitter } from 'events'
import { rand, runScript } from '../utils'

const INITIATOR_TICKRATE = 35

export type CallbackFn = Function

export interface Callback {
    temporary: boolean
    resolve: CallbackFn
    reject: CallbackFn
}

export interface IEmitter {
    addEventListener(evt: string, handler: Function): void
    removeEventListener(evt: string, handler: Function): void
}

// since extensions are sandboxed by default, we inject a "proxy function" into the page to escape the sandbox and use the window.postMessage API to call it
export class ProxyManager {
    private calls = 0
    private callbacks: Map<number, Callback> = new Map()
    private emitter = new EventEmitter()

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
                events: [],
                respond: (data, status, callId) => {
                    if (callId !== null && callId !== undefined) {
                        window.postMessage({
                            action: 'sakura-proxy-result',
                            data,
                            status,
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
    
                                window[key].respond(res, true, callId)
                            } catch (err) {
                                window[key].respond(err, false, callId)
                            }
                        }
                    }
                },
                bind: () => window.addEventListener('message', window[key].onMessage),
                unbind: () => {
                    window.removeEventListener('message', window[key].onMessage)

                    for (const event of window[key].events) {
                        event.emitter.removeEventListener(event.event, event.handler)
                    }
                },
                dispatch: (emitterName, eventName, data) => {
                    window.postMessage({
                        action: 'sakura-proxy-event',
                        emitter: emitterName,
                        event: eventName,
                        data,
                    })
                },
                addEmitter: (name, emitter, events) => {
                    for (let event of events) {
                        let handler = (data) => {
                            window[key].dispatch(name, event, data)
                        }

                        window[key].events.push({
                            emitter,
                            event,
                            handler,
                        })

                        emitter.addEventListener(event, handler)
                    }
                },
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

            if (callback.temporary) {
                this.removeCallback(callId)
            }
        } else if (event.data.action === 'sakura-proxy-event') {
            const { emitter, event: name, data } = event.data

            this.emitter.emit(`${emitter}/${name}`, data)
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
        tickRate = INITIATOR_TICKRATE,
        ...args: unknown[]
    ): Promise<void> {
        const fnName = `init-${name}`
        
        this.create(fnName, `(...args) => {
            return new Promise(async (resolve) => {
                const init = ${fn}
                const attempt = async () => {
                    let res

                    try {
                        res = await init(...args)
                    } catch (err) {
                        res = false
                    }

                    return res
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

        return this.call(fnName, ...args)
    }

    createEmitter(name: string, fn: () => IEmitter, events: string[]): Promise<void> {
        const fnName = `emitter-${name}`

        this.create(fnName, `(name, events) => {
            const getEmitter = ${fn}
            const emitter = getEmitter()

            window[key].addEmitter(name, emitter, events)
        }`)

        return this.call(fnName, name, events)
    }

    private dispatchCall<T>({
        name,
        args,
        temporary
    }: {
        name: string
        args: unknown[]
        temporary: boolean
    }): Promise<T> {
        return new Promise((resolve, reject) => {
            const callId = this.addCallback({
                temporary,
                resolve,
                reject,
            })

            window.postMessage({
                action: 'sakura-call-proxy',
                name,
                args,
                callId,
            }, location.origin)
        })
    }

    call<T = unknown>(name: string, ...args: unknown[]): Promise<T> {
        return this.dispatchCall<T>({
            name,
            args,
            temporary: true,
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
                window[key] = null
            }`, this.containerKey)
        }
    }
}

export default new ProxyManager()
