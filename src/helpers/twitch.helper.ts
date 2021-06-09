import { findElementByClass, getDomain } from '../utils'

export class Twitch {
    static setup(): void {
        const btn = findElementByClass('tw-core-button--overlay', (btn: HTMLButtonElement) => {
            return btn.dataset['aTarget'] === 'player-theatre-mode-button'
        })

        if (btn) {
            btn.click()
        }
    }

    static isPlayer(): boolean {
        return getDomain() === 'twitch.com'
    }
}
