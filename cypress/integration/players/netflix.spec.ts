import { Player } from '~/player'
import { runTest } from '../player.spec'

function login() {
    return new Cypress.Promise((resolve, reject) => {
        cy.fixture('cookies.json').then((cookies) => {
            for (const cookie of cookies.netflix) {
                cy.setCookie(cookie.name, cookie.value, cookie)
            }
        })
    })
}

const DEFAULT_COMMAND_TIMEOUT = Cypress.config().defaultCommandTimeout

Cypress.config('defaultCommandTimeout', 15000)

describe('Netflix', () => {
    let player: Player

    before(() => {
        login()

        cy
            .visit('https://www.netflix.com/watch/70274051?trackId=155573558')
            //.then(cy.initPlayer)
            .then(() => {
                cy.get('video').then(console.log)
            })
    })

    runTest(player)
})