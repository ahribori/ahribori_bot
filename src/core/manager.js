import '../conf';
import logger from 'winston';
import log from '../conf/logger';
import event from './event';
const wdio = require('webdriverio');
import Action from './action';


/**
 * 트랜잭션 관련 이벤트 로깅 메소드
 * @param event
 * @param transaction
 * @param live
 * @param queue
 */
const logTransactions = (event, transaction, live, queue) => {
    const logObject = {
        event,
        live,
        queue,
    };

    if (transaction.transaction) {
        logObject['actions'] = transaction.transaction.actions;
    }

    logger.log('info', logObject);
};

// singleton class
let instance = null;

export default class Manager {

    constructor() {
        if (!instance) {
            instance = this;
            this.transactionQueue = [];
            this.liveSession = 0;
            this.eventListenerBinded = false;
        }

        /**
         * 이벤트 리스너 바인딩
         */
        instance.bindEventListener();

        return instance;
    }

    /**
     * 이벤트 리스너들을 등록하는 메소드
     */
    bindEventListener() {

        if (this.eventListenerBinded === false) {
            event.on('add', (transaction, agent) => {
                logTransactions('TRANSACTION_ADD', transaction, this.liveSession, this.transactionQueue.length);
                if (this.liveSession < agent.max_session) {
                    this.runTransaction(agent);
                }
            });

            event.on('start', (transaction, agent) => {
                logTransactions('TRANSACTION_START', transaction, this.liveSession, this.transactionQueue.length);
            });

            event.on('finish', (transaction, agent) => {
                logTransactions('TRANSACTION_FINISH', transaction, this.liveSession, this.transactionQueue.length);
                if (this.liveSession < agent.max_session) {
                    this.runTransaction(agent);
                }
            });
            instance.event = event;
            this.eventListenerBinded = true;
        }
    }

    /**
     * 트랜잭션을 대기 큐에 추가하는 메소드.
     * 트랜잭션을 큐에 추가 하는 순간 'add' 이벤트가 발생.
     * @param transaction
     * @param agent
     * @param browser
     */
    async enqueueTransaction(transaction, agent, browser) {
        this.transactionQueue.push({
            transaction,
            browser
        });
        event.emit('add', transaction, agent);
    }

    /**
     * 큐에서 트랜잭션을 하나 꺼내서 시작한다.
     * 시작시 'start' 이벤트 발생, 완료시 'finish' 이벤트 발생.
     * @param agent
     * @param browser
     */
    async runTransaction(agent) {
        if (this.transactionQueue.length > 0) {
            if (this.liveSession < agent.max_session) {
                const transaction = this.transactionQueue.shift();
                this.liveSession++;
                event.emit('start', transaction, agent);

                let result = {};

                try {
                    const results = await this.requestToSelenium(transaction.transaction, agent, transaction.browser);
                    result.success = true;
                    // 전체 성공
                    if (results.length > 0) {
                        result.results = results;
                    }
                } catch (e) {
                    result.success = false;
                    result.error = e;
                    log('error', 'SELENIUM_ERROR', e.message);
                }
                console.log(result);

                this.liveSession--;
                event.emit('finish', transaction, agent);

            } else {
                log('TRANSACTION_QUEUE_FULL', null, this.liveSession, this.transactionQueue.length);
            }
        } else {
            log('TRANSACTION_QUEUE_EMPTY', null, this.liveSession, this.transactionQueue.length);
        }
    }

    /**
     * agent, transaction, browserType을 인자로 받아,
     * 셀레늄 서버로 브라우저 실행을 요청한다.
     * @param agent
     * @param transaction
     * @param browserType
     * @returns {Promise}
     */
    requestToSelenium(transaction, agent, browserType) {
        return new Promise((resolve, reject) => {
            if (!agent) {
                log('error', 'TRANSACTION_RUNTIME_ERROR', 'Agent is undefined. You must pass an Agent object as an argument when calling the Manager constructor.');
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


            (async function (browser) {
                try {
                    await browser.init();

                    //------------- Action start -------------

                    const results = [];
                    for (let i = 0; i < transaction.actions.length; i++) {
                        const result = await Action.runAction(transaction.actions[i], browser);
                        if (result) {
                            results.push(result);
                        }
                    }

                    //------------- Action end ---------------

                    await browser.end();
                    resolve(results);
                } catch (e) {
                    await browser.end();
                    reject(e);
                }
            }(browser));
        });
    }

}

