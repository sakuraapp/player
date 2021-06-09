/// <reference types="cypress" />

/**
 * @type {Cypress.PluginConfig}
 */
// eslint-disable-next-line no-unused-vars
module.exports = (on, config) => {
    on('before:browser:launch', (browser = {}, launchOptions) => {
        if (browser.family === 'chromium' && browser.name !== 'electron') {
            launchOptions.args = launchOptions.args.filter(arg => arg !== '--disable-component-update')

            console.log('Chrome launch args:', launchOptions.args) // print all args

            return launchOptions
        }
    })
}
