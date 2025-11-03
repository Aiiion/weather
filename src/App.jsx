import "./App.css";
import View from "./View.jsx";
import { useEffect, useState } from "react";
import { translateEpochTime, translateEpochDay } from "./helpers.js";

const API_BASE_URL = `https://api.alexbierhance.com/weather/aggregate?`;

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
  const [geoId, setGeoId] = useState(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [permissionStatus, setPermissionStatus] = useState("pending");

  useEffect(() => {
    setLoading(true);
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      setLoading(false);
      return;
    }
    getWeatherData(measure);
  }, [measure]);

  const getLatLon = () => {
    if (coords.lat && coords.lon) {
      return new Promise((resolve) => resolve(coords));
    }
    return new Promise((resolve, reject) => {
      setGeoId(
        navigator.geolocation.watchPosition(
          (position) =>
            resolve({
              lat: position.coords.latitude.toFixed(3),
              lon: position.coords.longitude.toFixed(3),
            }),
          () => {
            reject("Unable to retrieve your location");
            printNoLocationError();
          },
          { 
            enableHighAccuracy: false, 
            timeout: 45 * 1000,
            maximumAge: 15 * 1000 
          }
        )
      );
    });
  };
  const getPermissonStatus = () =>
    navigator.permissions.query({ name: "geolocation" }).then((permission) => {
      setPermissionStatus(permission.state);
    });
  const printNoLocationError = () =>
    getPermissonStatus().then(() => {
      if (permissionStatus === "denied") setCity("Location permission denied");
      else setCity("Unable to retrieve your location");
    });

  const cacheCoords = (coords) => {
    setCoords(coords);
    return coords;
  };
  const getWeatherData = (measureValue) => {
    setCity(null);
    getLatLon()
      .then(cacheCoords)
      .then((coords) => createApiUrl(coords, measureValue))
      .then(fetch)
      .then(toJSON)
      .then((res) => setWeather(res.data))
      .then(() => navigator.geolocation.clearWatch(geoId))
      .catch(() => {
        setError(true)
        setLoading(false)
      });
  };

  useEffect(() => {
    if (weather.currentWeather) {
      setCity(weather.currentWeather.name);
      setCurrentWeather(weather.currentWeather.weather[0].description);
      setCurrentTemp(Math.floor(weather.currentWeather.main.temp));
      setLoading(false);
    }
    if (weather.forecastWeather) {
      setForecast(Object.values(weather.forecastWeather));
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
  function refresh() {
    window.location.reload();
  }

  const tempButton = () => {
    const func = error
      ? permissionStatus !== "granted"
        ? refresh
        : getWeatherData
      : switchTemp;
    return (
      <button
        onClick={() => {
          func();
        }}
      >
        {!error ? "Switch Units" : "Retry"}
      </button>
    );
  };

  function skeleton(className = "") {
    return <div className={`skeleton text ${className}`}></div>;
  }
  return (
    <div className="App">
      <div className="topContainer">
        <h1>{!loading ? city : <span className="loader"></span>}</h1>
        {tempButton()}
      </div>
      <header className="App-header">
        {/* <h3 className="headerData">{loading ? skeleton() : currentWeather} </h3> */}
        <h3 className="headerData">
          {!loading ? currentTemp + measure : skeleton('small')}
          <br />
          {!loading ? currentWeather : skeleton()}
        </h3>
        {/* <h3 className="headerData">
          {loading ? skeleton() : `${weather?.current?.rain ?? 0} mm rain`}
        </h3> */}
      </header>
      <div className="subHeader">
        <div className="headerData">
          {loading ? skeleton() : `wind ${weather?.currentWeather?.wind.speed}${distanceTime}`}
        </div>
        <div className="headerData">
          {loading ? skeleton() : `humidity ${weather?.currentWeather?.main.humidity}%`}
        </div>
        <div className="headerData">
          {loading ? skeleton() : `sunrise at ${translateEpochTime(weather?.currentWeather?.sys.sunrise)}`}
        </div>
        <div className="headerData">
          {loading ? skeleton() : `sunset at ${translateEpochTime(weather?.currentWeather?.sys.sunset)}`}
        </div>
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
