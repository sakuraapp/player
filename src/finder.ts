import { Netflix } from './helpers/netflix.helper'
import { JWPlayer } from './helpers/jwplayer.helper'
import { YouTube } from './helpers/youtube.helper'
import {
    getDomain,
    sleep,
    getHTML,
    isLivestream,
    onMediaReady,
    findElementByClass
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
            const video = document.getElementsByTagName('video')[0]
    
            if (video) {
                if (time >= 15000 || getHTML(video) !== '<video></video>') {
                    stop(video)
                }
            }
        })
    }

    public find(): Promise<HTMLMediaElement> {
        return new Promise(async (resolve, reject) => {
            const domain = getDomain()

            switch (domain) {
                case 'youtube.com':
                    await YouTube.init()
                    break
                case 'netflix.com':
                    Netflix.init()
                    break
            }
            
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
    
            if (!isLivestream()) {
                el.pause()
            }
    
            if (el.parentElement.classList.contains('plyr__video-wrapper')) {
                const overlayEl = document.getElementsByClassName('plyr-overlay')[0] as HTMLButtonElement
                
                overlayEl.click()
            }
            
            if (JWPlayer.isPlayer(el)) {
                await JWPlayer.init()
            }
    
            if (el.readyState !== 4) {
                await onMediaReady(el)
            }
    
            if (!isLivestream()) {
                el.pause()
            }
            
            // not in the switch above because the video player doesn't appear right away, so we just wait until the video is found anyway
            if (domain === 'twitch.tv') {
                const btn = findElementByClass('tw-core-button--overlay', (btn: HTMLButtonElement) => {
                    return btn.dataset['aTarget'] === 'player-theatre-mode-button'
                })
    
                if (btn) {
                    btn.click()
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
