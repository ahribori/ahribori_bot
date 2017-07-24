import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const Result = new Schema({
    agent: { type: Schema.Types.ObjectId, ref: 'Agent' },
    transaction: { type: Schema.Types.ObjectId, ref: 'Transaction' },
    schedule: { type: Schema.Types.ObjectId, ref: 'Schedule' },
    browser: { type: String },
    success: { type: Boolean },
    results: { type: Schema.Types.Mixed },
    error: {},
    date: { type: Date, default: Date.now },
});

export default mongoose.model('Result', Result);