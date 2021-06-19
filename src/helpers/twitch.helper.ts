import { findElementByClass } from '../utils'
import { HTML5 } from './html5.helper'

export class Twitch extends HTML5 {
    domain = 'twitch.com'

    setup(): void {
        const btn = findElementByClass('tw-core-button--overlay', (btn: HTMLButtonElement) => {
            return btn.dataset['aTarget'] === 'player-theatre-mode-button'
        })

        if (btn) {
            btn.click()
        }
    }
}
