import { Agent, Transaction, Schedule } from '../model';
import Manager from '../core/manager';
import nodeScheduler from 'node-schedule';
import event from './event';
import log from '../conf/logger';
const manager = new Manager();

// singleton class
let instance = null;

// 디비에서 스케쥴 리스트를 모두 가져와서 callback에 넘겨서 실행
const getSchedules = async (callback) => {
    const schedules = await Schedule.find();
    for (let i = 0; i < schedules.length; i++) {
        const schedule = schedules[i];
        const agent = await Agent.findOne({ _id: schedule.agent });
        const transaction = await Transaction.findOne({ _id: schedule.transaction });
        if (typeof callback === 'function') {
            callback(schedule, agent, transaction);
        }
    }
};

// 초기화 스케쥴 등록
const initialize = async ({ schedule, agent, transaction }) => {
    switch (schedule.type) {
        case 'now':
            if (schedule.count === 0) {
                manager.enqueueTransaction(transaction, agent, schedule.browser);
                await Schedule.update({ _id: schedule._id }, { count: ++schedule.count });
            }
            break;
        case 'date':
            const job = nodeScheduler.scheduleJob(schedule.date, () => {
                manager.enqueueTransaction(transaction, agent, schedule.browser);
            });
            if (job) {
                instance.scheduleTable[schedule._id] = job;
                log('info', 'SCHEDULE_ADD', schedule._id);
            }
            break;
        case 'cron':
            break;
    }
};

// 초기화 이후 스케쥴 등록
const applySchedulesAfterInitialized = async ({ schedule, agent, transaction }) => {
    switch (schedule.type) {
        case 'now':
            if (schedule.count === 0) {
                manager.enqueueTransaction(transaction, agent, schedule.browser);
                await Schedule.update({ _id: schedule._id }, { count: ++ schedule.count });
            }
            break;
        case 'date':
            const job = nodeScheduler.scheduleJob(schedule.date, () => {
                manager.enqueueTransaction(transaction, agent, schedule.browser);
            });
            if (job) {
                instance.scheduleTable[schedule._id] = job;
                log('info', 'SCHEDULE_ADD', schedule._id);
            }
            break;
        case 'cron':
            break;
    }
};

// 스케쥴이 새로 등록되었을 때 이벤트 콜백
event.on('addSchedule', async (schedule) => {
    const agent = await Agent.findOne({ _id: schedule.agent });
    const transaction = await Transaction.findOne({ _id: schedule.transaction });
    applySchedulesAfterInitialized({
        schedule,
        agent,
        transaction
    });
});

// 스케쥴이 삭제되었을 때 이벤트 콜백
event.on('removeSchedule', (schedule) => {
    const job = instance.scheduleTable[schedule._id];
    if (job) {
        job.cancel();
        delete instance.scheduleTable[schedule._id];
        log('info', 'SCHEDULE_REMOVE', schedule._id );
    }
});

export default class ScheduleManager {
    constructor() {
        if (!instance) {
            this.scheduleTable = {};
            instance = this;
            this.init();
        }
    }

    async init () {
        getSchedules((schedule, agent, transaction) => {
            initialize({ schedule, agent, transaction });
        });
    }
}

