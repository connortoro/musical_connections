import { SignedIn, SignedOut} from '@clerk/clerk-react'
import { useState, useEffect } from 'react';
import Month from './month';
import './archive.css';
import { useUser } from '@clerk/clerk-react';

function Archive() {

  const START_DATE = new Date(2024, 7, 15);
  const TODAYS_DATE = new Date();

  const [month, setMonth] = useState(TODAYS_DATE);
  const [userId, setUserId] = useState();
  const { user, isLoaded, isSignedIn } = useUser();
  useEffect(() => {
    if (isLoaded && isSignedIn && !userId) {
      setUserId(user.id);
    }
  }, [isLoaded, isSignedIn, user?.id]);

  const monthBack = () => {
    let newDate = new Date(month.getFullYear(), month.getMonth() - 1, 25)
    if(newDate.getTime() < START_DATE.getTime()) {
      return;
    } else {
      setMonth(newDate);
    }
  }

  const monthForward = () => {
    let newDate = new Date(month.getFullYear(), month.getMonth() + 1, 1)
    if(newDate.getTime() > TODAYS_DATE.getTime()) {
      return;
    } else {
      setMonth(newDate);
    }
  }

  useEffect(() => {

  }, []);

  return (
    <div className='archive'>
      <SignedOut>
        <h1 className='sign-in-message shining-text'>{"Please sign in to view the archive :)"}</h1>
      </SignedOut>
      <SignedIn>
      <div className='archive-nav-buttons'>
          <button onClick={monthBack}>{'←'}</button>
          <h1 className='month-title'>{month.toLocaleString('en-US', {month: 'long'}) + ' ' + month.getFullYear()}</h1>
          <button onClick={monthForward}>{'→'}</button>
        </div>
        <div className='archive'>
          <Month month={month} user={userId}></Month>
        </div>
      </SignedIn>
    </div>
  )
}
export default Archive;
