import { Track, TrackId } from '../types'
import proxyManager from '../managers/proxy.manager'
import { HTML5 } from './html5.helper'

type TrackFormatter = (track: netflix.Track, active: boolean) => Track

// todo: reduce code repetition
// maybe make the proxy manager use classes instead so we have access to all methods

export class Netflix extends HTML5 {
    domain = 'netflix.com'

    formatTrack(track: netflix.Track, active: boolean): Track {
        return {
            id: track.trackId,
            label: track.displayName,
            active,
        }
    }

    setup() {
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

    seek(time: number): void {
        return proxyManager.callWithoutResult('netflix.seek', time)
    }

    getTextTrack(): Promise<Track> {
        return proxyManager.call('netflix.getTextTrack', this.formatTrack)
    }

    getTextTracks(): Promise<Track[]> {
        return proxyManager.call('netflix.getTextTracks', this.formatTrack)
    }

    setTextTrack(trackId: TrackId): Promise<void> {
        return proxyManager.call('netflix.setTextTrack', trackId)
    }

    getAudioTrack(): Promise<Track> {
        return proxyManager.call('netflix.getAudioTrack', this.formatTrack)
    }

    getAudioTracks(): Promise<Track[]> {
        return proxyManager.call('netflix.getAudioTracks', this.formatTrack)
    }

    setAudioTrack(trackId: TrackId): Promise<void> {
        return proxyManager.call('netflix.setAudioTrack', trackId)
    }
}
