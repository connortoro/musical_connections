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
  const date = new Date(reqDate)
  date.setHours(-7, 0, 0, 0)
  console.log(date)

  const puzzle = await puzzleTable.findOne({
    date: date
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

app.get('/attempts', async (req, res) => {
  const { user } = req.query;
  const attempts = await attemptTable.find({
    user: user,
  })

})

db_connect()

// const newGrid = {
//   grid: [
//     [{"text": "Stairway to Heaven", "key": 1}, {"text": "Wish You Were Here", "key": 2}, {"text": "Patience", "key": 3}, {"text": "Bohemian Rhapsody", "key": 4}],
//     [{"text": "Hotel California", "key": 1}, {"text": "Comfortably Numb", "key": 2}, {"text": "Paradise City", "key": 3}, {"text": "We Are the Champions", "key": 4}],
//     [{"text": "Whole Lotta Love", "key": 1}, {"text": "Another Brick in the Wall", "key": 2}, {"text": "Welcome to the Jungle", "key": 3}, {"text": "Under Pressure'", "key": 4}],
//     [{"text": "When the Levee Breaks", "key": 1}, {"text": "Money", "key": 2}, {"text": "Sweet Child O' Mine", "key": 3}, {"text": "Killer Queen", "key": 4}]
//   ],
//   key: {
//     "1": "Led Zeppelin",
//     "2": "Pink Floyd",
//     "4": "Guns N' Roses",
//     "3": "Queen"
//   },
//   date: new Date(2024, 7, 20, 17, 0, 0, 0)
// };

// const newPuzzle = new puzzleTable(newGrid)
// newPuzzle.save()

app.listen(port, async () => {
  console.log(`Server running on http://localhost:${port}`);
});
