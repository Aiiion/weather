import "./App.css";
import View from "./View.jsx";
import { useEffect, useState } from "react";
import { translateEpochTime, translateEpochDay } from "./helpers.js";

const API_BASE_URL = `https://api.alexbierhance.com/weather?`;

const createApiUrl = ({ lat, lon }, measureValue) => {
  const units = measureValue == "°C" ? "metric" : "imperial";
  return `${API_BASE_URL}lat=${lat}&lon=${lon}&units=${units}`;
};

const toJSON = (response) => response.json();

function App() {
  const [city, setCity] = useState();
  const [currentWeather, setCurrentWeather] = useState(null);
  const [currentTemp, setCurrentTemp] = useState(null);
  const [measure, setMeasure] = useState("°C");
  const [distanceTime, setDistanceTime] = useState("m/s");
  const [weather, setWeather] = useState({});
  const [forecast, setForecast] = useState([]);
  const [coords, setCoords] = useState({});

  useEffect(() => {
    getWeatherData(measure);
  }, [measure]);

  const getLatLon = () => {
    if (coords.lat && coords.lon) {
      return new Promise((resolve) => resolve(coords));
    }
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) =>
          resolve({
            lat: position.coords.latitude.toFixed(3),
            lon: position.coords.longitude.toFixed(3),
          }),
        () => {
          reject("Unable to retrieve your location");
          setCity("Unable to retrieve your location");
        }
      );
    });
  };
  const cacheCoords = (coords) => {
    setCoords(coords);
    return coords;
  };
  const getWeatherData = (measureValue) =>
    getLatLon()
      .then(cacheCoords)
      .then((coords) => createApiUrl(coords, measureValue))
      .then(fetch)
      .then(toJSON)
      .then((res) => setWeather(res.data));

  useEffect(() => {
    if (weather.current) {
      setCity(weather.current.name);
      setCurrentWeather(weather.current.weather[0].description);
      setCurrentTemp(Math.floor(weather.current.main.temp));
    }
    if (weather.forecast) {
      const upcoming = {};
      const forcastData = weather.forecast.list;

      for (let i = 0; i < forcastData.length; i++) {
        const day = translateEpochDay(weather.forecast.list[i].dt);
        if (!upcoming[day]) {
          upcoming[day] = [];
        }
        upcoming[day].push(weather.forecast.list[i]);
      }

      setForecast(Object.values(upcoming));
    }
  }, [weather]);

  const switchTemp = () => {
    if (measure === "°F") {
      setMeasure("°C");
      setDistanceTime("m/s");
    } else {
      setMeasure("°F");
      setDistanceTime("mph");
    }
  };

  return (
    <div className="App">
      <div className="topContainer">
        <h1>{city ? city : <span className="loader"></span>}</h1>
        <button
          onClick={() => {
            switchTemp();
          }}
        >
          Switch Units
        </button>
      </div>
      <header className="App-header">
        <h3 className="headerData">{currentWeather}</h3>
        <h3 className="headerData">
          {currentTemp}
          {measure}
        </h3>
        <h3 className="headerData">{weather?.current?.rain ?? 0}mm rain</h3>
      </header>
      <div className="subHeader">
        <p className="headerData">
          wind {weather?.current?.wind.speed}
          {distanceTime}
        </p>
        <p className="headerData">
          humidity {weather?.current?.main.humidity}%
        </p>
        <p className="headerData">
          sunrise at {translateEpochTime(weather?.current?.sys.sunrise)}
        </p>
        <p className="headerData">
          sunset at {translateEpochTime(weather?.current?.sys.sunset)}
        </p>
      </div>

      <div className="hourly">
        <h3 className="headerData">Upcoming weather</h3>
        <div className="forecastContainer">
          {forecast.map((forecastData, idx) => (
            <div className="dayContainer" key={idx}>
              <h4>{translateEpochDay(forecastData[0].dt)}</h4>
              <table>
                <thead>
                  <tr>
                    <th className="hourData">Time</th>
                    <th className="hourData">Temp</th>
                    <th className="hourData">Weather</th>
                    <th className="hourData">Wind</th>
                    <th className="hourData">Humidity</th>
                  </tr>
                </thead>
                <tbody>
                  {forecastData.map((hour) => (
                    <tr key={hour.dt}>
                      <td className="hourData">
                        {translateEpochTime(hour.dt)}
                      </td>
                      <td className="hourData">
                        {Math.floor(hour.main.temp)}
                        {measure}
                      </td>
                      <td className="hourData">
                        {hour.weather[0].description}
                      </td>
                      <td className="hourData">
                        {Math.floor(hour.wind.speed)}
                        {distanceTime}
                      </td>
                      <td className="hourData">{hour.main.humidity}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      </div>
      <View getWeatherData={getWeatherData} />
    </div>
  );
}

export default App;