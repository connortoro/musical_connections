import '../App.css';
import { useState, useEffect } from 'react';
import CorrectGroup from './correct-group';
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

  let { date } = useParams();
  const puzzleDate = date ? new Date(date) : new Date(2024, 7, 19)

  const { user, isLoaded, isSignedIn } = useUser();
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      setUserId(user.id);
    }
  }, [isLoaded, isSignedIn]);

  const check = () => {
    if(choices.length !== 4 || guessesLeft.length === 0) {
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
      }, 1000);
    } else {
      shake()
      if(guessesLeft.length === 2){
        let audio = new Audio('/audio/wah-wah-sad-trombone-6347.mp3');
        audio.play();
        setTimeout(() => {
          setCorrectGroups([])
          setMessage("")
          setGrid([])
        }, 1000)
      } else if(isOneAway()){
        setMessage("One Away...");
      } else {
        setMessage("Incorrect :(")
      }
      setGuessesLeft((guessesLeft) => guessesLeft.slice(0, -2));
    }
  }

  const win = async () => {
    if(userId) {
      console.log('puzzleid: ', puzzleId)
      const response = await axios.post('http://localhost:3500/attempt', {
        user: userId,
        puzzle: puzzleId,
        status: 'win'
      })
    }
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
    console.log("fillingingingingin");
    // let tempGroups = [];
    // for (let i = 1; i < 5; i++) {
    //   let group = grid.flat().filter((cell) => cell.key === i);
    //   if (group.length === 4) {
    //     tempGroups.push(group);
    //   }
    // }
    // setCorrectGroups((prevCorrectGroups) => [...prevCorrectGroups, ...tempGroups]);
    // setGrid([]);
  }

  useEffect(() => {
    if(userId !== null) {
      axios.get(`http://localhost:3500/puzzle/`, { params: { date: puzzleDate }}).then(puzzleResponse => {
        setPuzzleId(puzzleResponse.data._id)
        axios.get('http://localhost:3500/attempt/', { params: { user: userId, puzzle: puzzleResponse.data._id }}).then(attemptResponse => {
          setKeyMap(puzzleResponse.data.key)
          console.log(attemptResponse.data.status)
          if (attemptResponse.data.status === 'win') {
            fillCorrect()
            setMessage("You've Won!")
          } else if (attemptResponse.data.status === 'fail') {
            fillCorrect()
            setGuessesLeft('')
          } else {
            console.log('elsing!')
            setGrid(shuffleGrid(puzzleResponse.data.grid))
          }
        })
      })
      .catch(error => {
        console.error('Error:', error);
      });
    }
      
  }, [userId, date]);

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

  return (
    <div>
      <div className='container'>
        <div className='game'>
          <h3 className='message'>{message}</h3>
          {correctGroups.map((group) => {
            return <CorrectGroup choices={[...group]} groupKey={keyMap[group[0].key]} key={group[0].key}/>
          })}
          {grid.length === 0 && guessesLeft.length === 0 && <h1 className='failure-message'>YOU FAILED :(</h1>}
          {grid.map((row, rowIdx) => {
            return <div key={rowIdx} className='row'>
              {row.map((cell, colIdx) => {
                return <button 
                          className={cellClassName(cell.text) + ' ' + selectedClass(cell.text)} 
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
              <button onClick={check} className='check-button'>Check</button>
            </div>
            <span className='guesses-left'>{guessesLeft}</span>
          </div>
        </div>  
      </div>
    </div>
  );
}
export default Game;