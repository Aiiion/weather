import './App.css';
import View from './View.js';
import React, { useEffect, useState } from 'react';

const API_BASE_URL = `https://api.openweathermap.org/data/2.5/onecall?`
let city = null;
let currentWeather = null;
let currentTemp = null;
let sunrise = null;
let sunset = null;
let currentWind = null;
let currentHumidity = null;
let rain = 0;
let daily = {};
let measure = "°C";
let distanceTime ="m/s";

const createApiUrl = ({lat, lng}) => {
  if(measure == "°C"){
  return `${API_BASE_URL}lat=${lat}&lon=${lng}&exclude=minutely&units=metric&appid=${process.env.REACT_APP_API_KEY}`
  }else{
    return `${API_BASE_URL}lat=${lat}&lon=${lng}&exclude=minutely&units=imperial&appid=${process.env.REACT_APP_API_KEY}`
  }
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

const translateEpochTime = (epoch) =>{ //translates the epoch value to time in hours and minutes
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
    if(translateEpochTime(weatherHourly[i].dt) == "00:00"){
      return i;
    }
  }
}

const translateEpochDay = (epoch) => {//translated the epoch value to the weekday of the date
  let newDate = new Date(epoch * 1000);
  switch (newDate.getDay()) {
    case 1:
      return "Monday";
    case 2:
      return "Tuesday";
    case 3:
      return "Wednesday";
    case 4:
      return "Thursday";
    case 5:
      return "Friday";
    case 6:
      return "Saturday";
    case 0:
      return "Sunday";
    default:
      return "error";
  }
}

function App() {
  const [weather, setWeather] = useState({});
  const [hourly, setHourly] = useState({});

  useEffect(() => {
    getWeatherData(setWeather)
  }, [getWeatherData])

  useEffect(() => {
    if(weather.timezone){ 
      city = weather.timezone.slice(7);
      currentWeather = weather.current.weather[0].description;
      currentTemp = Math.floor(weather.current.temp);
      sunrise = translateEpochTime(weather.current.sunrise);
      sunset = translateEpochTime(weather.current.sunset);
      currentWind = weather.current.wind_speed;
      currentHumidity = weather.current.humidity;
      daily = weather.daily.slice(1,6);
      if(weather.current.rain){
        rain = weather.current.rain
      }
      setHourly(weather.hourly.slice(0,trimHoursAt(weather.hourly)));
      
    }else{
      city = "error, could not get weather data"
    } 
  }, [weather])
  const switchTemp = () => {
    if(measure == "°F"){
      measure = "°C";
      distanceTime = "m/s"
    }else{
      measure = "°F";
      distanceTime ="mph"
    }
    getWeatherData(setWeather);
  }

  return (
    
    <div className="App">
      <div className="topContainer">
        <h1>{city}</h1>
        <button onClick={() => {switchTemp()}}>
          Switch Units
        </button>
      </div>
      <header className="App-header">
        <h3 className="headerData">{currentWeather}</h3>
        <h3 className="headerData">{currentTemp}{measure}</h3>
        <h3 className="headerData">{rain}mm rain</h3>
      </header>
      <div className="subHeader">
        <p className="headerData">wind {currentWind}{distanceTime}</p>
        <p className="headerData">humidity {currentHumidity}%</p>
        <p className="headerData">sunrise at {sunrise}</p>
        <p className="headerData">sunset at {sunset}</p>
      </div>
      
      <div className="daily">
        <h2 className="headline">The coming 5 days</h2>
          <div className="dailyContainer">
            {daily.map && daily.map(day => (
              <div className="dayContainer">
                <p className="dayData"><b>{translateEpochDay(day.dt)}</b></p>
                <p className="dayData">{day.weather[0].main}</p>
                <p className="dayData">{Math.floor(day.temp.max)}{measure} / {Math.floor(day.temp.min)}{measure}</p>
              </div>
              ))}
              
          </div>
      </div>
      <div className="hourly">
        <h3 className="headerData">Later today</h3>
         <table>
           <th className="hourData">Time</th>
           <th className="hourData">Temprature</th>
           <th className="hourData">Weather</th>
           <th className="hourData">Wind</th>
           <th className="hourData">Humidity</th>
          <tbody>
            {hourly.map && hourly.map(hour => (
            <tr>
              <td className="hourData">{translateEpochTime(hour.dt)}</td>
              <td className="hourData">{Math.floor(hour.temp)}{measure}</td>
              <td className="hourData">{hour.weather[0].description}</td>
              <td className="hourData">{hour.wind_speed}{distanceTime}</td>
              <td className="hourData">{hour.humidity}%</td>
            </tr>
            
            ))}
          </tbody>
        </table> 
      </div>
      <View getWeatherData={getWeatherData}/>
      
    </div>
  );
}

export default App;
