import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const Transaction = new Schema({
	name: { type: String },
	actions: [{ type: Object }],
	reg_date: { type: Date, default: Date.now },
	mod_date: {type: Date, default: Date.now}
});

export default mongoose.model('Transaction', Transaction);