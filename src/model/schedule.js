import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const Schedule = new Schema({
    agent: { type: Schema.Types.ObjectId, ref: 'Agent' },
    transaction: { type: Schema.Types.ObjectId, ref: 'Transaction' },
    browser: { type: String, default: 'chrome' },
    type: { type: String, default: 'now' }, // now, date, cron
    repeat: { type: Number, default: false },
    date: { type: Date, default: Date.now },
    cron: { type: String },
    interval: { type: Number, default: 0 },
    reg_date: { type: Date, default: Date.now },
    mod_date: { type: Date, default: Date.now }
});

export default mongoose.model('Schedule', Schedule);