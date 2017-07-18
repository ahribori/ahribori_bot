import '../conf';
import appPath from '../conf/path';
import path from 'path';
import * as actionTypes from './actionTypes';

export default class Action {

    static navigate(url) {
        return {
            type: actionTypes.NAVIGATE,
            url
        }
    }

    static setValue(selector, value) {
        return {
            type: actionTypes.SET_VALUE,
            selector,
            value
        }
    }

    static click(selector) {
        return {
            type: actionTypes.CLICK,
            selector
        }
    }

    static wait(milliseconds) {
        return {
            type: actionTypes.WAIT,
            milliseconds
        }
    }

    static screenshot() {
        return {
            type: actionTypes.SCREENSHOT
        }
    }

    static custom(callback) {
        return {
            type: actionTypes.CUSTOM,
            callback
        }
    }

    /**
     * Action 객체와 browser 객체를 인자로 받아,
     * action.type 을 구분하여, 셀레늄을 핸들링 한다.
     * @param {object} action
     * @param {object} browser
     * @returns {Promise.<void>}
     */
    static async runAction(action, browser) {
        await (async function (browser) {
            switch (action.type.toUpperCase()) {

                /**
                 * 지정된 url에 접속한다.
                 *
                 * param1: url
                 */
                case actionTypes.NAVIGATE:
                    await browser.url(action.url);
                    break;

                /**
                 * selector로 DOM을 탐색하여 value를 삽입한다.
                 *
                 * param1: selector
                 * param2: value
                 */
                case actionTypes.SET_VALUE:
                    await browser.setValue(action.selector, action.value);
                    break;

                /**
                 * selector로 DOM을 탐색하여 클릭한다.
                 *
                 * param1: selector
                 */
                case actionTypes.CLICK:
                    await browser.click(action.selector);
                    break;

                /**
                 * param1(ms) 동안 wait한다.
                 *
                 * param1: ms
                 */
                case actionTypes.WAIT:
                    await new Promise(r => {
                        setTimeout(() => {
                            r();
                        }, action.milliseconds);
                    });
                    break;

                case actionTypes.SCREENSHOT:
                    await browser.saveScreenshot(path.resolve(appPath.SCREENSHOT_PATH, `${Date.now()}.png`));
                    break;

                /**
                 *  action.type이 function이면,
                 *  브라우저 객체를 인자로 넘겨,
                 *  외부에서 직접 browser 객체를 핸들링 할 수 있음.
                 */
                default:
                    if (action.type === actionTypes.CUSTOM && typeof action.callback === 'function') {
                        try {
                            await callback(browser);
                        } catch (e) {
                            throw e;
                        }
                    }
            }
        }(browser));
    }

}