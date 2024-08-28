const express = require('express');
const app = express();
const port = process.env.PORT || 3500;
require('dotenv').config();
const mongoose = require('mongoose')
const puzzleTable = require('./models/puzzle')
const attemptTable = require('./models/attempt')

const MONGO_DB_URL = `mongodb+srv://${process.env.MONGO_DB_USER}:${process.env.MONGO_DB_PWD}@cluster0.8e9h1.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`


const corsOptions = {
  origin: true, //process.env.CLIENT_URL , 
  methods: 'GET,POST,PUT,DELETE',
  credentials: true, 
  allowedHeaders: '*', 
};
const cors = require('cors');
app.use(cors(corsOptions));
app.use(express.json());


const db_connect = async () => {
  try {
    await mongoose.connect(MONGO_DB_URL)
    console.log('Connected to mongodb...')
  } catch(err) {
    console.error(err.message)
  }
}

app.get("/", (req, res) => res.send("Express on Vercel"));

app.get('/puzzle', async (req, res) => {
  const [month, day, year] = req.query.date.split('/').map(Number);
  const date = Date.UTC(year, month - 1, day)

  const puzzle = await puzzleTable.findOne({
    date: date
  }).lean();

  if(!puzzle) {
    res.status(200).json({grid: [], key: {}, puzzleId: ''})
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
//     [{"text": "Lose Yourself", "key": 1}, {"text": "Juicy", "key": 2}, {"text": "In Da Club", "key": 3}, {"text": "Alright", "key": 4}],
//     [{"text": "The Real Slim Shady", "key": 1}, {"text": "Big Poppa", "key": 2}, {"text": "21 Questions", "key": 3}, {"text": "Swimming Pools", "key": 4}],
//     [{"text": "Stan", "key": 1}, {"text": "Hypnotize", "key": 2}, {"text": "P.I.M.P.", "key": 3}, {"text": "HUMBLE.", "key": 4}],
//     [{"text": "Without Me", "key": 1}, {"text": "Mo Money Mo Problems", "key": 2}, {"text": "Candy Shop", "key": 3}, {"text": "DNA.", "key": 4}]
//   ],
//   key: {
//     "1": "Eminem",
//     "2": "The Notorious B.I.G.",
//     "3": "50 Cent",
//     "4": "Kendrick Lamar"
//   },
//   date: new Date(2024, 7, 27, 17, 0, 0, 0)
// };

// const newPuzzle = new puzzleTable(newGrid)
// newPuzzle.save()


app.listen(port, async () => {
  console.log(`Server running on http://localhost:${port}`);
});

module.exports = app;
