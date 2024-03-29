import {
    sleep,
    getHTML,
    isLivestream,
} from './utils'
import taskManager from './managers/task.manager'
import proxyManager from './managers/proxy.manager'

export class Finder {
    private isVideoKnown(video: HTMLVideoElement): boolean {
        const knownClasses = ['jw-video', 'vjs-tech']
    
        for (const className of knownClasses) {
            if (video.classList.contains(className)) {
                return true
            }
        }
    }

    private trapVideoElement(): Promise<HTMLVideoElement> {
        return new Promise((resolve, reject) => {
            const { createElement } = document
    
            document.createElement = (
                tagName: string,
                options?: ElementCreationOptions
            ): HTMLElement => {
                const el = createElement(tagName, options)
                                    
                if (el instanceof HTMLVideoElement) {
                    resolve(el)
                }
    
                return el
            }
        })
    }

    private findVideo(): Promise<HTMLVideoElement> {
        return taskManager.create<HTMLVideoElement>((stop, time) => {
            const videos = document.getElementsByTagName('video')
            let video: HTMLVideoElement

            for (let i = 0; i < videos.length; i++) {
                video = videos[i]

                // todo: not use getHTML
                if (time >= 15000 || getHTML(video) !== '<video></video>') {
                    stop(video)
                    break
                }
            }
        })
    }

    public find(): Promise<HTMLMediaElement> {
        return new Promise(async (resolve, reject) => {            
            let videos = Array.from(document.getElementsByTagName('video'))
            let el
    
            for (let i = 0; i < videos.length; i++) {
                const video = videos[i]
    
                if(!this.isVideoKnown(video)) {
                    el = video
    
                    break
                }
            }
    
            if (!el) {
                videos = videos.filter((video) => {
                    return getHTML(video) !== '<video></video>'
                })
    
                if (videos.length > 0) {
                    el = videos[0]
    
                    if (!isLivestream()) {
                        el.pause()
                    }
                }
                
                if(document.readyState !== 'complete') {
                    return window.addEventListener('load', () =>
                        this.find().then(resolve).catch(reject)
                    )
                }
    
                if (!el) {
                    await sleep(100)
    
                    el = await this.findVideo()
                }
            }
                
            resolve(el)
        })
    }

    public stop(): void {
        taskManager.destroy()
    }

    public destroy(): void {
        this.stop()
        proxyManager.destroy()
    }
}
