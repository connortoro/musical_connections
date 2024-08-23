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
  const [month, day, year] = req.query.date.split('/').map(Number);
  const date = Date.UTC(year, month - 1, day)

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
  const [month, day, year] = req.query.date.split('/').map(Number)

  const start = Date.UTC(year, month - 1 , 1)
  const end = Date.UTC(year, month , 0)

  const attempts = await attemptTable.find({
    user: user,
  })

  let wins = []
  let fails = []

  for(const attempt of attempts) {
    let puzzle = await puzzleTable.findById(attempt.puzzle)
    let date = new Date(puzzle.date)

    if(date >= start && date <= end) {
      if(attempt.status === 'win') {
        
        wins.push(date.getUTCDate())
      } else if(attempt.status === 'fail') {
        fails.push(date.getUTCDate())
      }
    }
  }
  res.status(200).json({wins: wins, fails: fails})
})

db_connect()

// const newGrid = {
//   grid: [
//     [{"text": "Shape of You", "key": 1}, {"text": "Uptown Funk", "key": 2}, {"text": "Bad Guy", "key": 3}, {"text": "Shake It Off", "key": 4}],
//     [{"text": "Perfect", "key": 1}, {"text": "Just the Way You Are", "key": 2}, {"text": "Ocean Eyes", "key": 3}, {"text": "Blank Space", "key": 4}],
//     [{"text": "Thinking Out Loud", "key": 1}, {"text": "Grenade", "key": 2}, {"text": "Everything I Wanted", "key": 3}, {"text": "Love Story", "key": 4}],
//     [{"text": "I See Fire", "key": 1}, {"text": "Locked Out of Heaven", "key": 2}, {"text": "Birds of a Feather", "key": 3}, {"text": "You Belong with Me", "key": 4}]
//   ],
//   key: {
//     "1": "Ed Sheeran",
//     "2": "Bruno Mars",
//     "3": "Billie Eilish",
//     "4": "Taylor Swift"
//   },
//   date: new Date(2024, 7, 22, 17, 0, 0, 0)
// };

// const newPuzzle = new puzzleTable(newGrid)
// newPuzzle.save()

app.listen(port, async () => {
  console.log(`Server running on http://localhost:${port}`);
});
