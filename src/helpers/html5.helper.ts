import { getDomain, isLivestream } from '../utils'
import { SakuraPlayer } from '../'
import { Helper, NetworkState, ReadyState, Track, TrackId } from '../types'

export class HTML5 implements Helper {
    private player: SakuraPlayer

    readonly domain: string

    waiting = false

    textTracks: Track[]
    audioTracks: Track[]

    constructor(player: SakuraPlayer) {
        this.player = player
    }

    get el(): HTMLMediaElement {
        return this.player.el
    }

    get currentTime(): number {
        return this.el.currentTime
    }

    set currentTime(time: number) {
        this.seek(time)
    }

    get playing(): boolean {
        return !this.el.paused
    }

    set playing(val: boolean) {
        if (val) {
            this.play()
        } else {
            this.pause()
        }
    }

    get duration(): number {
        return this.el.duration
    }

    get volume(): number {
        return this.el.volume
    }

    set volume(val: number) {
        this.el.volume = val
    }

    get playbackRate(): number {
        return this.el.playbackRate
    }

    set playbackRate(val: number) {
        this.el.playbackRate = val
    }

    get textTrack() {
        return this.textTracks.find((track) => track.active)
    }

    set textTrack(track: Track) {
        this.setTextTrack(track.id)
    }

    get audioTrack() {
        return this.audioTracks.find((track) => track.active)
    }

    set audioTrack(track: Track) {
        this.setAudioTrack(track.id)
    }

    get networkState(): NetworkState {
        return this.el.networkState
    }

    get readyState(): ReadyState {
        return this.el.readyState
    }

    get isLivestream(): boolean {
        return isLivestream()
    }

    isPlayer(el: HTMLMediaElement): boolean {
        if (this.domain) {
            return getDomain() === this.domain
        }

        return Boolean(el)
    }

    play(): void {
        this.el.play()
    }

    pause(): void {
        this.el.pause()
    }

    seek(time: number): void {
        this.el.currentTime = time
    }

    async getTextTracks(): Promise<Track[]> {
        const tracks = []

        for (let i = 0; i < this.el.textTracks.length; i++) {
            const track = this.el.textTracks[i]
    
            tracks.push({
                id: track.id || i, // fixme: is it a good idea to fallback to i here?
                label: track.label,
                active: track.mode === 'showing',
            })
        }

        return tracks
    }

    async getAudioTracks(): Promise<Track[]> {
        return []
    }
    
    async setTextTrack(trackId: TrackId): Promise<void> {
        for (let i = 0; i < this.el.textTracks.length; i++) {
            const track = this.el.textTracks[i]

            if (track.id === trackId || i === trackId) {
                track.mode = 'showing'
            } else {
                track.mode = 'disabled'
            }
        }
    }

    async setAudioTrack(trackId: TrackId): Promise<void> {
        throw new Error('Audio tracks are unsupported on the default HTML5 player')
    }
}
