import log from '../conf/logger';

export default (res, error, statusCode) => {
    const status = !isNaN(statusCode) ? statusCode : 500;
    log('error', 'API_ERROR', error.message);
    res.status(status).json({
        error: error.message,
        status
    });
}