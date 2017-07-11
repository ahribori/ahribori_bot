import _ from 'lodash';
import webDriver from 'selenium-webdriver';
import Connector from './connector';
import Action from './action';
const By = webDriver.By;

export default class Transaction {
    constructor(_actions) {
        let actions = [];

        this.setActions = _actions => {
            let invalid = false;
            _actions.map(obj => {
                if (obj instanceof Action === false) invalid = true;
            });
            if (!invalid) {
                actions = _actions;
            } else {
                // TODO 배열 안의 오브젝트가 액션 오브젝트가 아님
            }
        };

        if (_.isArray(_actions)) {
            this.setActions(_actions);
        }

        this.getActions = () => {
            return actions;
        };
    }

    run(browser) {
        return new Promise((resolve, reject) => {
            /**
             * 셀레늄 드라이버 획득
             * @returns {Promise.<void>}
             */
            const getDriver = async () => {
                this.driver = await new Connector(browser);
            };

            /**
             * 셀레늄 드라이버와 커넥션이 맺어진 이후,
             * 핸들링
             */
            getDriver().then(async () => {
                const actions = this.getActions();
                for (let i = 0; i < actions.length; i++) {
                    if (actions[i] instanceof Action === false) {
                        console.log("Actions이 아닙니다.");
                    }
                    const action = actions[i];
                    switch (action.type) {
                        case 'navigate':
                            await this.driver.get(action.value);
                            break;
                        case 'setValue':
                            const element = await this.driver.findElement(By.css(action.value));
                            await element.sendKeys(action.value2);
                            break;
                        case 'click':
                            await console.log(`click ${action.value}`);
                            break;
                        case 'submit':
                            await this.driver.findElement(By.css(action.value)).submit();
                            break;
                        case 'wait':
                            await new Promise(r => {
                                setTimeout(() => {
                                    r();
                                }, action.value);
                            });
                            break;
                        case 'getPerformance':
                            const timing = await this.driver.executeScript('return window.performance.timing');
                            const resources = await this.driver.executeScript('return window.performance.getEntries();');

                            const domComplete = timing.domComplete - timing.navigationStart;
                            const domainLookup = timing.domainLookupEnd - timing.domainLookupStart;
                            const connect = timing.connectEnd - timing.connectStart;
                            const request = timing.responseStart - timing.requestStart;
                            const response = timing.responseEnd - timing.responseStart;
                            console.log('====================PERFORMANCE=======================');
                            console.log(`DOM COMPLETE TIME= ${domComplete} ms`);
                            console.log(`DOMAIN LOOKUP TIME= ${domainLookup} ms`);
                            console.log(`CONNECT TIME= ${connect} ms`);
                            console.log(`REQUEST TIME= ${request} ms`);
                            console.log(`RESPONSE TIME= ${response} ms`);
                            console.log('NUMBER OF ENTRIES: ' + resources.length);
                            console.log('======================================================');
                            break;
                        default:
							if (typeof action.type === 'function') {
								const customAction = action.type;
								try {
									await customAction(this.driver, By);
								} catch (e) {
									console.log(e);
								}
							}
                    }

                }

                /**
                 * 드라이버 종료
                 */
                await this.driver.quit();
                resolve();
            });
        });
    }

}