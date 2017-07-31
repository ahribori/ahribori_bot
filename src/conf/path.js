require('dotenv').config();
import path from 'path';
import fs from 'fs';

const ROOT_PATH = path.resolve(__dirname, '../../');
let LOG_PATH = process.env.LOG_PATH ? path.resolve(process.env.LOG_PATH) : ROOT_PATH;
let SCREENSHOT_PATH = process.env.SCREENSHOT_PATH ? path.resolve(process.env.SCREENSHOT_PATH) : path.resolve(ROOT_PATH, 'screenshots');
let DOWNLOAD_PATH = process.env.DOWNLOAD_PATH ? path.resolve(process.env.DOWNLOAD_PATH) : path.resolve(ROOT_PATH, 'downloads');

try {
    if (!fs.existsSync(LOG_PATH)) {
        fs.mkdirSync(LOG_PATH);
    }
} catch (e) {
    LOG_PATH = ROOT_PATH;
    if (!fs.existsSync(LOG_PATH)) {
        fs.mkdirSync(LOG_PATH);
    }
    console.log(`process.env.LOG_PATH is invalid. Set LOG_PATH to ${LOG_PATH}`);
}

try {
    if (!fs.existsSync(SCREENSHOT_PATH)) {
        fs.mkdirSync(SCREENSHOT_PATH);
    }
} catch (e) {
    SCREENSHOT_PATH = path.resolve(ROOT_PATH, 'screenshots');
    if (!fs.existsSync(SCREENSHOT_PATH)) {
        fs.mkdirSync(SCREENSHOT_PATH);
    }
    console.log(`process.env.SCREENSHOT_PATH is invalid. Set SCREENSHOT_PATH to ${SCREENSHOT_PATH}`);
}

try {
    if (!fs.existsSync(DOWNLOAD_PATH)) {
        fs.mkdirSync(DOWNLOAD_PATH);
    }
} catch (e) {
    DOWNLOAD_PATH = path.resolve(ROOT_PATH, 'downloads');
    if (!fs.existsSync(DOWNLOAD_PATH)) {
        fs.mkdirSync(DOWNLOAD_PATH);
    }
    console.log(`process.env.DOWNLOAD_PATH is invalid. Set DOWNLOAD_PATH to ${DOWNLOAD_PATH}`);
}

export default {
    LOG_PATH,
    SCREENSHOT_PATH,
    DOWNLOAD_PATH
}