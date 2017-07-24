import express from 'express';
const router = express.Router();

import { Schedule, Agent, Transaction } from '../model';
import Manager from '../core/manager';
const manager = new Manager();

router.get('/', async(req, res) => {
    const schedules = await Schedule.find();
    if (schedules.length > 0) {
        const transaction = await Transaction.findOne({ _id: schedules[0].transaction });
        const agent = await Agent.findOne({ _id: schedules[0].agent });
        manager.enqueueTransaction(transaction, agent, 'chrome', schedules[0]._id);
    }
    res.json('test');
});

export default router;