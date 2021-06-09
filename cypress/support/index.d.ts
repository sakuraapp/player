import { Player } from '~/player'

declare global {
    namespace Cypress {
        interface Chainable<Subject> {
            initPlayer(): Promise<Player>
        }
    }
}
