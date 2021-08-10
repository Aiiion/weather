import './App.css';
import View from './View.js';
import React, { useEffect, useState } from 'react';

const WEATHER_API_KEY = '7388dea722ff797c2e08d78452e08901';
const API_BASE_URL = `https://api.openweathermap.org/data/2.5/weather?`
let city = null;
let currentWeather = null;
let currentTemp = null;
let sunrise = null;
let sunset = null;

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

const getWeatherData= (setWeather) =>{ 
  getLatLng()
  .then(createApiUrl)
  .then(fetch)
  .then(toJSON)
  .then(setWeather);
}

  

function App() {
  const [weather, setWeather] = useState({});
  
  console.log(weather)
  useEffect(() => {
    getWeatherData(setWeather)
  }, [getWeatherData])

  const translateEpoch = (epoch) =>{
    let date = new Date(epoch * 1000);
    let hour = date.getHours();
    let minute = date.getMinutes();
    return `${hour}:${minute}`;
  }
  if(weather.name){
    city = weather.name;
    currentWeather = weather.weather[0].description;
    currentTemp = weather.main.temp;
    sunrise = translateEpoch(weather.sys.sunrise);
    sunset = translateEpoch(weather.sys.sunset);
    
  }else{
    city = "error, could not get weather data"
  }
  return (
    
    <div className="App">
      <header className="App-header">
        
        <h1>{city}</h1>
        <h3>{currentWeather}</h3>
        <p>{currentTemp} degrees Farenheight</p>
        <p>sunrise at {sunrise}</p>
        <p>sunset at {sunset}</p>
      </header>
      
      <View getWeatherData={getWeatherData}/>
      
    </div>
  );
}

export default App;
