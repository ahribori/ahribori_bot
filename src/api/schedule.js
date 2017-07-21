import express from 'express';
const router = express.Router();
import { Schedule } from '../model';
import onError from './onError';
import event from '../core/event';

router.get('/', async (req, res) => {
    try {
        res.json(await Schedule.find({}));
    } catch (e) {
        return onError(res, e);
    }
});

router.get('/:id', async (req, res) => {
    try {
        const transaction = await Schedule.findOne({ _id: req.params.id });
        res.json(transaction);
    } catch (e) {
        return onError(res, e);
    }
});

router.post('/', async (req, res) => {
    const {
        agent,
        transaction,
        browser,
        type,
        repeat,
        date,
        cron,
        interval
    } = req.body;
    if (!agent) {
        return onError(res, new Error('agent_id required'), 400);
    }
    if (!transaction) {
        return onError(res, new Error('transaction_id required'), 400);
    }

    try {
        const schedule = await Schedule({
            agent,
            transaction,
            browser,
            type,
            repeat,
            date,
            cron,
            interval
        }).save();
        res.json(schedule);
        event.emit('addSchedule', schedule);
    } catch (e) {
        return onError(res, e);
    }
});

router.put('/:id', async (req, res) => {
    const {
        agent,
        transaction,
        browser,
        type,
        repeat,
        date,
        cron,
        interval
    } = req.body;
    const willUpdate = {};
    if (agent) {
        willUpdate['agent'] = agent;
    }
    if (transaction) {
        willUpdate['transaction'] = transaction;
    }
    if (browser) {
        willUpdate['browser'] = browser;
    }
    if (type) {
        willUpdate['type'] = type;
    }
    if (repeat) {
        willUpdate['repeat'] = repeat;
    }
    if (date) {
        willUpdate['date'] = date;
    }
    if (cron) {
        willUpdate['crone'] = cron;
    }
    if (interval) {
        willUpdate['interval'] = interval
    }
    willUpdate['mod_date'] = Date.now();

    try {
        const schedule = await Schedule.update({ _id: req.params.id }, willUpdate);
        res.json(schedule);
        event.emit('updateSchedule', schedule);
    } catch (e) {
        return onError(res, e);
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const schedule = await Schedule.findOne({ _id: req.params.id });
        if (schedule) {
            const remove = await schedule.remove();
            event.emit('removeSchedule', remove);
            res.json(remove);
        } else {
            res.send(`${req.params.id} schedule not exist`);
        }
    } catch (e) {
        return onError(res, e);
    }
});

export default router;