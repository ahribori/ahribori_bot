require('dotenv').config();
import winston from 'winston';
winston.configure({
    transports: [
        new (winston.transports.File)({
            name: 'all-file',
            filename: 'all.log',
            level: 'info',
        }),
        new (winston.transports.File)({
            name: 'error-file',
            filename: 'error.log',
            level: 'error'
        })
    ]
});