import { createInitiator } from '../utils'

export class JWPlayer {
    static init() {
        return createInitiator('jwplayer', (resolve: Function) => {
            if (typeof jwplayer === 'function') {
                jwplayer().play()
                resolve()
                
                return true
            }
        })
    }
}
