import '../conf';
export default class Action {

    /**
     *
     * @param {string} type 브라우저가 수행할 행동을 정의한 액션 타입
     * @param {string} param* 브라우저의 행동에 필요한 값들을 동적 인자로 받음
     * @returns {{type: object}} Action 객체
     */
    static createAction(type) {
        const action = { type };
        for (let index in arguments) {
            if (arguments.hasOwnProperty(index)){
                if (index > 0) {
                    action[`param${index}`] = arguments[index];
                }
            }
        }
        return action;
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
            switch (action.type) {

                /**
                 * 지정된 url에 접속한다.
                 *
                 * param1: url
                 */
                case 'navigate':
                    await browser.url(action.param1);
                    break;

                /**
                 * selector로 DOM을 탐색하여 value를 삽입한다.
                 *
                 * param1: selector
                 * param2: value
                 */
                case 'setValue':
                    await browser.setValue(action.param1, action.param2);
                    break;

                /**
                 * selector로 DOM을 탐색하여 클릭한다.
                 *
                 * param1: selector
                 */
                case 'click':
                    await browser.click(action.param1);
                    break;

                /**
                 * param1(ms) 동안 wait한다.
                 *
                 * param1: ms
                 */
                case 'wait':
                    await new Promise(r => {
                        setTimeout(() => {
                            r();
                        }, action.param1);
                    });
                    break;

                /**
                 *  action.type이 function이면,
                 *  브라우저 객체를 인자로 넘겨,
                 *  외부에서 직접 browser 객체를 핸들링 할 수 있음.
                 */
                default:
                    if (typeof action.type === 'function') {
                        const customAction = action.type;
                        try {
                            await customAction(browser);
                        } catch (e) {
                            console.log(e);
                        }
                    }
            }
        }(browser));
    }

}