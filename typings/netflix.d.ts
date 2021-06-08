declare namespace netflix {
    export interface Track {
        trackId: string
        displayName: string
    }
    
    export class VideoPlayer {
        getVideoPlayerBySessionId(id: number): VideoPlayer
        getAllPlayerSessionIds(): number[]
        seek(time: number): void
        getAudioTrack(): Track
        getAudioTrackList(): Track[]
        setAudioTrack(track: Track): void
        getTextTrack(): Track
        getTextTrackList(): Track[]
        setTextTrack(track: Track): void
    }
    
    interface API {
        videoPlayer: VideoPlayer
    }
    
    export class PlayerApp {
        getAPI(): API
    }
    
    interface State {
        playerApp: PlayerApp
    }
    
    interface AppContext {
        state: State
    }

    export const appContext: AppContext
}
