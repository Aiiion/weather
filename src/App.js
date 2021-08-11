import './App.css';
import View from './View.js';
import React, { useEffect, useState } from 'react';

const WEATHER_API_KEY = '7388dea722ff797c2e08d78452e08901';
const API_BASE_URL = `https://api.openweathermap.org/data/2.5/onecall?`
let city = null;
let currentWeather = null;
let currentTemp = null;
let sunrise = null;
let sunset = null;
let currentWind = null;
let currentHumidity = null;

const createApiUrl = ({lat, lng}) => {
  
  return `${API_BASE_URL}lat=${lat}&lon=${lng}&exclude=minutely&units=metric&appid=${WEATHER_API_KEY}`
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

const getWeatherData= (setWeather) =>
  getLatLng()
  .then(createApiUrl)
  .then(fetch)
  .then(toJSON)
  .then(setWeather);

const translateEpoch = (epoch) =>{ //translates the epoch value to time in hours and minutes
  let date = new Date(epoch * 1000); 
  let hour = date.getHours();
  let minute = date.getMinutes();
  if(minute < 10){
    minute = `0${minute}`
  }if(hour < 10){
    hour = `0${hour}`
  }
  return `${hour}:${minute}`;
}

const trimHoursAt = (weatherHourly) =>{ //detects when the array is at a new day and returns thats value 
  for (let i = 0; i < 23; i++) {
    if(translateEpoch(weatherHourly[i].dt) == "00:00"){
      return i;
    }
  }
}
const switchTemp = (temp, cOrF) => {
  if(cOrF == "C"){
  let subtractedTemp = temp-32
  
  return subtractedTemp/1.8
  }else{
    let miltiTemp = temp*1.8
    return miltiTemp+32
  }
} 
function App() {
  const [weather, setWeather] = useState({});
  const [hourly, setHourly] = useState({});
  
  console.log(weather)
  useEffect(() => {
    getWeatherData(setWeather)
  }, [getWeatherData])

  useEffect(() => {
    if(weather.timezone){ 
      city = weather.timezone.slice(7);
      currentWeather = weather.current.weather[0].description;
      currentTemp = weather.current.temp;
      sunrise = translateEpoch(weather.current.sunrise);
      sunset = translateEpoch(weather.current.sunset);
      currentWind = weather.current.wind_speed;
      currentHumidity = weather.current.humidity;
      setHourly(weather.hourly.slice(0,trimHoursAt(weather.hourly)));
      // trimHoursAt(weather.hourly).then((value) => {
      //   setHourly(weather.hourly.slice(0,value))
      // })
    }else{
      city = "error, could not get weather data"
    } 
  }, [weather])
  console.log(hourly)
  return (
    
    <div className="App">
      <header className="App-header">
        <h1 className="headerData">{city}</h1>
        <h3 className="headerData">{currentTemp}C </h3>
        <h3 className="headerData">{currentWeather}</h3>
      </header>
      <div className="subHeader">
        <p className="headerData">wind {currentWind}m/s</p>
        <p className="headerData">{currentHumidity}% humidity</p>
        <p className="headerData">sunrise at {sunrise} | sunset at {sunset}</p>
      </div>
      <div className="hourly">
         <table>
           <th className="hourData">Time</th>
           <th className="hourData">Temprature</th>
           <th className="hourData">Weather</th>
           <th className="hourData">Wind</th>
           <th className="hourData">Humidity</th>

          {hourly.map && hourly.map(hour => (
           <tr>
             <td className="hourData">{translateEpoch(hour.dt)}</td>
             <td className="hourData">{hour.temp} C</td>
             <td className="hourData">{hour.weather[0].description}</td>
             <td className="hourData">{hour.wind_speed}m/s</td>
             <td className="hourData">{hour.humidity}</td>
           </tr>
           
          ))}
        </table> 
      </div>
      <View getWeatherData={getWeatherData}/>
      
    </div>
  );
}

export default App;
