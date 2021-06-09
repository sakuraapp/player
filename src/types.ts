export type TrackId = string | number

export type NetworkState = number
export type ReadyState = number

export type EventHandlerFn<T extends Event> = (e: T) => void

export interface EventHandler<T extends Event = Event> {
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

export interface Player extends PlayerState {
    play(): void
    pause(): void
    seek(time: number): void
    getTextTracks(): Promise<Track[]> | Track[]
    getAudioTracks(): Promise<Track[]> | Track[]
    isLivestream(): boolean
}

export interface Helper extends Player {
    init?(): Promise<void>
    setup(el: HTMLMediaElement): Promise<void>
    isPlayer(el: HTMLMediaElement): boolean
}

export interface PlayerOptions {}