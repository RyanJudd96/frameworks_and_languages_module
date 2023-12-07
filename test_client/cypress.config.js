const { defineConfig } = require('cypress')
module.exports = defineConfig({
    e2e: {
        supportFile: false,
        specPattern: 'cypress/**/*.cy.js',
        video: true,
        screenshotsFolder: 'reports/screenshots',
        videosFolder: 'reports/videos',
        chromeWebSecurity: false,
        reporter: 'junit',
        reporterOptions: {
            mochaFile: 'reports/junit-[hash].xml'
        },
    }
})