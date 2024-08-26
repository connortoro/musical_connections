const axios = require('axios');
const qs = require('qs');
require('dotenv').config();
app.use(express.json());
app.use(cors());

let spotify_access_token;

const setupSpotify = async () => {
  try {
    const response = await axios.post('https://accounts.spotify.com/api/token', qs.stringify({
      grant_type: 'client_credentials'
    }), {
      headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString('base64')}`
      }
    });
    spotify_access_token = response.data.access_token
    console.log('Access Token:', spotify_access_token);
  } catch (error) {
    console.error('Error fetching token:', error);
    }
}

const getTopArtists = async () => {
  try {
    const response = await axios.get("https://api.spotify.com/v1/artists/4Z8W4fKeB5YxbusRsdQVPb/top-tracks", 
    {
      headers: {
        'Authorization': `Bearer ${spotify_access_token}`
      }
    }
  )
  let topSongs = response.data.tracks.map(obj => obj.name)
  console.log(topSongs)

  } catch(error) {
    console.log(error)
  }
}


const seedGrid = {
  "id": 1,
  "grid": [
      [{"text": "Let It Be", "key": 1}, {"text": "Ride The Lightning", "key": 2}, {"text": "Hey Joe", "key": 3}, {"text": "Wind Cries Mary", "key": 3}],
      [{"text": "Unknown Legend", "key": 4}, {"text": "One", "key": 2}, {"text": "My My, Hey Hey", "key": 4}, {"text": "Here Comes the Sun", "key": 1}],
      [{"text": "Castles Made of Sand", "key": 3}, {"text": "Yesterday", "key": 1}, {"text": "The Unforgiven", "key": 2}, {"text": "Harvest Moon", "key": 4}],
      [{"text": "Enter Sandman", "key": 2}, {"text": "Old Man", "key": 4}, {"text": "Bold as Love", "key": 3}, {"text": "Blackbird", "key": 1}]
    ],
  "key": {
      "1": "The Beatles",
      "2": "Metallica",
      "3": "Jimi Hendrix",
      "4": "Neil Young"
  }
}
