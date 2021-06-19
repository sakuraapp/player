export function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => {
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
        return !location.pathname.startsWith('/videos')
    } else if (domain === 'youtube.com') {
        return document.getElementsByClassName('ytp-live').length > 0
    }

    return false
}

export function runScript(fn: unknown, ...args: unknown[]): void {
    const script = document.createElement('script')
    const argList = args.map((arg) => {
        if (typeof arg === 'string') {
            return `'${arg.replace("'", "\\'")}'`
        } else {
            return `${arg}`
        }
    })

    script.text = `(${fn})(${argList.join(', ')});`
    script.defer = true

    document.body.appendChild(script)
}

export function rand(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1) + min)
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
