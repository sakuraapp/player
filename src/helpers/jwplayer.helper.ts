import { Track, TrackId } from '../types'
import proxyManager from '../managers/proxy.manager'
import { HTML5 } from './html5.helper'

export class JWPlayer extends HTML5 {
    async setup(): Promise<void> {
        await proxyManager.createInitiator('jwplayer', () => {
            if (typeof jwplayer === 'function') {
                jwplayer().play()
                
                return true
            }
        })

        proxyManager.create('jwplayer.getTextTrack', (): TrackId => {
            return jwplayer().getCurrentCaptions()
        })

        proxyManager.create('jwplayer.getTextTracks', (): Track[] => {
            const player = jwplayer()
            const activeTrack = player.getCurrentCaptions()

            return player
                .getCaptionsList()
                .map((track, i) => {
                    return {
                        id: track.id,
                        label: track.label,
                        active: i === activeTrack,
                    }
                })
        })

        proxyManager.create('jwplayer.setTextTrack', (trackId: TrackId): void => {
            const player = jwplayer()

            const captions = player.getCaptionsList()
            const caption = captions.find((track) => track.id === trackId)
            const index = captions.indexOf(caption)

            return jwplayer().setCurrentCaptions(index)
        })

        proxyManager.create('jwplayer.getAudioTrack', (): TrackId => {
            return jwplayer().getCurrentAudioTrack()
        })

        proxyManager.create('jwplayer.getAudioTracks', (): Track[] => {
            const player = jwplayer()
            const activeTrack = player.getCurrentAudioTrack()

            return player
                .getAudioTracks()
                .map((track, i) => {
                    return {
                        id: i,
                        label: track.name,
                        active: i === activeTrack,
                    }
                })
        })

        proxyManager.create('jwplayer.setAudioTrack', (trackId: number): void => {
            return jwplayer().setCurrentAudioTrack(trackId)
        })
    }

    isPlayer(el: HTMLElement): boolean {
        return el.classList.contains('jw-video')
    }

    getTextTracks(): Promise<Track[]> {
        return proxyManager.call<Track[]>('jwplayer.getTextTracks')
    }

    setTextTrack(trackId: TrackId): Promise<void> {
        return proxyManager.call('jwplayer.setTextTrack', trackId)
    }

    getAudioTracks(): Promise<Track[]> {
        return proxyManager.call<Track[]>('jwplayer.getAudioTracks')
    }

    setAudioTrack(trackId: TrackId): Promise<void> {
        return proxyManager.call('jwplayer.setAudioTrack', trackId)
    }
}
