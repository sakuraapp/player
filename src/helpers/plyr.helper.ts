export class Plyr {
    static isPlayer(el: HTMLMediaElement): boolean {
        return el.parentElement.classList.contains('plyr__video-wrapper')
    }

    static setup(): void {
        const overlayEl = document.getElementsByClassName('plyr-overlay')[0] as HTMLButtonElement
            
        overlayEl.click()
    }
}