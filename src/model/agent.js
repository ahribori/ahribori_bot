import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const Agent = new Schema({
    name: { type: String },
    protocol: { type: String, default: 'http' },
    host: { type: String, default: '127.0.0.1' },
    port: { type: Number, default: 4444 },
    max_session: { type: Number, default: 1 },
    reg_date: { type: Date, default: Date.now },
    mod_date: { type: Date, default: Date.now }
});

export default mongoose.model('Agent', Agent);