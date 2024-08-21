import { ClerkProvider, SignedIn, SignedOut, SignInButton, UserButton, SignIn } from '@clerk/clerk-react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import Game from './components/game';
import { dark } from '@clerk/themes'
import Navbar from './components/navbar';
import Archive from './components/archive';

function App() {
  const PUBLISHABLE_KEY = process.env.REACT_APP_CLERK_PUBLISHABLE_KEY;
  return (
    <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/" appearance={{baseTheme: dark}}>
      <Router>
        <Navbar/>
        <Routes>
          <Route path="/" element={<Game/>} />
          <Route path="/puzzle/:date" element={<Game/>} />
          <Route path="/archive" element={<Archive/>} />
        </Routes>
      </Router>
    </ClerkProvider>
  )
}
export default App;
