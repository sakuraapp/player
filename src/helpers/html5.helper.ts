import { Track, TrackId } from '../player'

export class HTML5 {
    static getTextTracks(player: HTMLMediaElement): Track[] {
        const tracks = []

        for (let i = 0; i < player.textTracks.length; i++) {
            const track = player.textTracks[i]
    
            tracks.push({
                id: track.id || i, // fixme: is it a good idea to fallback to i here?
                label: track.label,
                active: track.mode === 'showing',
            })
        }

        return tracks
    }
    
    static setTextTrack(trackId: TrackId, player: HTMLMediaElement): void {
        for (let i = 0; i < player.textTracks.length; i++) {
            const track = player.textTracks[i]

            if (track.id === trackId || i === trackId) {
                track.mode = 'showing'
            } else {
                track.mode = 'disabled'
            }
        }
    }
}
