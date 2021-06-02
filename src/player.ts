import { EventEmitter } from 'events'
import { Finder } from './finder'
import { Netflix } from './helpers/netflix.helper'
import {
    getDomain,
    isLivestream
} from './utils'

export interface CaptionTrack {
    readonly id: string
    readonly label: string
    readonly active: boolean
}

export interface PlayerState {
    currentTime: number
    duration: number
    playing: boolean
}

export class Player extends EventEmitter implements PlayerState {
    private player: HTMLMediaElement
    private shouldBePlaying: boolean = false
    private finder = new Finder()

    constructor() {
        super()

        this.bindEvents()
    }

    get isLivestream(): boolean {
        return isLivestream()
    }
    
    get currentTime(): number {
        return this.player.currentTime
    }

    set currentTime(val: number) {
        const domain = getDomain()

        if (domain ===  'netflix.com') {
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
                this.bindEvents()

                if (!this.isLivestream) {
                    this.player.pause()
                }
        
                this.currentTime = 0
                this.emit('ready', {
                    volume: this.volume,
                    duration: this.duration,
                    isLivestream: this.isLivestream,
                    captions: this.getCaptions(),
                })

                return player
            })
    }

    public destroy(): void {
        this.finder.destroy()
    }

    private bindEvents() {
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

    public getCaptions(): Array<CaptionTrack> {
        const { player } = this
        const captions = []
    
        for (let i = 0; i < player.textTracks.length; i++) {
            const track = player.textTracks[i]
    
            captions.push({
                id: track.id,
                label: track.label,
                active: track.mode === 'showing',
            })
        }
    
        return captions
    }
}
