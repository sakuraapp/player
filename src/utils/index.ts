export function sleep(ms: number): Promise<void> {
    return new Promise((resolve, reject) => {
        setTimeout(resolve, ms)
    })
}

export function getHTML(el: HTMLElement): string {
    if (!el) {
        return ''
    }

    if (el.outerHTML) {
        return el.outerHTML.trim()
    } else {
        const wrapper = document.createElement('div')
        wrapper.appendChild(el.cloneNode(true))

        return wrapper.innerHTML.trim()
    }
}

let cachedDomain: string

export function getDomain(): string {
    if (cachedDomain) return cachedDomain

    const { hostname } = location
    const parts = hostname.split('.')

    if (parts[0] === 'www') {
        parts.shift()
    }

    return cachedDomain = parts.join('.')
}

export function isLivestream(): boolean {
    const domain = getDomain()

    if (domain.includes('twitch.tv')) {
        return true
    } else if (domain === 'youtube.com') {
        return document.getElementsByClassName('ytp-live').length > 0
    }

    return false
}

export function createInitiator(name: string, fn: unknown): Promise<void> {
    return new Promise((resolve) => {
        const initScript = `() => {
            const init = ${fn}
            const attempt = () => {
                return init(() => {
                    window.postMessage({ action: 'sakura-${name}' }, location.origin)
                })
            }
            
            if (!attempt()) {
                let interval = window.setInterval(() => {
                    if (attempt()) clearInterval(interval)
                }, 35)
            }
        }`

        const script = document.createElement('script')

        script.text = `(${initScript})();`
        script.defer = true

        const onMessage = (event: MessageEvent) => {
            if (event.source != window) return
            if (event.data.action === `sakura-${name}`) {
                window.removeEventListener('message', onMessage)
                resolve()
            }
        }
        
        window.addEventListener('message', onMessage)
        document.body.appendChild(script)
    })
}

export function createProxyFn(name: string, fn: unknown): void {
    name = name.replace("'", "\\'")
    const content = `(() => {
        const fn = ${fn}

        window.addEventListener('message', (e) => {
            if (event.source != window) return
            if (event.data.action === 'sakura-call-proxy') {
                if (event.data.name === '${name}') {
                    fn(...event.data.args)
                }
            }
        })
    })()`

    const script = document.createElement('script')

    script.text = content
    script.defer = true

    document.body.appendChild(script)
}

export function callProxyFn(name: string, ...args: unknown[]): void {
    window.postMessage({
        action: 'sakura-call-proxy',
        name,
        args
    }, location.origin)
}

export function findElementByClass(cls: string, fn: (el: HTMLElement) => boolean) {
    const elements = document.getElementsByClassName(cls)

    for (let i = 0; i < elements.length; i++) {
        const element = elements[i] as HTMLElement

        if (fn(element)) {
            return element
        }
    }

    return null
}

export function onMediaReady(el: HTMLMediaElement): Promise<void> {
    return new Promise((resolve, reject) => {
        const handler = () => {
            el.removeEventListener('canplay', handler)

            resolve()
        }

        el.addEventListener('canplay', handler)
    })
}
