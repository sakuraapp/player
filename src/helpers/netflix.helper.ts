import proxyManager from '../managers/proxy.manager'

export class Netflix {
    static init() {
        proxyManager.create('netflixSeek', (time: number) => {
            const videoPlayer = netflix.appContext.state.playerApp.getAPI().videoPlayer;
            const player = videoPlayer.getVideoPlayerBySessionId(videoPlayer.getAllPlayerSessionIds()[0]);
            
            player.seek(time)
        })
    }

    static seek(time: number): void {
        proxyManager.call('netflixSeek', time)
    }    
}
