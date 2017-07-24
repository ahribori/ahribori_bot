import express from 'express';
import cors from 'cors';
const router = express.Router();

import agent from './agent';
import transaction from './transaction';
import schedule from './schedule';
import test from './test';

router.get('/', (req, res) => {
    res.json('Ahribori Bot Server');
});

router.use('/api', cors());
router.use('/api/agent', agent);
router.use('/api/transaction', transaction);
router.use('/api/schedule', schedule);

router.use('/test', test);

export default router;