import '../conf';
import seleniumConf from '../conf/selenium';
import logger from 'winston';
import _ from 'lodash';
import Action from './action';
const wdio = require('webdriverio');

/**
 * n개의 액션을 순차적으로 수행하는 클래스
 * @class Transaction
 */
export default class Transaction {

    /**
     * Action.createAction()을 통해 생성된 액션의 배열을 인자로 받는다.
     * @param _actions
     */
    constructor(_actions) {
        let actions = [];

        if (_.isArray(_actions)) {
            actions = _actions;
        }

        this.getActions = () => {
            return actions;
        };
    }

    /**
     * chrome, firefox 등의 브라우저 종류를 인자로 받아
     * 셀레늄 드라이버와 바인딩하고 생성자에서 받은 액션들을
     * 순차적으로 실행
     * @param browserType
     * @returns {Promise}
     */
    run(browserType) {
        return new Promise((resolve, reject) => {

            if (browserType !== 'chrome' &&
                browserType !== 'internet explorer' &&
                browserType !== 'firefox' &&
                browserType !== 'safari' &&
                browserType !== 'phantomjs') {
                browserType = 'chrome';
            }

            seleniumConf.desiredCapabilities.browserName = browserType;

            const browser = wdio.remote(seleniumConf);

            const actions = this.getActions();

            (async function (browser) {
                try {
                    await browser.init();

                    //------------- Action start -------------

                    for (let i = 0; i < actions.length; i++) {
                        const action = actions[i];
                        await Action.runAction(action, browser);
                    }

                    //------------- Action end ---------------

                    await browser.end();
                    resolve();
                } catch (e) {
                    await browser.end();
                    logger.error(e.message);
                    reject(e);
                }
            }(browser));
        });
    }

}