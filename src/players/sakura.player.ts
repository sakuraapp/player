import { Finder } from '../finder'
import { HelperManager } from '../managers/helper.manager'
import { Helper } from '../types'
import { getDomain, isLivestream, onMediaReady } from '../utils'
import { BasePlayer } from './base.player'

export class SakuraPlayer extends BasePlayer {
    el: HTMLMediaElement

    protected finder = new Finder()

    protected helper: Helper
    protected helperManager = new HelperManager(this)

    private _initialized = false
    private _ready = false

    get player() {
        return this.helper
    }

    get eventSource() {
        return this.el
    }

    get ready() {
        return this._ready
    }

    public async find(): Promise<HTMLMediaElement> {
        const player = await this.finder.find()

        await this.setup(player)

        return player
    }

    // used for the purpose of starting up the player (i.e. clicking play btn)
    public async init(): Promise<void> {
        const domain = getDomain()
        const helper = this.helperManager.getByDomain(domain) // initiatable helpers need to be defined by the site domain

        if (helper && helper.init) {
            await helper.init()
        }

        this._initialized = true
    }

    public async setup(el: HTMLMediaElement): Promise<void> {
        if (!this._initialized) {
            await this.init()
        }

        this.helper = this.helperManager.get(el)
        this.el = el

        if (!isLivestream()) {
            el.pause()
        }

        if (this.helper.setup) {
            await this.helper.setup(el)
        }

        if (el.readyState !== 4) {
            await onMediaReady(el)
        }

        if (!isLivestream()) {
            el.pause()
        }

        this.bindPlayerEvents()

        this._textTracks = await this.getTextTracks()
        this._audioTracks = await this.getAudioTracks()

        this.currentTime = 0
        this._ready = true

        this.emit('ready')
    }

    public stop(): void {
        this.finder.stop()
    }

    public destroy(): void {
        this.finder.destroy()
        this.unbindEventHandlers()
    }
}
