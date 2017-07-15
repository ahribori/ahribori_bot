import '../conf';
import redis from 'redis';
import logger from '../conf/logger';

const REDIS_HOST = process.env.REDIS_HOST || '127.0.0.1';
const REDIS_PORT = process.env.REDIS_PORT || 6379;
const REDIS_URL = process.env.REDIS_URL || null;

const client = redis.createClient({
	host: REDIS_HOST,
	port: REDIS_PORT,
	url: REDIS_URL,
});

client.on('ready', () => {
	logger.log('info', 'REDIS_READY', `Redis connection established : ${REDIS_HOST}:${REDIS_PORT}`);
});

client.on('connect', () => {
});

client.on('reconnecting', () => {
});

client.on('end', () => {
});

client.on('error', (err) => {
	logger.log('error', 'REDIS_ERROR', err.message);
});

client.on('warning', () => {
});

export default client;
