const mongoose = require('mongoose');
const { Schema } = mongoose;

const attemptSchema = new mongoose.Schema({
  user: { type: String, required: true },
  puzzle: { type: Schema.Types.ObjectId, ref: 'puzzle', required: true },
  status: { type: String, required: true }
})

const attempt = mongoose.model('attempt', attemptSchema);
module.exports = attempt;