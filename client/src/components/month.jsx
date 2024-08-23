
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './archive.css';

function Month({ month }) {

  const START_DATE = new Date(2024, 7, 15);
  const TODAYS_DATE = new Date();

  const getDayOffset = (date) => {
    let new_offset = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    console.log(new_offset)
    return Array(new_offset).fill().map((_, i) => i + 1);
  }

  const getDays = (date) => {
    let days_in_month = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
    return Array(days_in_month).fill().map((_, i) => i + 1);
  }

  const isValid = (day) => {
    let date = new Date(month.getFullYear(), month.getMonth(), day)
    return (date >= START_DATE && date <= TODAYS_DATE)
  }

  const getDay = (day) => {
    return new Date(month.getFullYear(), month.getMonth(), day).toISOString()
  }

  const DAY_LABELS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const [offset, setOffset] = useState(getDayOffset(month));
  const [days, setDays] = useState(getDays(month));

  useEffect(() => {
    setOffset(getDayOffset(month));
    setDays(getDays(month));
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
            return <Link to={`/puzzle/${getDay(day)}`} className={'valid-day'} key={day}>{day}</Link>
          } else {
            return <button className='invalid-day' key={day}>{day}</button>
          }
          
        })}
        
      </div>
    </div>
  )
}
export default Month;
