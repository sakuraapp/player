import { EventEmitter } from 'events'
import { Finder } from './finder'
import { HTML5 } from './helpers/html5.helper'
import { JWPlayer } from './helpers/jwplayer.helper'
import { Netflix } from './helpers/netflix.helper'
import { Plyr } from './helpers/plyr.helper'
import { Twitch } from './helpers/twitch.helper'
import { YouTube } from './helpers/youtube.helper'
import {
    isLivestream,
    onMediaReady
} from './utils'

export type TrackId = string | number

export type NetworkState = number
export type ReadyState = number

type EventHandlerFn<T extends Event> = (e: T) => void

interface EventHandler<T extends Event = Event> {
    event: string
    handler: EventHandlerFn<T>
}

export enum PlayerType {
    HTML5,
    JWPlayer,
    Netflix,
}

export interface Track {
    readonly id: TrackId
    readonly label: string
    active: boolean
}

export interface PlayerState {
    currentTime: number
    readonly duration: number
    playing: boolean
    volume: number
    playbackRate: number
    audioTrack?: Track
    textTrack?: Track
    readonly textTracks: Track[]
    readonly audioTracks: Track[]
    readonly waiting: boolean
    readonly networkState: NetworkState
    readonly readyState: ReadyState
}

export interface PlayerOptions {}

export class Player extends EventEmitter implements PlayerState {
    protected player: HTMLMediaElement
    protected type: PlayerType = PlayerType.HTML5
    protected shouldBePlaying: boolean = false
    protected finder = new Finder()

    private _initialized = false
    private _textTracks: Track[] = []
    private _audioTracks: Track[] = []
    private _waiting: boolean = false
    private _eventHandlers: EventHandler[] = []

    get isLivestream(): boolean {
        return isLivestream()
    }
    
    get currentTime(): number {
        return this.player.currentTime
    }

    set currentTime(val: number) {
        this.seek(val)
    }

    get playing(): boolean {
        return !this.player.paused
    }

    set playing(val: boolean) {
        if (val) {
            this.play()
        } else {
            this.pause()
        }
    }

    get volume(): number {
        return this.player.volume
    }

    set volume(val: number) {
        this.player.volume = val
    }

    get duration(): number {
        return this.player.duration
    }

    get playbackRate(): number {
        return this.player.playbackRate
    }

    set playbackRate(val: number) {
        this.player.playbackRate = val
    }

    get textTracks(): Track[] {
        return this._textTracks
    }

    get audioTracks(): Track[] {
        return this._audioTracks
    }

    get textTrack(): Track {
        return this.textTracks.find((track) => track.active)
    }

    set textTrack(track: Track) {
        this.setTextTrack(track.id)
    }

    get audioTrack(): Track {
        return this.audioTracks.find((track) => track.active)
    }

    set audioTrack(track: Track) {
        this.setAudioTrack(track.id)
    }

    get waiting(): boolean {
        return this._waiting
    }

    get networkState(): NetworkState {
        return this.player.networkState
    }

    get readyState(): ReadyState {
        return this.player.readyState
    }

    public async find(): Promise<HTMLMediaElement> {
        const player = await this.finder.find()

        await this.setup(player)

        return player
    }

    // used for the purpose of starting up the player (i.e. clicking play btn)
    public async init(): Promise<void> {
        if (YouTube.isPlayer()) {
            await YouTube.init()
        }

        this._initialized = true
    }

