import { createProxyFn, callProxyFn } from '../utils'

export class Netflix {
    static init() {
        createProxyFn('netflixSeek', (time: number) => {
            const videoPlayer = netflix.appContext.state.playerApp.getAPI().videoPlayer;
            const player = videoPlayer.getVideoPlayerBySessionId(videoPlayer.getAllPlayerSessionIds()[0]);
            
            player.seek(time)
        })
    }

    static seek(time: number): void {
        callProxyFn('netflixSeek', time)
    }    
}
