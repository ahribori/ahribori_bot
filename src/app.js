/* =========================================
 Load dependencies
 ============================================*/
import './conf';
import express from 'express';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';

/* =========================================
 Express Configuration
 ============================================*/
const app = express();
const port = process.env.PORT || 3000;

// parse JSON and url-encoded query
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// access log setting
const accessLogStream = fs.createWriteStream(path.join(process.cwd(), 'access.log'), {flags: 'a'});
app.use(morgan('combined', {stream: accessLogStream}));
app.use(morgan('dev'));

// open the server
app.listen(port, () => {
    console.log(`Express is running on port => ${port}`)
});

// set public path
app.use('/', express.static(path.join(__dirname, './../public')));

/* handle error */
app.use(function (err, req, res, next) {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

/* =========================================
 Mongoose Configuration
 ============================================*/
const MONGO_URI = process.env.MONGO_URI;
mongoose.connect(MONGO_URI, { useMongoClient: true });
const db = mongoose.connection;
mongoose.Promise = global.Promise;
db.on('error', console.error);
db.once('open', ()=> {
    console.log('connected to mongodb server =>', MONGO_URI);
});

