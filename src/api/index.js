import express from 'express';
import cors from 'cors';
const router = express.Router();

import agent from './agent';
import transaction from './transaction';
import schedule from './schedule';

router.get('/', (req, res) => {
    res.json('Ahribori Bot Server');
});

router.use('/api', cors());
router.use('/api/agent', agent);
router.use('/api/transaction', transaction);
router.use('/api/schedule', schedule);

export default router;