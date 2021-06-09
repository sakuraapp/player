import { Player } from '~/player'

Cypress.Commands.add('initPlayer', () => {
    cy.get('video').then(console.log)

    return new Cypress.Promise((resolve, reject) => {
        const player = new Player()
        
        console.log('initPlayer')
        console.log(location.href)

        player
            .find()
            .then(() => {
                console.log('lu')
                resolve(player)
            })
            .catch(reject)
    })
})
