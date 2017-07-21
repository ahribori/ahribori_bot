import '../conf';
import redis from 'redis';
import log from '../conf/logger';

const REDIS_HOST = process.env.REDIS_HOST || '127.0.0.1';
const REDIS_PORT = process.env.REDIS_PORT || 6379;
const REDIS_URL = process.env.REDIS_URL || null;

const client = redis.createClient({
    host: REDIS_HOST,
    port: REDIS_PORT,
    url: REDIS_URL,
});

client.flushdb( function (err, succeeded) {
    console.log('[REDIS] Flush'); // will be true if successfull
});

client.on('ready', () => {
    log('info', 'REDIS_READY', `Redis connection established : ${REDIS_HOST}:${REDIS_PORT}`);
});

client.on('connect', () => {
});

client.on('reconnecting', () => {
});

client.on('end', () => {
});

client.on('error', (err) => {
    log('error', 'REDIS_ERROR', err.message);
});

client.on('warning', () => {
});

if (process.env.NODE_ENV === 'development' && process.env.REDIS_CONSOLE_LOG === 'true') {
    client.monitor((err, res) => {
        console.log('Entering Redis monitoring mode.');
    });

    client.on('monitor', function (time, args, raw_reply) {
        console.log(`[REDIS] ${args}`);
    });
}

export default client;
