import '../conf';
import EventEmitter from 'events';
import logger from 'winston';
import log from '../conf/logger';
import redis from '../conf/redis';
const event = new EventEmitter();
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
            event.on('add', async (transaction, agent) => {
                const redisKey = agent && agent._id ? `agent-${agent._id}` : `agent`;
                const store = await this.load(redisKey);
                logTransactions('TRANSACTION_ADD', transaction, store.liveSession, store.transactionQueue.length);
                if (store.liveSession < agent.max_session) {
                    await this.runTransaction(agent);
                }
            });

            event.on('start', async (transaction, agent) => {
                const redisKey = agent && agent._id ? `agent-${agent._id}` : `agent`;
                const store = await this.load(redisKey);
                logTransactions('TRANSACTION_START', transaction, store.liveSession, store.transactionQueue.length);
            });

            event.on('finish', async (transaction, agent) => {
                const redisKey = agent && agent._id ? `agent-${agent._id}` : `agent`;
                const store = await this.load(redisKey);
                logTransactions('TRANSACTION_FINISH', transaction, store.liveSession, store.transactionQueue.length);
                if (store.liveSession < agent.max_session) {
                    await this.runTransaction(agent);
                }
            });
            this.eventListenerBinded = true;
        }
    }

    load(key) {
        return new Promise((resolve, reject) => {
            redis.get(key, (err, value) => {
                if (err) reject(err);
                const variables = JSON.parse(value) || {};
                const transactionQueue = variables.transactionQueue || [];
                const liveSession = variables.liveSession || 0;
                resolve({
                    transactionQueue,
                    liveSession
                });
            });
        });
    }

    save(key, transactionQueue = [], liveSession = 0) {
        return new Promise((resolve, reject) => {
            redis.set(key, JSON.stringify({
                transactionQueue,
                liveSession
            }), (err) => {
                if (err) reject(err);
                resolve({
                    transactionQueue,
                    liveSession
                });
            });
        });
    }

    /**
     * 트랜잭션을 대기 큐에 추가하는 메소드.
     * 트랜잭션을 큐에 추가 하는 순간 'add' 이벤트가 발생.
     * @param transaction
     * @param agent
     * @param browser
     */
    async enqueueTransaction(transaction, agent, browser) {
        const redisKey = agent && agent._id ? `agent-${agent._id}` : `agent`;
        const store = await this.load(redisKey);
        store.transactionQueue.push({
            transaction,
            browser
        });
        await this.save(redisKey, store.transactionQueue, store.liveSession);
        event.emit('add', transaction, agent);
        await new Promise((r) => { setTimeout(() => { r(); }, 100)} );
    }

    /**
     * 큐에서 트랜잭션을 하나 꺼내서 시작한다.
     * 시작시 'start' 이벤트 발생, 완료시 'finish' 이벤트 발생.
     * @param agent
     * @param browser
     */
    async runTransaction(agent) {
        const redisKey = agent && agent._id ? `agent-${agent._id}` : `agent`;
        const store = await this.load(redisKey);
        if (store.transactionQueue.length > 0) {
            if (store.liveSession < agent.max_session) {
                const transaction = store.transactionQueue.shift();
                store.liveSession++;
                await this.save(redisKey, store.transactionQueue, store.liveSession);
                event.emit('start', transaction, agent);
                await this.requestToSelenium(transaction.transaction, agent, transaction.browser);
                const store_temp = await this.load(redisKey);
                store_temp.liveSession--;
                await this.save(redisKey, store_temp.transactionQueue, store_temp.liveSession);
                event.emit('finish', transaction, agent);

            } else {
                log('TRANSACTION_QUEUE_FULL', null, store.liveSession, store.transactionQueue.length);
            }
        } else {
            log('TRANSACTION_QUEUE_EMPTY', null, store.liveSession, store.transactionQueue.length);
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

                    for (let i = 0; i < transaction.actions.length; i++) {
                        await Action.runAction(transaction.actions[i], browser);
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

