export type TrackId = string | number

export type NetworkState = number
export type ReadyState = number

export type MediaEventName = keyof HTMLMediaElementEventMap

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
    readonly isLivestream: boolean
}

export interface Player extends PlayerState {
    play(): void
    pause(): void
    seek(time: number): void
    getTextTracks(): Promise<Track[]> | Track[]
    getAudioTracks(): Promise<Track[]> | Track[]
    setTextTrack(id: TrackId): Promise<void> | void
    setAudioTrack(id: TrackId): Promise<void> | void
}

export interface Helper extends Player {
    readonly domain?: string
    init?(): Promise<void>
    setup?(el: HTMLMediaElement): Promise<void> | void
    isPlayer(el: HTMLMediaElement): boolean
}
