import '../conf';
import EventEmitter from 'events';
import logger from 'winston';
const event = new EventEmitter();

/**
 * 트랜잭션 관련 이벤트 로깅 메소드
 * @param event
 * @param transaction
 * @param live
 * @param queue
 */
const log = (event, transaction, live, queue) => {
    const logObject = {
        event,
        live,
        queue,
    };

    if (transaction) {
        logObject['actions'] = transaction.getActions();
    }

    logger.log('info', logObject);
};

export default class Manager {

    constructor(_agent) {
    	this.agent = _agent;
    	
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
     * 이벤트 리스너들을 등록하는 메소드
     */
    bindEventListener() {
        event.on('add', (transaction, browser) => {
            log('TRANSACTION_ADD', transaction, this.liveSession, this.transactionQueue.length);
            if (this.liveSession < this.maxSession) {
                this.runTransaction(browser);
            }

        });

        event.on('start', (transaction, browser) => {
            log('TRANSACTION_START', transaction, this.liveSession, this.transactionQueue.length);
        });

        event.on('finish', (transaction, browser) => {
            log('TRANSACTION_FINISH', transaction, this.liveSession, this.transactionQueue.length);
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
            event.emit('add', transaction, browser);
        }
    }

    /**
     * 큐에서 트랜잭션을 하나 꺼내서 시작한다.
     * 시작시 'start' 이벤트 발생, 완료시 'finish' 이벤트 발생.
     * @param browser
     */
    runTransaction(browser) {
        if (this.transactionQueue.length > 0) {
            if (this.liveSession < this.maxSession) {
                const transaction = this.transactionQueue.shift();
                this.liveSession ++;
                event.emit('start', transaction, browser);
                transaction.run(this.agent, browser).then(() => {
                    this.liveSession --;
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

}

