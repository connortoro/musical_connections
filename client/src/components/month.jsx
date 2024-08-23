
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios'
import './archive.css';

function Month({ month, user }) {

  const START_DATE = new Date(2024, 7, 18);
  const TODAYS_DATE = new Date();

  useEffect(() => {
    const controller = new AbortController()
    axios.get(`http://localhost:3500/attempts/`, { params: { date: month.toLocaleDateString(), user: user }, signal: controller.signal})
    .then(response => {
      setWins(response.data.wins)
      setFails(response.data.fails)
    })
    .catch(error => console.error('Error:', error));
    return () => controller.abort()
  }, [month, user])

  const getDayOffset = (date) => {
    let new_offset = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    return Array(new_offset).fill().map((_, i) => i + 1);
  }

  const getDays = (date) => {
    let days_in_month = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
    let arr = Array(days_in_month).fill().map((_, i) => i + 1);
    for(const winDay of wins) {
      arr[winDay] = '✓'
    }
    for(const failDay of fails) {
      arr[failDay] = '✗'
    }
    return arr
  }

  const isValid = (day) => {
    let date = new Date(month.getFullYear(), month.getMonth(), day)
    return (date >= START_DATE && date <= TODAYS_DATE)
  }

  const getDay = (day) => {
    return new Date(month.getFullYear(), month.getMonth(), day).toISOString()
  }

  const dayClass = (day) => {
    if(wins.includes(day)) {
      return 'win-day'
    } else if(fails.includes(day)) {
      return 'fail-day'
    } else {
      return 'valid-day'
    }
  }

   const dayText = (day) => {
    if(wins.includes(day)) {
      return '✓'
    } else if(fails.includes(day)) {
      return '✗'
    } else {
      return day
    }
   }

  const DAY_LABELS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const [offset, setOffset] = useState(getDayOffset(month));
  const [wins, setWins] = useState([])
  const [fails, setFails] = useState([])
  const [days, setDays] = useState(getDays(month));

  useEffect(() => {
    setOffset(getDayOffset(month));
  }, [month]);

  return (
    <div className='month'>
      <div className='calendar-grid'>
        {DAY_LABELS.map((day) => {
          return <button className='day-label' key={day}>{day}</button>
        })}
        {offset.map((_, idx) => {
          return <button className='calendar-blank' key={idx}></button>
        })}
        {days.map((day) => {
          if(isValid(day)) {
            return <Link to={`/puzzle/${getDay(day)}`} className={dayClass(day)} key={day}>{dayText(day)}</Link>
          } else {
            return <button className='invalid-day' key={day}>{day}</button>
          }
          
        })}
        
      </div>
    </div>
  )
}
export default Month;
