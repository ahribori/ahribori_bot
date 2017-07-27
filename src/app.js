/* =========================================
 Load dependencies
 ============================================*/
import './conf';
import appPath from './conf/path'
import express from 'express';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';
import figlet from 'figlet';
import api from './api';
import scheduleManager from './core/schedule';

/* =========================================
 Express Configuration
 ============================================*/
const app = express();
const port = process.env.PORT || 3000;

// parse JSON and url-encoded query
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// access log setting
const accessLogStream = fs.createWriteStream(path.join(appPath.LOG_PATH, 'access.log'), { flags: 'a' });
app.use(morgan('combined', { stream: accessLogStream }));
app.use(morgan('dev'));

// open the server
app.listen(port, () => {
    figlet('Ahribori Bot', (err, logo) => {
        // console.log(logo);
        console.log(`Listening on port ${port}...`);
    })
});

// set api router
app.use('/', api);

// set public path
app.use('/', express.static(path.join(__dirname, './../public')));

/* handle error */
app.use(function (err, req, res, next) {
    res.status(err.status || 500).send('Something broke!');
});

/* =========================================
 Mongoose Configuration
 ============================================*/
const MONGO_URI = process.env.MONGO_URI;
mongoose.connect(MONGO_URI, { useMongoClient: true });
const db = mongoose.connection;
mongoose.Promise = global.Promise;
db.on('error', console.error);
db.once('open', () => {
    console.log('connected to mongodb server =>', MONGO_URI);
    new scheduleManager();
});

