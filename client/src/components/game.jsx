import '../App.css';
import { useState, useEffect } from 'react';
import CorrectGroup from './correct-group';
import LoadingGrid from './loading-grid';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
const lodash = require('lodash')

function Game() {
  const [message, setMessage] = useState("")
  const [keyMap, setKeyMap] = useState({});
  const [grid, setGrid] = useState([])
  const [guessesLeft, setGuessesLeft] = useState('● ● ● ● ');
  const [choices, setChoices] = useState([])
  const [correctGroups, setCorrectGroups] = useState([]);
  const [shakingButtons, setShakingButtons] = useState([]);
  const [jumpingButtons, setJumpingButtons] = useState([])
  const [puzzleId, setPuzzleId] = useState()
  const [userId, setUserId] = useState();
  const [checkDisabled, setCheckDisabled] = useState(false)
  const [guesses, setGuesses] = useState([])
  const [isFading, setIsFading] = useState(true);

  let { date } = useParams();
  const[puzzleDate, setPuzzleDate] = useState(date ? new Date(date) : new Date())
  const DATABASE_URL = process.env.REACT_APP_API_URL

  const { user, isLoaded, isSignedIn } = useUser();
  useEffect(() => {
    if (isLoaded && isSignedIn && !userId) {
      setUserId(user.id);
    }
  }, [isLoaded, isSignedIn, user?.id]);

  const check = () => {
    if(choices.length !== 4 || guessesLeft.length === 0) {
      return;
    }
    setCheckDisabled(true)
    if(guessed()) {
      setMessage('Already Guessed...')
      setCheckDisabled(false);
      return;
    }

    if(choices.every(choice => choice.key === choices[0].key)) {
      jump();
      setTimeout(() => {
        setCorrectGroups((correctGroups) => [...correctGroups, choices])
        if(grid.length === 1) {
          win()
          let audio = new Audio('/audio/success-1-6297.mp3');
          audio.play();
        }
        removeGroupFromGrid(choices[0].key)
        setChoices([]);
        setMessage("");
        setCheckDisabled(false)
      }, 1000);
    } else {
      shake()
      if(guessesLeft.length === 2){
        fail()
        setMessage("")
      } else if(isOneAway()){
        setMessage("One Away...");
      } else {
        setMessage("Incorrect :(")
      }
      setGuessesLeft((guessesLeft) => guessesLeft.slice(0, -2));
      setCheckDisabled(false)
    }
  }

  const guessed = () => {
    const sortedArr1 = choices.slice().sort();
    for(const guess of guesses) {
      if(sortedArr1.every((cell, i) => cell === guess[i])) {
        return true
      }
    }
    setGuesses((prevGuesses) => [...prevGuesses, sortedArr1])
    return false;
  }

  const win = async () => {
    if(userId) {
      console.log('puzzleid: ', puzzleId)
      await axios.post(`${DATABASE_URL}attempt`, {
        user: userId,
        puzzle: puzzleId,
        status: 'win'
      })
    }
  }

  const fail = async () => {
    if(userId) {
      console.log('puzzleid: ', puzzleId)
      await axios.post(`${DATABASE_URL}attempt`, {
        user: userId,
        puzzle: puzzleId,
        status: 'fail'
      })
    }
    fillCorrect()
  }

  const shake = () => {
    setShakingButtons([...choices])
    setTimeout(() => {
      setShakingButtons([])
    }, 1000)

  }

  const jump = () => {
    setJumpingButtons([...choices])
    setTimeout(() => {
      setJumpingButtons([]);
    }, 500);
  }

  const isOneAway = () => {
    let group1 = choices.filter(choice => choice.key === choices[0].key)
    let group2 = choices.filter(choice => choice.key === choices[1].key)
    return (group1.length === 3 || group2.length === 3)
  }

  const shuffleGrid = (board) => {
    let tempGrid = [];
    for(let i = 0; i < board.length; i++) {
      tempGrid.push(lodash.shuffle(board[i]));
    }
    tempGrid = lodash.shuffle(tempGrid);
    let tempGrid2 = []
    for(let i = 0; i < tempGrid.length; i++) {
      tempGrid2.push(lodash.shuffle(tempGrid[i]));
    }
    return lodash.shuffle(tempGrid2);
  }

  const shuffleCurrentGrid = () => {
    setGrid((grid) => shuffleGrid(grid))
    setChoices([])
  }

  const choose = (row, col) => {
    let text = grid[row][col].text
    if(choices.some(choice => choice.text === text)) {
      setChoices((choices) => choices.filter(choice => choice.text !== text))
    }  else if(choices.length < 4){
      setChoices((choices) => [...choices, grid[row][col]])
    }
  }

  const removeGroupFromGrid = (key) => {
    let newCells = grid.flat().filter(cell => cell.key !== key)
    let newGrid = []
    while(newCells.length > 0) {
      let subarr = []
      subarr.push(newCells.pop());
      subarr.push(newCells.pop());
      subarr.push(newCells.pop());
      subarr.push(newCells.pop());
      newGrid.push(subarr)
    }
    setGrid([...newGrid]);
  }

  const fillCorrect = () => {
    let tempGroups = [];
    for (let i = 1; i < 5; i++) {
      let group = grid.flat().filter((cell) => cell.key === i);
      if (group.length === 4) {
        tempGroups.push(group);
      }
    }
    setCorrectGroups((prevCorrectGroups) => [...prevCorrectGroups, ...tempGroups]);
    setGrid([]);
  }

  useEffect(() => {
    setPuzzleDate(date ? new Date(date) : new Date());
  }, [date]);

  useEffect(() => {
    
    console.log("Requesting: ", `${DATABASE_URL}puzzle`)
    const controller = new AbortController()
    axios.get(`${DATABASE_URL}puzzle`, { params: { date: puzzleDate.toLocaleDateString() }, signal: controller.signal})
    .then(puzzleResponse => {
      console.log("PUZZLE: ", puzzleResponse.data)
      setCorrectGroups([])
      setPuzzleId(puzzleResponse.data._id)
      setKeyMap(puzzleResponse.data.key)
      setGrid(shuffleGrid(puzzleResponse.data.grid))
      setTimeout(() => {
        setIsFading(false)
      }, 700);
      
    })
    .catch(error => console.error('Error:', error));
    return () => controller.abort()
  }, [puzzleDate]);

  useEffect(() => {
    const controller = new AbortController()
    if(userId && userId) {
      axios.get(`${DATABASE_URL}attempt`, { params: { user: userId, puzzle: puzzleId }, signal: controller.signal})
      .then(attemptResponse => {
        if (attemptResponse.data.status === 'win') {
          fillCorrect()
        } else if (attemptResponse.data.status === 'fail') {
          fillCorrect()
          setGuessesLeft('')
        } 
      })
      .catch(error => {
        console.error('Error:', error);
      });
    }
    return () => controller.abort()
  }, [puzzleId, userId]);

  const cellClassName = (text) => {
    
    if(shakingButtons.some(item => item.text === text)) {
      return 'shake'
    } else if(jumpingButtons[0]?.text === text) {
      return 'jump1'
    } else if(jumpingButtons[1]?.text === text) {
      return 'jump2'
    } else if(jumpingButtons[2]?.text === text) {
      return 'jump3'
    } else if(jumpingButtons[3]?.text === text) {
      return 'jump4'
    } else {
      return ''
    }
  }

  const selectedClass = (text) => {
    if(choices.some(choice => choice.text === text)) {
      return 'selected'
    }
    return ''
  }

  const fadeInClass = () => {
    if(isFading) {
      return 'fade-in'
    } else {
      return ''
    }
  }

  return (
    <div>
      <div className='container'>
        <div className='game'>
          {grid.length > 0 && <h3 className='message'>{message}</h3>}
          {grid.length === 0 && correctGroups.length > 0 && <h1 style={{color: guessesLeft.length === 0 ? '#E1453F' : '#A0C35A'}}className='result-message'>{guessesLeft.length === 0 ? "You've Failed 👺" : "You Won 🐸"}</h1>}
          {correctGroups.map((group) => {
            return <CorrectGroup choices={[...group]} groupKey={keyMap[group[0].key]} key={group[0].key}/>
          })}
          {grid.length === 0 && correctGroups.length === 0 && <LoadingGrid/>}
          {grid.map((row, rowIdx) => {
            return <div key={rowIdx} className='row'>
              {row.map((cell, colIdx) => {
                return <button 
                          className={cellClassName(cell.text) + ' ' + selectedClass(cell.text) + ' ' + fadeInClass()} 
                          key={colIdx} 
                          onClick={() => choose(rowIdx, colIdx)} 
                          >
                            {cell.text}
                       </button>
              })}
            </div>
          })}
          <div className='foot'>
            <div>
              <button onClick={shuffleCurrentGrid}>Shuffle</button>
              <button onClick={check} className='check-button' disabled={checkDisabled}>Check</button>
            </div>
            <span className='guesses-left'>{guessesLeft}</span>
          </div>
        </div>  
      </div>
    </div>
  );
}
export default Game;