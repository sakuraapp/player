import { Player } from '~/player'

export function runTest(player: Player) {
    it('can play', () => {
        player.play()

        expect(player.playing).to.be.true
    })

    it('can pause', () => {
        player.pause()

        expect(player.playing).to.be.false
    })

    it('can seek', () => {
        player.seek(10)

        expect(player.currentTime).to.be.at.least(10)
    })

    it('can set volume', () => {
        player.volume = 0.5

        expect(player.volume).to.be.equal(0.5)
    })
}
