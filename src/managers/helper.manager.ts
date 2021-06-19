import { SakuraPlayer } from '../players/sakura.player'
import { JWPlayer } from '../helpers/jwplayer.helper'
import { Plyr } from '../helpers/plyr.helper'
import { Helper } from '../types'
import { Netflix } from '../helpers/netflix.helper'
import { Twitch } from '../helpers/twitch.helper'
import { YouTube } from '../helpers/youtube.helper'
import { HTML5 } from '../helpers/html5.helper'

export class HelperManager {
    helpers: Helper[]

    constructor(player: SakuraPlayer) {
        this.helpers = [
            new JWPlayer(player),
            new Plyr(player),
            new Netflix(player),
            new Twitch(player),
            new YouTube(player),
            new HTML5(player), // this MUST always be last
        ]
    }

    get(el: HTMLMediaElement) {
        for (const helper of this.helpers) {
            if (helper.isPlayer(el)) {
                return helper
            }
        }
    }

    getByDomain(domain: string) {
        for (const helper of this.helpers) {
            if (helper.domain === domain) {
                return helper
            }
        }
    }
}
