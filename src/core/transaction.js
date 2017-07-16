import log from '../conf/logger';
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
     * @param agent
     * @param browserType
     * @returns {Promise}
     */
    run(agent, browserType) {
        return new Promise((resolve, reject) => {
        	if (!agent) {
				reject(new Error('Agent is undefined.'));
			}

            if (browserType !== 'chrome' &&
                browserType !== 'internet explorer' &&
                browserType !== 'firefox' &&
                browserType !== 'safari' &&
                browserType !== 'phantomjs') {
                browserType = 'chrome';
            }
            
            const seleniumOptions = {
				desiredCapabilities: {
					browserName: browserType
				},
				protocol: agent.protocol || process.env.SELENIUM_PROTOCOL || 'http',
				host: agent.host || process.env.SELENIUM_HOST || '127.0.0.1',
				port: agent.port || process.env.SELENIUM_PORT || 4444,
				services: ['phantomjs']
			};

            const browser = wdio.remote(seleniumOptions);

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
                    log('error', 'SELENIUM_ERROR', e.message);
                    reject(e);
                }
            }(browser));
        });
    }

}