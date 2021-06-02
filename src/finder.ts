import { Netflix } from './helpers/netflix.helper'
import { JWPlayer } from './helpers/jwplayer.helper'
import {
    getDomain,
    sleep,
    getHTML,
    isLivestream,
    onMediaReady,
    findElementByClass
} from './utils'
import taskManager from './utils/taskManager'

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
            let videos = Array.from(document.getElementsByTagName('video'))
            let el
    
            for (let i = 0; i < videos.length; i++) {
                const video = videos[i]
    
                if(!this.isVideoKnown(video)) {
                    el = video
    
                    break
                }
            }
    
            const domain = getDomain()
    
            switch (domain) {
                case 'youtube.com':
                    await sleep(500)
    
                    const theaterMode = document.getElementsByClassName('ytp-size-button')[0] as HTMLButtonElement
    
                    if (theaterMode) {
                        theaterMode.click()
                    }
    
                    const autoplay = document.getElementById('toggle') as HTMLInputElement
    
                    if (autoplay && autoplay.checked) {
                        autoplay.click()
                    }
    
                    const overlay = document.getElementsByClassName('ytp-cued-thumbnail-overlay')[0] as HTMLElement
                    const playBtn = document.getElementsByClassName('ytp-large-play-button')[0] as HTMLButtonElement
    
                    if (playBtn) {
                        if (overlay.style.display !== 'none' && overlay.style.visibility !== 'hidden') {
                            playBtn.click()
                        }
                    }
                    break
                case 'netflix.com':
                    Netflix.init()
                    break
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
            
            if (el.classList.contains('jw-video')) {
                await JWPlayer.init()
            }
    
            if (el.readyState !== 4) {
                await onMediaReady(el)
            }
    
            if (!isLivestream()) {
                el.pause()
            }
            
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

    public destroy(): void {
        taskManager.destroy()
    }
}
