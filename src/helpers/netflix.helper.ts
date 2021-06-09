import { Track, TrackId } from '../player'
import proxyManager from '../managers/proxy.manager'
import { getDomain } from '../utils'

type TrackFormatter = (track: netflix.Track, active: boolean) => Track

// todo: reduce code repetition
// maybe make the proxy manager use classes instead so we have access to all methods

export class Netflix {
    static formatTrack(track: netflix.Track, active: boolean): Track {
        return {
            id: track.trackId,
            label: track.displayName,
            active,
        }
    }

    static isPlayer(): boolean {
        return getDomain() === 'netflix.com'
    }

    static setup() {
        proxyManager.create('netflix.seek', (time: number) => {
            const videoPlayer = netflix.appContext.state.playerApp.getAPI().videoPlayer
            const player = videoPlayer.getVideoPlayerBySessionId(videoPlayer.getAllPlayerSessionIds()[0])
            
            player.seek(time)
        })

        proxyManager.create('netflix.getTextTrack', (formatTrack: TrackFormatter): Track => {
            const videoPlayer = netflix.appContext.state.playerApp.getAPI().videoPlayer
            const player = videoPlayer.getVideoPlayerBySessionId(videoPlayer.getAllPlayerSessionIds()[0])
            const track = player.getTextTrack()

            return formatTrack(track, true)
        })                
        
        proxyManager.create('netflix.getTextTracks', (formatTrack: TrackFormatter): Track[] => {
            const videoPlayer = netflix.appContext.state.playerApp.getAPI().videoPlayer
            const player = videoPlayer.getVideoPlayerBySessionId(videoPlayer.getAllPlayerSessionIds()[0])
                        
            const activeTrack = player.getTextTrack()

            return player
                .getTextTrackList()
                .map((track) => formatTrack(
                    track,
                    track.trackId === activeTrack.trackId
                ))
        })

        proxyManager.create('netflix.setTextTrack', (id: TrackId): void => {
            const videoPlayer = netflix.appContext.state.playerApp.getAPI().videoPlayer
            const player = videoPlayer.getVideoPlayerBySessionId(videoPlayer.getAllPlayerSessionIds()[0])
            const track = player
                .getTextTrackList()
                .find((locTrack) => locTrack.trackId === id)
                        
            return player.setTextTrack(track)
        })

        proxyManager.create('netflix.getAudioTrack', (formatTrack: TrackFormatter): Track => {
            const videoPlayer = netflix.appContext.state.playerApp.getAPI().videoPlayer
            const player = videoPlayer.getVideoPlayerBySessionId(videoPlayer.getAllPlayerSessionIds()[0])
            const track = player.getAudioTrack()

            return formatTrack(track, true)
        })                
        
        proxyManager.create('netflix.getAudioTracks', (formatTrack: TrackFormatter): Track[] => {
            const videoPlayer = netflix.appContext.state.playerApp.getAPI().videoPlayer
            const player = videoPlayer.getVideoPlayerBySessionId(videoPlayer.getAllPlayerSessionIds()[0])
                        
            const activeTrack = player.getAudioTrack()

            return player
                .getAudioTrackList()
                .map((track) => formatTrack(
                    track,
                    track.trackId === activeTrack.trackId
                ))
        })

        proxyManager.create('netflix.setAudioTrack', (id: TrackId): void => {
            const videoPlayer = netflix.appContext.state.playerApp.getAPI().videoPlayer
            const player = videoPlayer.getVideoPlayerBySessionId(videoPlayer.getAllPlayerSessionIds()[0])
            const track = player
                .getAudioTrackList()
                .find((locTrack) => locTrack.trackId === id)

            return player.setAudioTrack(track)
        })
    }

    static seek(time: number): void {
        return proxyManager.callWithoutResult('netflix.seek', time)
    }

    static getTextTrack(): Promise<Track> {
        return proxyManager.call('netflix.getTextTrack', this.formatTrack)
    }

    static getTextTracks(): Promise<Track[]> {
        return proxyManager.call('netflix.getTextTracks', this.formatTrack)
    }

    static setTextTrack(trackId: TrackId): Promise<void> {
        return proxyManager.call('netflix.setTextTrack', trackId)
    }

    static getAudioTrack(): Promise<Track> {
        return proxyManager.call('netflix.getAudioTrack', this.formatTrack)
    }

    static getAudioTracks(): Promise<Track[]> {
        return proxyManager.call('netflix.getAudioTracks', this.formatTrack)
    }

    static setAudioTrack(trackId: TrackId): Promise<void> {
        return proxyManager.call('netflix.setAudioTrack', trackId)
    }
}
