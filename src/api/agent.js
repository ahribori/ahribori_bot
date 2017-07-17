import express from 'express';
const router = express.Router();
import { Agent } from '../model';
import onError from './onError';

router.get('/', async (req, res) => {
    try {
        res.json(await Agent.find({}));
    } catch (e) {
        return onError(res, e);
    }
});

router.get('/:id', async (req, res) => {
    try {
        const agent = await Agent.findOne({ _id: req.params.id });
        res.json(agent);
    } catch (e) {
        return onError(res, e);
    }
});

router.post('/', async (req, res) => {
    const { name, protocol, host, port } = req.body;
    if (!name) {
        return onError(res, new Error('name required'), 400);
    }
    if (protocol && (protocol !== 'http' && protocol !== 'https')) {
        return onError(res, new Error('invalid protocol'), 400);
    }
    if (port && (isNaN(port) || port < 1 || port > 65535)) {
        return onError(res, new Error('invalid port'), 400);
    }

    try {
        res.json(await Agent({
            name,
            protocol,
            host,
            port
        }).save());
    } catch (e) {
        return onError(res, e);
    }

});

router.put('/:id', async (req, res) => {
    const { name, protocol, host, port } = req.body;
    const willUpdate = {};
    if (name) {
        willUpdate['name'] = name;
    }
    if (protocol) {
        if (protocol && (protocol !== 'http' && protocol !== 'https')) {
            return onError(res, new Error('invalid protocol'), 400);
        }
        willUpdate['protocol'] = protocol;
    }
    if (host) {
        willUpdate['host'] = host;
    }
    if (port) {
        if (isNaN(port) || port < 1 || port > 65535) {
            return onError(res, new Error('invalid port'), 400);
        }
        willUpdate['port'] = port;
    }
    willUpdate['mod_date'] = Date.now();

    try {
        res.json(await Agent.update({ _id: req.params.id }, willUpdate));
    } catch (e) {
        return onError(res, e);
    }

});

router.delete('/:id', async (req, res) => {
    try {
        res.json(await Agent.remove({ _id: req.params.id }));
    } catch (e) {
        return onError(res, e);
    }
});

export default router;