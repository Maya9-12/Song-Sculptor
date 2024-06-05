import * as React from 'react';
import { useState, useEffect } from 'react';
import './App.css';
import logo from './logo.png';
import { Radio, RadioGroup, FormControl, FormControlLabel, FormLabel, Container, CardHeader, CardContent, Box,
  TextField, Button, Card, CardMedia, Typography, ImageList, ImageListItem, ImageListItemBar, List,
  ListItem, ListItemText} from '@mui/material';

//Spotify API info
const clientId = process.env.REACT_APP_SPOTIFY_CLIENT_ID;
const secret = process.env.REACT_APP_SPOTIFY_CLIENT_SECRET;

function App() {

  //State variables and setter functions
  const [songs, setSongs] = useState([]);
  const [artist, setArtist] = useState("");
  const [albums, setAlbums] = useState([]);
  const [searchBy, setSearchBy] = useState("");
  const [selectedSearchBy, setSelectedSearchBy] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [userInput, setUserInput] = useState("");
  const [albumTracks, setAlbumTracks] = useState([]);
  const [expandedAlbums, setExpandedAlbums] = useState({});

  //Function to get the access token using Spotify API
  useEffect(() => {
    const getAccessToken = async () => {
      //Try to fetch the access token
      try{
        const params = {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: 'grant_type=client_credentials&client_id=' + clientId + '&client_secret=' + secret
        };

        const result = await fetch('https://accounts.spotify.com/api/token', params);

        if(!result.ok) {
          throw new Error('Unsuccessful retrieval of access token');
        }

        const tokenData = await result.json();
        setAccessToken(tokenData.access_token);
      }
      //Catch and display error
      catch (error) {
        console.error('Error retreiving access token: ', error.message);
        alert('Error retrieving access token.');
      }
      };
      getAccessToken();
  }, []);

  //Function to search for song info 
  async function search() {
    try {

    setSearchBy(selectedSearchBy);

    const searchParams = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + accessToken
      }
    }
    //Search by artists
    if(selectedSearchBy === 'artist'){
      //Get artist unique Spotfiy ID
      const searchArtist = await fetch('https://api.spotify.com/v1/search?q=' + userInput + '&type=artist', searchParams);
      if(!searchArtist.ok){
        throw new Error('Failed to retreive artist ID');
      }
      const getArtistId = await searchArtist.json();
      const artistId = getArtistId.artists.items[0].id;

      //Get artist info
      const getArtistInfo = await fetch('https://api.spotify.com/v1/artists/' + artistId, searchParams);
      if(!getArtistInfo.ok){
        throw new Error('Failed to retrieve artist info');
      }
      const artistInfo = await getArtistInfo.json();
      setArtist(artistInfo);

      //Get albums using the artists Spotify ID
      const getAlbums = await fetch('https://api.spotify.com/v1/artists/' + artistId + '/albums?include_groups=album&market=US&limit=30', searchParams);
      if(!getAlbums.ok) {
        throw new Error('Failed to retrieve artists albums');
      }
      const albumsInfo = await getAlbums.json();
      setAlbums(albumsInfo.items);
    }
    //Search by song
    else if (selectedSearchBy === 'song'){
      //Get song
      const getSong = await fetch('https://api.spotify.com/v1/search?q=' + userInput + '&type=track', searchParams);
      if(!getSong.ok) {
        throw new Error('Failed to retrieve song');
      }
      const songInfo = await getSong.json();
      setSongs(songInfo.tracks.items.map(track => ({
        ...track,
        duration_ms: track.duration_ms //Includes durations in milliseconds
      })));
    }
  } catch (error) {
    alert('An error occured during your search', error.message);
  }
  }
  
  
  //Allows for search to be triggered continuously
  useEffect(() => {
    if(searchBy) {
      search();
    }
   }, [searchBy]);  
  
  //Validate user input by sanitizing and limiting input length
  const validateInput = (input) => {
    const maxLength = 100;
    const sanitizedInput = input.replace(/[<>`"'&]/g, '');
    if(sanitizedInput.length > maxLength) {
      return sanitizedInput.substring(0, maxLength);
    }
    return sanitizedInput;
  }

   //Handles the validated input
   const handleSearchClick = () => {
    const validatedInput = validateInput(userInput);
    if(validatedInput.trim() === '') {
      alert('Please enter a valid search query.');
      return;
    }
    setUserInput(validatedInput);
    search();
   }

   //Handles clicks to an ablum to reveal all the songs on album
   const handleAlbumClick = async (albumId) => {
    //setSelectedAlbum(albumId);
    setExpandedAlbums(prevState => {
      //Reset albums to not expanded
      const newExpandedState = {};
      //Toggle the clicked album
      for (const key in prevState){
        newExpandedState[key] = false;
      }
      newExpandedState[albumId] = !prevState[albumId];
      return newExpandedState;
    });
    if (!expandedAlbums[albumId]) {
      try {
        const searchParams = {
          method: 'GET',
          headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + accessToken
        }}
        const getTracks = await fetch('https://api.spotify.com/v1/albums/' + albumId + '/tracks', searchParams);
        if(!getTracks.ok) {
          throw new Error('Failed to retrieve song');
        }
        const trackInfo = await getTracks.json();
        setAlbumTracks(trackInfo.items);
      }
      catch (error) {
        console.error('An error occured fetching tracks', error.message);
        alert('An error occured fetching tracks', error.message);
      }
    }
  }; 

  //-------------FrontEnd---------------
  return (
    <div className='App'>
      <header className='App-header'>
        <h1>Song Sculptor</h1>
        <img src={logo} className='App-logo' alt='logo'/>
        <Container>
        <FormControl>
          <FormLabel id='row-radio-buttons'>Search By...</FormLabel>
          <RadioGroup row aria-labelledby='row-radio-buttons' className='buttons' required>
            <FormControlLabel value='artist' control={<Radio />} label='Artist' onChange={() => setSelectedSearchBy('artist')}/>
            <FormControlLabel value='song' control={<Radio />} label='Song' onChange={() => setSelectedSearchBy('song')}/>
          </RadioGroup>
        </FormControl>
        <TextField id='outlined-basic' variant='outlined' fullWidth label='Enter a song or artist...' value={userInput} onChange={ev => setUserInput(ev.target.value)} required/>
        <Button variant='contained' className='primary' onClick={handleSearchClick}>Search</Button>
        </Container>

        {/*Display data when user searches by artist*/}
        {searchBy === 'artist' && artist && (
          <Container>
            <div style={{marginLeft: '35%', marginTop: '5%'}}>
                <Card sx={{ maxWidth: 350}}>
                <CardHeader className= 'primary' title={artist.name}/>
                  <CardMedia  
                    sx={{ height: 300, justifyConten: 'center', display: 'flex' }}
                    image={artist.images[0].url}
                    title={artist.name}/>
                  <CardContent>                  
                    <Typography className='secondary'>
                      Popularity: {artist.popularity}
                      <br/>
                      Spotfiy Followers: {artist.followers.total}
                    </Typography>
                  </CardContent>                 
                </Card>
              </div>
            <Box className='secondary' sx={{ display: 'inline', overflowY: 'scroll'}}>
              <ImageList variant='masonry' cols={5} gap={15}>
                {albums.map( (album) => {
                  const isExpanded = expandedAlbums[album.id];
                  return(
                    <Box sx={{border: 3}}>
                    <ImageListItem key={album.id} onClick={() => handleAlbumClick(album.id)} style={{cursor: 'pointer'}}>
                      <img
                        src={album.images[0].url}
                        alt={album.Name}
                        loading='lazy' />
                          <Typography variant='h5' color='blue'>{album.name}</Typography>              
                            <Typography>
                            Total tracks in album: {album.total_tracks}
                            <br/>
                            Released: {album.release_date}
                            </Typography>  
                          <ImageListItemBar position='below' title={album.Name} />
                          {isExpanded && (
                            <List>
                              <h5 className='primary'>Tracks:</h5>             
                              {albumTracks.map( (track) => (             
                                <ListItem key={track.name}>
                                  <ListItemText primary={`${track.track_number}. ${track.name}`}/>                                   
                                </ListItem>
                              ))}
                            </List>
                          )}                          
                    </ImageListItem>
                    </Box>
                  )
                })}
              </ImageList>
            </Box>
          </Container>
        )}

        {/*Display data when user searches by song*/}
        {searchBy === 'song' && (
          <Container>
            <h3 className='primary'>Top search results</h3>
              <Box sx={{ width: '100%', height: '100%', overflowY: 'scroll'}}>
              <ImageList variant='masonry' cols={5} gap={15}>
                {songs.map( (song) => {
                  return(
                    <ImageListItem className='secondary' sx={{border:3}} key={song.img}>
                      <img
                        src={song.album.images[0].url}
                        alt={song.name}
                        loading='lazy' />
                          <Typography variant='h5' color='blue'>{song.name}</Typography>              
                            <Typography>
                            Artist: {song.artists[0].name}
                            <br/>
                            Released: {song.album.release_date}
                            <br/>
                            Duration(mm:ss): {new Date(song.duration_ms).toISOString().substr(14,5)}
                            </Typography>
                    </ImageListItem>
                  )
                })}
              </ImageList>
            </Box>
          </Container>
        )}
      </header>
    </div>
  );
}

export default App;
