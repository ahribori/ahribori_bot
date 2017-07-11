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

		/**
		 * 셀레늄 드라이버 초기화,
		 * 드라이버가 없다면 다운로드, 설치 후 driver resolve.
		 */
		return new Promise((resolve, reject) => {
			seleniumDrivers.init({
				browserName: browser,
				download: true
			}).then(() => {
        		const driver = new webDriver.Builder().forBrowser(browser).build();
				driver.then(() => {
					resolve(driver);
				}).catch(err => {
					reject(err);
				});
			}).catch(err => {
				reject(err);
			});
		});
		
    }
}