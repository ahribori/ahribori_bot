import winston from 'winston';
import path from 'path';
import appPath from './path';

winston.configure({
    transports: [
        new (winston.transports.Console)(),
        new (winston.transports.File)({
            name: 'all-file',
            filename: path.resolve(appPath.LOG_PATH, 'all.log'),
            level: 'info',
        }),
        new (winston.transports.File)({
            name: 'error-file',
            filename: path.resolve(appPath.LOG_PATH, 'error.log'),
            level: 'error'
        })
    ]
});

export default (severity, eventType, message) => {
    winston.log(severity, message, { event: eventType });
};