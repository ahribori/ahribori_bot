import log from '../conf/logger';

export default (res, error, statusCode = 500, eventType = 'API_ERROR') => {
    if (statusCode === 500) {
        log('error', eventType, error.message);
    }
    res.status(statusCode).json({
        error: error.message,
        status: statusCode
    });
}