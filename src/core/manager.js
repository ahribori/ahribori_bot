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

    if (transaction) {
        logObject['actions'] = transaction.actions;
    }

    logger.log('info', logObject);
};

export default class Manager {

    constructor(_agent) {
    	this.agent = _agent;
    	this.redisKey = this.agent && this.agent._id ? `agent-${this.agent._id}`: `agent`;

        /**
         * 트랜잭션을 최대 몇 개까지 동시에 실행 할 것인지.
         * @type {*}
         */
        this.maxSession = this.agent && this.agent.max_session ? this.agent.max_session : 1;

        /**
         * 실행중인 트랜잭션 수
         * @type {number}
         */
        this.liveSession = 0;

        /**
         * 트랜잭션 대기 큐
         * @type {Array}
         */
        this.transactionQueue = [];

        /**
         * 이벤트 리스너 바인딩
         */
        this.bindEventListener();



    }

	/**
	 * 변수들을 Redis에 stringify object로 저장한다.
	 * key는 agent-{agentId}이다.
	 */
	saveVariables () {
		redis.set(this.redisKey, JSON.stringify({
			transactionQueue: this.transactionQueue,
			liveSession: this.liveSession
		}));
	};

	/**
	 * Redis에 key로 저장되어 있는 변수들을 로컬로 가져온다.
	 * @returns {Promise}
	 */
	loadVariables () {
		return new Promise((resolve, reject) => {
			redis.get(this.redisKey, (err, value) => {
				if (err) reject(err);
				const variables = JSON.parse(value);
				this.transactionQueue = variables.transactionQueue;
				this.liveSession = variables.liveSession;
				resolve();
			});
		});
	};

    /**
     * 이벤트 리스너들을 등록하는 메소드
     */
    bindEventListener() {
        event.on('add', (transaction, browser) => {
			logTransactions('TRANSACTION_ADD', transaction, this.liveSession, this.transactionQueue.length);
            if (this.liveSession < this.maxSession) {
                this.runTransaction(browser);
            }

        });

        event.on('start', (transaction, browser) => {
			logTransactions('TRANSACTION_START', transaction, this.liveSession, this.transactionQueue.length);
        });

        event.on('finish', (transaction, browser) => {
			logTransactions('TRANSACTION_FINISH', transaction, this.liveSession, this.transactionQueue.length);
            if (this.liveSession < this.maxSession) {
                this.runTransaction(browser);
            }
        });
    }

    /**
     * 트랜잭션을 대기 큐에 추가하는 메소드.
     * 트랜잭션을 큐에 추가 하는 순간 'add' 이벤트가 발생.
     * @param transaction
     * @param browser
     */
    addTransaction(transaction, browser) {
        if (transaction) {
            this.transactionQueue.push(transaction);
            this.saveVariables();
            event.emit('add', transaction, browser);
        }
    }

    /**
     * 큐에서 트랜잭션을 하나 꺼내서 시작한다.
     * 시작시 'start' 이벤트 발생, 완료시 'finish' 이벤트 발생.
     * @param browser
     */
    async runTransaction(browser) {
    	await this.loadVariables();
        if (this.transactionQueue.length > 0) {
            if (this.liveSession < this.maxSession) {
                const transaction = this.transactionQueue.shift();
                this.liveSession ++;
				this.saveVariables();
                event.emit('start', transaction, browser);

                this.requestToSelenium(this.agent, transaction, browser).then(() => {
                    this.liveSession --;
					this.saveVariables();
                    event.emit('finish', transaction, browser);
                }).catch(err => {
					// transaction.run 에서 로깅함
				});

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
	requestToSelenium(agent, transaction, browserType) {
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

