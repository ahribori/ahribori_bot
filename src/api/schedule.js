import express from 'express';
const router = express.Router();
import { Schedule } from '../model';
import onError from './onError';

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
        res.json(await Schedule({
            agent,
            transaction,
            browser,
            type,
            repeat,
            date,
            cron,
            interval
        }).save());
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
        res.json(await Schedule.update({ _id: req.params.id }, willUpdate));
    } catch (e) {
        return onError(res, e);
    }
});

router.delete('/:id', async (req, res) => {
    try {
        res.json(await Schedule.remove({ _id: req.params.id }));
    } catch (e) {
        return onError(res, e);
    }
});

export default router;