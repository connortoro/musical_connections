const express = require('express');
const app = express();
const port = process.env.PORT || 3500;
const cors = require('cors');
require('dotenv').config();
app.use(express.json());
app.use(cors());
const mongoose = require('mongoose')
const puzzleTable = require('./models/puzzle')
const attemptTable = require('./models/attempt')

const MONGO_DB_URL = `mongodb+srv://${process.env.MONGO_DB_USER}:${process.env.MONGO_DB_PWD}@cluster0.8e9h1.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`

const db_connect = async () => {
  try {
    await mongoose.connect(MONGO_DB_URL)
    console.log('Connected to mongodb...')
  } catch(err) {
    console.error(err.message)
  }
}

app.get('/puzzle', async (req, res) => {
  const reqDate = req.query.date;
  const date = reqDate ? new Date(reqDate) : new Date();

  const start = new Date(date)
  const end = new Date(start)
  start.setHours(0, 0, 0, 0)
  end.setHours(23, 59, 59, 999)

  const puzzle = await puzzleTable.findOne({
    date: { $gte: start, $lte: end }
  }).lean();
  if(!puzzle) {
    res.status(404).send("no puzzle found papi")
    console.log("puzzle not found")
  } else {
    res.status(200).json(puzzle)
  }
  
});

app.get('/attempt', async (req, res) => {
  const { user, puzzle } = req.query;
  console.log(user)
  console.log(puzzle)
  const attempt = await attemptTable.findOne({
    user: user,
    puzzle: puzzle
  })
  if(!attempt) {
    res.status(200).json({status: 'none'})
  } else {
    res.status(200).json({status: attempt.status})
  }
})

app.post('/attempt', async (req, res) => {
  const { user, puzzle, status } = req.body;
  const newAttempt = new attemptTable({
    user: user,
    puzzle: puzzle,
    status: status
  })
  await newAttempt.save()
  res.status(201).json({status: "success"})
})

db_connect()

// const grid = {
//     grid: [
//       [{"text": "Love Story", "key": 1}, {"text": "Espresso", "key": 2}, {"text": "Bags", "key": 3}, {"text": "360", "key": 4}],
//       [{"text": "Anti-Hero", "key": 1}, {"text": "Please Please Please", "key": 2}, {"text": "4EVER", "key": 3}, {"text": "Good Ones", "key": 4}],
//       [{"text": "Shake It Offf", "key": 1}, {"text": "Nonsense", "key": 2}, {"text": "Flaming Hot Cheetos", "key": 3}, {"text": "1999", "key": 4}],
//       [{"text": "You Belong With Me", "key": 1}, {"text": "Feather", "key": 2}, {"text": "Sofia", "key": 3}, {"text": "Apple", "key": 4}]
//     ],
//     key: {
//       "1": "Taylor Swift",
//       "2": "Sabrina Carpenter",
//       "3": "Clairo",
//       "4": "Charli XCX"
//     },
//     date: new Date(2024, 7, 20, 12, 0, 0, 0)
// }

// const newPuzzle = new puzzleTable(grid)
// newPuzzle.save()

app.listen(port, async () => {
  console.log(`Server running on http://localhost:${port}`);
});
