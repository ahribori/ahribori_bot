import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const Schedule = new Schema({
	agent: { type: Schema.Types.ObjectId, ref: 'Agent' },
	transaction: { type: Schema.Types.ObjectId, ref: 'Transaction' },
	schedule: { type: String },
	reg_date: { type: Date, default: Date.now },
	mod_date: {type: Date, default: Date.now}
});

export default mongoose.model('Schedule', Schedule);