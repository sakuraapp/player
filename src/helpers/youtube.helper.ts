import { sleep } from '../utils'

interface YouTubeElement extends Element {
    theater?: boolean
}

export class YouTube {
    static async init(): Promise<void> {
        await sleep(500)
    
        const ytdWatch: YouTubeElement = document.getElementsByTagName('ytd-watch-flexy')[0]

        if (ytdWatch && !ytdWatch.theater) {
            const theaterMode = document.getElementsByClassName('ytp-size-button')[0] as HTMLButtonElement

            if (theaterMode) {
                theaterMode.click()
            }
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
    }
}