import { MediaEventName, Track, TrackId } from '../types'
import { ProxyPlayer } from './proxy.player'

export abstract class BasePlayer extends ProxyPlayer<MediaEventName> {
    protected _waiting = false
    protected _shouldBePlaying: boolean = false
    
    protected _textTracks: Track[]
    protected _audioTracks: Track[]

    get textTracks() {
        return this._textTracks
    }

    get audioTracks() {
        return this._audioTracks
    }

    protected bindPlayerEvents() {
        this.bindEventHandler('play', (e) => {
            this._waiting = false

            if (!this._shouldBePlaying && !this.isLivestream) {
                this.player.pause()
            } else {
                this.dispatchEvent('play', e)
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
            this.dispatchEvent('waiting', e)
        })
    }

    public async setTextTrack(trackId: TrackId): Promise<void> {
        await super.setTextTrack(trackId)

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

    public async setAudioTrack(trackId: TrackId): Promise<void> {
        await super.setAudioTrack(trackId)

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
