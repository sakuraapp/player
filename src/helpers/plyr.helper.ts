import { HTML5 } from './html5.helper'

export class Plyr extends HTML5 {
    isPlayer(el: HTMLMediaElement): boolean {
        if (el.parentElement) {
            return el.parentElement.classList.contains('plyr__video-wrapper')
        }
    }

    setup() {
        const overlayEl = document.getElementsByClassName('plyr-overlay')[0] as HTMLButtonElement
            
        overlayEl.click()
    }
}