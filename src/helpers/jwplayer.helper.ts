import { CaptionTrack } from '../player'
import proxyManager from '../managers/proxy.manager'

export class JWPlayer {
    static init() {
        proxyManager.createInitiator('jwplayer', () => {
            if (typeof jwplayer === 'function') {
                jwplayer().play()
                
                return true
            }
        })

        proxyManager.create('jwplayer.getCaptions', () => {
            const player = jwplayer()
            const active = player.getCurrentCaptions()

            return player
                .getCaptionsList()
                .map((caption, i) => {
                    caption.active = i === active
                })
        })
    }

    static isPlayer(el: HTMLElement): boolean {
        return el.classList.contains('jw-video')
    }

    static getCaptions(): Promise<CaptionTrack[]> {
        return proxyManager.call<CaptionTrack[]>('jwplayer.getCaptions')
    }
}
