import express from 'express';
const router = express.Router();
import { Transaction } from '../model';
import onError from './onError';

router.get('/', async (req, res) => {
    try {
        res.json(await Transaction.find({}));
    } catch (e) {
        return onError(res, e);
    }
});

router.get('/:id', async (req, res) => {
    try {
        const transaction = await Transaction.findOne({ _id: req.params.id });
        res.json(transaction);
    } catch (e) {
        return onError(res, e);
    }
});

router.post('/', async (req, res) => {
    const { name, actions } = req.body;
    if (!name) { return onError(res, new Error('name required'), 400); }
    if (!Array.isArray(actions)) {
        return onError(res, new Error('action must be of type array'), 400);
    }

    try {
        res.json(await Transaction({
            name,
            actions
        }).save());
    } catch (e) {
        return onError(res, e);
    }
});

router.put('/:id', async (req, res) => {
    const { name, actions } = req.body;
    const willUpdate = {};
    if (name) {
        willUpdate['name'] = name;
    }
    if (actions) {
        if (!Array.isArray(actions)) {
            return onError(res, new Error('action must be of type array'), 400);
        }
        willUpdate['actions'] = actions;
    }
    willUpdate['mod_date'] = Date.now();

    try {
        res.json(await Transaction.update({ _id: req.params.id }, willUpdate));
    } catch (e) {
        return onError(res, e);
    }
});

router.delete('/:id', async (req, res) => {
    try {
        res.json(await Transaction.remove({ _id: req.params.id }));
    } catch(e) {
        return onError(res, e);
    }
});

export default router;