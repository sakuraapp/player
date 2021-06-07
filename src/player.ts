import { EventEmitter } from 'events'
import { Finder } from './finder'
import { JWPlayer } from './helpers/jwplayer.helper'
import { Netflix } from './helpers/netflix.helper'
import {
    getDomain,
    isLivestream
} from './utils'

export type CaptionTrackId = string | number

export enum PlayerType {
    Default,
    JWPlayer,
    Netflix,
}

export interface CaptionTrack {
    readonly id: CaptionTrackId
    readonly label: string
    readonly active: boolean
}

export interface PlayerState {
    currentTime: number
    duration: number
    playing: boolean
    volume: number
}

export class Player extends EventEmitter implements PlayerState {
    protected player: HTMLMediaElement
    protected type: PlayerType = PlayerType.Default
    protected shouldBePlaying: boolean = false
    protected finder = new Finder()

    get isLivestream(): boolean {
        return isLivestream()
    }
    
    get currentTime(): number {
        return this.player.currentTime
    }

    set currentTime(val: number) {
        const domain = getDomain()

        // netflix's player doesn't support setting currentTime
        if (this.type === PlayerType.Netflix) {
            Netflix.seek(val * 1000)
        } else if (!isLivestream()) {
            this.player.currentTime = val
        }
    }

    get playing(): boolean {
        return !this.player.paused
    }

    set playing(val: boolean) {
        if (this.isLivestream) {
            return
        }

        this.shouldBePlaying = val

        if (val) {
            this.player.play()
        } else {
            this.player.pause()
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

    public find(): Promise<HTMLMediaElement> {
        return this.finder.find()
            .then((player) => {
                this.player = player
                this.bindPlayerEvents()

                if (!this.isLivestream) {
                    this.player.pause()
                }

                if (getDomain() === 'netflix.com') {
                    this.type = PlayerType.Netflix
                } else if (JWPlayer.isPlayer(player)) {
                    this.type = PlayerType.JWPlayer
                }
        
                this.currentTime = 0
                this.emit('ready', {
                    volume: this.volume,
                    duration: this.duration,
                    isLivestream: this.isLivestream,
                })

                return player
            })
    }

    public destroy(): void {
        this.finder.destroy()
    }

    protected bindPlayerEvents() {
        this.player.addEventListener('play', () => {
            if (!this.shouldBePlaying && !isLivestream()) {
                this.player.pause()
            } else {
                this.emit('play')
            }
        })

        this.player.addEventListener('pause', () => {
            this.emit('pause')
        })

        this.player.addEventListener('ended', () => {
            this.emit('end')
        })
    }

    play(): void {
        this.playing = true
    }

    pause(): void {
        this.playing = false
    }
    
    seek(time: number): void {
        this.currentTime = time
    }

    public async getCaptions(): Promise<CaptionTrack[]> {
        const { player } = this
        
        let captions: CaptionTrack[]
    
        if (this.type === PlayerType.JWPlayer) {
            captions = await JWPlayer.getCaptions()
        } else {
            captions = []

            for (let i = 0; i < player.textTracks.length; i++) {
                const track = player.textTracks[i]
        
                captions.push({
                    id: track.id,
                    label: track.label,
                    active: track.mode === 'showing',
                })
            }
        }
    
        return captions
    }
}
