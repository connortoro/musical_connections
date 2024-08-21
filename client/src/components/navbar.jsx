import { SignedIn, SignedOut, SignInButton, UserButton, SignIn } from '@clerk/clerk-react'
import { Link } from 'react-router-dom';
import './navbar.css';

function Navbar() {
  return (
    <nav className='navbar'>
      <Link to="/" className='home-button'><h1 className='title'>Musical Connections&nbsp;&nbsp;&nbsp;🎵</h1></Link>
      <div className='nav-right'>
        <Link to='/archive'className='archive-button'>Archive</Link>
        <SignedIn>
          <UserButton className="user-button"/>
        </SignedIn>
        <SignedOut>
          <SignInButton className="sign-in"/>
        </SignedOut>
      </div>
    </nav>
  )
}
export default Navbar;
