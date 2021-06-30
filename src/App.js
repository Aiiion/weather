import logo from './logo.svg';
import './App.css';
import View from './View.js';
import React, { useState } from 'react';

const WEATHER_API_KEY = '7388dea722ff797c2e08d78452e08901';
const API_BASE_URL = `https://api.openweathermap.org/data/2.5/weather?`

const createApiUrl = ({lat, lng}) => {
  return `${API_BASE_URL}lat=${lat}&lon=${lng}&appid=${WEATHER_API_KEY}`
}

const getLatLng = () => {
  return new Promise ((resolve, reject) => {
    if(navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(position => resolve({
        lat: position.coords.latitude,
        lng: position.coords.longitude
      })
      )
    }else{
      reject('Cant find your location, try allowing geolocation services in your brower')
    }
  })
}
const testFunction = () => {
  try {
    getLatLng().then(({lat, lng}) => console.log('does it work?', lat && lng, {lat, lng}))
  } catch (error) {
    console.log('failure')
  }
 
}
  testFunction()

const toJSON = response => response.json()

// const getWeatherData= () =>{ 
//   getLatLng()
//   .then(createApiUrl)
//   .then(fetch)
//   .then(toJSON)
//   .then(setWeather);
// }

  

function App() {
  const [weather, setWeather] = useState({});
  const getWeatherData= () =>{ 
    getLatLng()
    .then(createApiUrl)
    .then(fetch)
    .then(toJSON)
    .then(data => setWeather(data));
  }
  console.log(weather)
  return (
    
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" height="200px" width="200px" />
      
      </header>
      <p>{weather.name}</p>
      <View getWeatherData={getWeatherData}/>
    </div>
  );
}

export default App;
