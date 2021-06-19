import { PlayerState } from '..'
import { EventManager } from '../managers/event.manager'
import { NetworkState, Player, ReadyState, Track, TrackId } from '../types'

export abstract class ProxyPlayer<K extends string> extends EventManager<K> implements Player {
    protected abstract player: Player

    get currentTime(): number {
        return this.player.currentTime
    }

    set currentTime(time: number) {
        this.seek(time)
    }

    get playing(): boolean {
        return this.player.playing
    }

    set playing(val: boolean) {
        this.player.playing = val
    }

    get duration(): number {
        return this.player.duration
    }

    get volume(): number {
        return this.player.volume
    }

    set volume(val: number) {
        this.player.volume = val
    }

    get playbackRate(): number {
        return this.player.playbackRate
    }

    set playbackRate(val: number) {
        this.player.playbackRate = val
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

    get textTracks(): Track[] {
        return this.player.textTracks
    }

    get audioTracks(): Track[] {
        return this.player.audioTracks
    }

    get waiting(): boolean {
        return this.player.waiting
    }

    get networkState(): NetworkState {
        return this.player.networkState
    }

    get readyState(): ReadyState {
        return this.player.readyState
    }

    get isLivestream(): boolean {
        return this.player.isLivestream
    }

    play(): void {
        this.player.play()
    }

    pause(): void {
        this.player.pause()
    }

    seek(time: number): void {
        this.player.currentTime = time
    }

    getTextTracks() {
        return this.player.getTextTracks()
    }

    getAudioTracks() {
        return this.player.getAudioTracks()
    }
    
    setTextTrack(trackId: TrackId) {
        return this.player.setTextTrack(trackId)
    }

    setAudioTrack(trackId: TrackId) {
        return this.player.setAudioTrack(trackId)
    }

    getState(): PlayerState {
        return {
            currentTime: this.currentTime,
            duration: this.duration,
            playing: this.playing,
            volume: this.volume,
            playbackRate: this.playbackRate,
            audioTrack: this.audioTrack,
            textTrack: this.textTrack,
            textTracks: this.textTracks,
            audioTracks: this.audioTracks,
            waiting: this.waiting,
            networkState: this.networkState,
            readyState: this.readyState,
            isLivestream: this.isLivestream,
        }
    }
}