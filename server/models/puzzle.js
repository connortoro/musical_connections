const mongoose = require('mongoose');

const puzzleItemSchema = new mongoose.Schema({
  text: { type : String, required: true },
  key: { type: Number, required: true }
})

const puzzleSchema = new mongoose.Schema({
  grid: { type: [[puzzleItemSchema]], required: true },
  key: { type: Map, of: String, required: true },
  date: { type: Date, required: true }
})

const puzzle = mongoose.model('puzzle', puzzleSchema);
module.exports = puzzle;