    public async setup(el: HTMLMediaElement): Promise<void> {
        if (!this._initialized) {
            await this.init()
        }

        this.player = el

        if (!isLivestream()) {
            el.pause()
        }

        if (Plyr.isPlayer(el)) {
            Plyr.setup()
        } else if (JWPlayer.isPlayer(el)) {
            await JWPlayer.setup()

            this.type = PlayerType.JWPlayer
        } else if (Netflix.isPlayer()) {
            Netflix.setup()
            
            this.type = PlayerType.Netflix
        } else if (Twitch.isPlayer()) {
            Twitch.setup()
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
        this.emit('ready')
    }

    public stop(): void {
        this.finder.stop()
    }

    public destroy(): void {
        this.finder.destroy()
        this.unbindEventHandlers()
    }

    protected bindEvent(
        evtName: keyof HTMLMediaElementEventMap,
        newName?: string
    ) {
        if (!newName) {
            newName = evtName
        }

        this.bindEventHandler(evtName, (e) => {
            this.emit(newName, e)
        })
    }

    protected bindEventHandler<T extends Event>(
        evtName: keyof HTMLMediaElementEventMap,
        handler: EventHandlerFn<T>
    ): EventHandler<T> {
        const evtHandler = {
            event: evtName,
            handler,
        }

        this._eventHandlers.push(evtHandler)
        this.player.addEventListener(evtName, handler)

        return evtHandler
    }

    protected unbindEventHandler<T extends Event>(evtHandler: EventHandler<T>, remove = true) {
        this.player.removeEventListener(
            evtHandler.event,
            evtHandler.handler
        )

        if (remove) {
            const i = this._eventHandlers.indexOf(evtHandler)

            if (i > -1) {
                this._eventHandlers.splice(i, 1)
            }
        }
    }

    protected unbindEventHandlers() {
        for (const evtHandler of this._eventHandlers) {
            this.unbindEventHandler(evtHandler, false)
        }

        this._eventHandlers = []
    }

    protected bindPlayerEvents() {
        this.bindEventHandler('play', (e) => {
            this._waiting = false

            if (!this.shouldBePlaying && !isLivestream()) {
                this.player.pause()
            } else {
                this.emit('play', e)
            }
        })

        this.bindEvent('pause')
        this.bindEvent('ended', 'end')
        this.bindEvent('seeking')
        this.bindEvent('seeked', 'seek')
        this.bindEvent('ratechange')
        this.bindEvent('volumechange')
        this.bindEvent('canplay')
        this.bindEvent('canplaythrough')
        this.bindEvent('loadeddata')
        this.bindEvent('loadedmetadata')
        this.bindEvent('loadstart')
        this.bindEvent('load')

        // todo: compatibility with older browsers?
        this.bindEventHandler('waiting', (e) => {
            this._waiting = true
            this.emit('waiting', e)
        })
    }

    play(): void {
        this.shouldBePlaying = true
        this.player.play()
    }

    pause(): void {
        if (this.isLivestream) {
            return
        }

        this.shouldBePlaying = false
        this.player.pause()
    }
    
    seek(time: number): void {
        // netflix's player doesn't support setting currentTime
        if (this.type === PlayerType.Netflix) {
            Netflix.seek(time * 1000)
        } else if (!isLivestream()) {
            this.player.currentTime = time
        }
    }

    protected getTrackById(trackId: TrackId, tracks: Track[]): Track {
        return tracks.find((track) => track.id === trackId)
    }

    public getTextTrackById(trackId: TrackId): Track {
        return this.getTrackById(trackId, this.textTracks)
    }

    public getAudioTrackById(trackId: TrackId): Track {
        return this.getTrackById(trackId, this.audioTracks)
    }

    public async getTextTracks(): Promise<Track[]> {
        switch (this.type) {
            case PlayerType.JWPlayer:
                return await JWPlayer.getTextTracks()
                break
            case PlayerType.Netflix:
                return await Netflix.getTextTracks()
                break
            default:
                return HTML5.getTextTracks(this.player)
        }
    }

    public async setTextTrack(trackId: TrackId): Promise<void> {
        switch (this.type) {
            case PlayerType.JWPlayer:
                await JWPlayer.setTextTrack(trackId)
                break
            case PlayerType.Netflix:
                await Netflix.setTextTrack(trackId)
                break
            default:
                HTML5.setTextTrack(trackId, this.player)
        }

        let track: Track

        for (const i in this._textTracks) {
            const locTrack = this._textTracks[i]

            if (locTrack.id === trackId) {
                this._textTracks[i].active = true
                
                track = locTrack
            } else {
                this._textTracks[i].active = false
            }
        }

        this.emit('texttrackchange', track)
    }

    public async getAudioTracks(): Promise<Track[]> {
        switch (this.type) {
            case PlayerType.JWPlayer:
                return await JWPlayer.getAudioTracks()
                break
            case PlayerType.Netflix:
                return await Netflix.getAudioTracks()
                break
            default:
                return []
        }
    }

    public async setAudioTrack(trackId: TrackId): Promise<void> {
        switch (this.type) {
            case PlayerType.JWPlayer:
                await JWPlayer.setAudioTrack(trackId)
                break
            case PlayerType.Netflix:
                await Netflix.setAudioTrack(trackId)
                break
        }

        let track: Track

        for (const i in this._audioTracks) {
            const locTrack = this._audioTracks[i]

            if (locTrack.id === trackId) {
                this._audioTracks[i].active = true
                
                track = locTrack
            } else {
                this._audioTracks[i].active = false
            }
        }

        this.emit('audiotrackchange', track)
    }
}
