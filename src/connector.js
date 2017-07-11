import webDriver from 'selenium-webdriver';
import seleniumDrivers from 'selenium-drivers';

export default class Connector {
    constructor(browser = 'chrome') {

        if (browser !== 'chrome' &&
            browser !== 'internet explorer' &&
            browser !== 'firefox' &&
            browser !== 'safari') {
            browser = 'chrome';
        }

        seleniumDrivers.init({
            browserName: browser,
            download: true
        });

        const driver = new webDriver.Builder().forBrowser(browser).build();
        return driver;
    }
}