const wdio = require('webdriverio');

const seleniumOptions = {
    desiredCapabilities: {
        browserName: 'chrome'
    },
    protocol: 'http',
    host: '127.0.0.1',
    port: 4444,
    services: ['phantomjs']
};

const browser = wdio.remote(seleniumOptions);

(async function () {
    try {
        await browser.init();

        // TEST API

        await browser.end();
    } catch (e) {
        console.log(e);
        await browser.end();
    }
}());
