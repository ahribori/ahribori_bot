import '.'
export default {

    desiredCapabilities: {
        browserName: 'chrome'
    },

    protocol: process.env.SELENIUM_PROTOCOL || 'http',

    host: process.env.SELENIUM_HOST || '127.0.0.1',

    port: process.env.SELENIUM_PORT || 4444,

	services: ['phantomjs']

}