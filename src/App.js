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
let rain = 0;
let daily = {};

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

const translateEpochDay = (epoch) => {
  let newDate = new Date(epoch * 1000);
  switch (newDate.getDay()) {
    case 1:
      return "Monday";
      break;
    case 2:
      return "Tuesday";
      break;
    case 3:
      return "Wednesday";
      break;
    case 4:
      return "Thursday";
      break;
    case 5:
      return "Friday";
      break;
    case 6:
      return "Saturday";
      break;
    case 0:
      return "Sunday";
      break;
    default:
      return "error";
      break;
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
      sunrise = translateEpochTime(weather.current.sunrise);
      sunset = translateEpochTime(weather.current.sunset);
      currentWind = weather.current.wind_speed;
      currentHumidity = weather.current.humidity;
      daily = weather.daily.slice(1,5);
      if(weather.current.rain){
        rain = weather.current.rain
      }
      setHourly(weather.hourly.slice(0,trimHoursAt(weather.hourly)));
      
    }else{
      city = "error, could not get weather data"
    } 
  }, [weather])
  return (
    
    <div className="App">
      <h1>{city} | {currentTemp}C</h1>
      <header className="App-header">
        
       
        <h3 className="headerData">{currentWeather}</h3>
        <h3 className="headerData">{currentTemp}C </h3>
        <p className="headerData">{rain} mm peticipation</p>
      </header>
      <div className="subHeader">
        <p className="headerData">wind {currentWind}m/s</p>
        <p className="headerData">humidity {currentHumidity}%</p>
        <p className="headerData">sunrise at {sunrise}</p>
        <p className="headerData">sunset at {sunset}</p>
      </div>
      <div className="daily">
        {daily.map && daily.map(day => (
          <div className="dailyContainer">
            <p className="dayData">{translateEpochDay(day.dt)}</p>
            <p className="dayData">{day.weather[0].main}</p>
            {day.temp.max} / {day.temp.min}
          </div>
          ))}
          
      </div>
      <div className="hourly">
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
              <td className="hourData">{hour.temp} C</td>
              <td className="hourData">{hour.weather[0].description}</td>
              <td className="hourData">{hour.wind_speed}m/s</td>
              <td className="hourData">{hour.humidity}</td>
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
