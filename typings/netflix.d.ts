export class VideoPlayer {
    getVideoPlayerBySessionId(id: number): VideoPlayer
    getAllPlayerSessionIds(): number[]
    seek(time: number): void
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

export class Netflix {
    appContext: AppContext
}

declare global {
    var netflix: Netflix

    interface Window {
        netflix: Netflix
    }
}