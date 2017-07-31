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

    static pause(milliseconds) {
        return {
            type: actionTypes.PAUSE,
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
        try {
            const result = await (async function (browser) {
                switch (action.type.toUpperCase()) {
                    /**
                     * ACTION
                     */
                    case actionTypes.CLICK:
                        await browser.click(action.selector);
                        break;
                    case actionTypes.SET_VALUE:
                        await browser.setValue(action.selector, action.value);
                        break;

                    /**
                     * COOKIE
                     */

                    /**
                     * PROPERTY
                     */
                    case actionTypes.GET_ATTRIBUTE:
                        return await browser.getAttribute(action.selector, action.attributeName);
                        break;
                    case actionTypes.GET_CSS_PROPERTY:
                        return await browser.getCssProperty(action.selector, action.cssProperty);
                        break;
                    case actionTypes.GET_ELEMENT_SIZE:
                        return await browser.getElementSize(action.selector, action.prop);
                        break;
                    case actionTypes.GET_HTML:
                        return await browser.getHTML(action.selector, action.includeSelectorTag || undefined);
                        break;
                    case actionTypes.GET_LOCATION:
                        return await browser.getLocation(action.selector, action.property);
                        break;
                    case actionTypes.GET_SOURCE:
                        return await browser.getSource();
                        break;
                    case actionTypes.GET_TAG_NAME:
                        return await browser.getTagName(action.selector);
                        break;
                    case actionTypes.GET_TEXT:
                        return await browser.getText(action.selector);
                        break;
                    case actionTypes.GET_TITLE:
                        return await browser.getTitle();
                        break;
                    case actionTypes.GET_URL:
                        return await browser.getUrl();
                        break;
                    case actionTypes.GET_VALUE:
                        return await browser.getValue(selector);
                        break;

                    /**
                     * PROTOCOL
                     */
                    case actionTypes.ALERT_ACCEPT:
                        await browser.alertAccept();
                        break;
                    case actionTypes.ALERT_DISMISS:
                        await browser.alertDismiss();
                    case actionTypes.ALERT_TEXT:
                        return await browser.alertText(action.text);
                    case actionTypes.NAVIGATE:
                        await browser.url(action.url);
                        break;
                    case actionTypes.FRAME:
                        const frame = await browser.$(action.selector);
                        await browser.frame(frame.value);
                        break;

                    /**
                     * STATE
                     */

                    /**
                     * UTILITY
                     */
                    case actionTypes.PAUSE:
                        await browser.pause(action.milliseconds);
                        break;
                    case actionTypes.SCREENSHOT:
                        await browser.saveScreenshot(path.resolve(appPath.SCREENSHOT_PATH, `${Date.now()}.png`));
                        break;

                    /**
                     * WINDOW
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

            if (result) {
                return {
                    action,
                    result
                };
            }

        } catch (e) {
            throw e;
        }
    }

}