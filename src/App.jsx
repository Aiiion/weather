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
  const [measure, setMeasure] = useState("°C");
  const [distanceTime, setDistanceTime] = useState("m/s");
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [coords, setCoords] = useState({});
  const [geoId, setGeoId] = useState(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [permissionStatus, setPermissionStatus] = useState("pending");
  const [precipitation, setPrecipitation] = useState(0);

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
            maximumAge: 20 * 1000 
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
      .then((res) => updateData(res.data))
      .then(() => navigator.geolocation.clearWatch(geoId))
      .catch(() => {
        setError(true)
        setLoading(false)
      });
  };

  const updateData = (data) => {
    if (data.currentWeather) {
      setWeather(data.currentWeather);
      setCity(data.currentWeather.name);
      setLoading(false);
      setPrecipitation((data.currentWeather?.rain?.["1h"] ?? data.currentWeather?.snow?.["1h"]) ?? 0);
    }
    if (data.forecastWeather) {
      setForecast(Object.values(data.forecastWeather));
    }
  };

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
        <div className="headerData column">
          <div className="flex column">
            <h3 className="m-0">
              {!loading
                ? Math.floor(weather?.main.temp ?? 0) + measure
                : skeleton("small")}
            </h3>
            <span className="smallText mt-n1">
              {!loading
                ? ` (feels like ${Math.floor(weather?.main.feels_like ?? 0)})`
                : skeleton("small")}
            </span>
          </div>

          <div className="inline-flex column">
            <h3 className="m-0">
              {!loading ? weather?.weather[0].description : skeleton()}
            </h3>

            <span className="smallText pt-0">
              {precipitation ? `${precipitation} mm/h` : ""}
            </span>
          </div>
        </div>
      </header>
      <div className="subHeader">
        <div className="headerData">
          {loading ? skeleton('small') : `wind ${weather?.wind.speed}${distanceTime}`}
        </div>
        <div className="headerData">
          {loading ? skeleton('small') : `humidity ${weather?.main.humidity}%`}
        </div>
        <div className="headerData">
          {loading
            ? skeleton('small')
            : `sunrise at ${translateEpochTime(weather?.sys.sunrise)}`}
        </div>
        <div className="headerData">
          {loading
            ? skeleton('small')
            : `sunset at ${translateEpochTime(weather?.sys.sunset)}`}
        </div>
      </div>

      <div className="hourly">
        <h3 className="headerData">Upcoming weather</h3>
        <div className="forecastContainer">
          {forecast.map((forecastData, idx) => (
            <div className="w-100" key={idx}>
              <h4>{translateEpochDay(forecastData[0].dt)}</h4>
              <table>
                <thead>
                  <tr>
                    <th className="hourData">Time</th>
                    <th className="hourData">Temp.</th>
                    <th className="hourData">Weather</th>
                    <th className="hourData">Wind</th>
                    <th className="hourData">Hm.</th>
                    <th className="hourData">Prec.</th>
                  </tr>
                  <tr>
                    <th className="pt-0 smallText"></th>
                    <th className="pt-0 smallText">({measure})</th>
                    <th className="pt-0 smallText"></th>
                    <th className="pt-0 smallText">({distanceTime})</th>
                    <th className="pt-0 smallText">(%)</th>
                    <th className="pt-0 smallText">(mm/h)</th>
                  </tr>
                </thead>
                <tbody>
                  {forecastData.map((hour) => (
                    <tr key={hour.dt}>
                      <td className="hourData">
                        {translateEpochTime(hour.dt)}
                      </td>
                      <td className="hourData">
                        <div className="ps-3 flex">
                          <span className="">{Math.floor(hour.main.temp)}</span>
                          <span className="smallText" title="feels like">
                            {" "}
                            ({Math.floor(hour.main.feels_like)})
                          </span>
                        </div>
                      </td>
                      <td className="hourData">
                        {hour.weather[0].description}
                      </td>
                      <td className="hourData">
                        {Math.floor(hour.wind.speed)}
                      </td>
                      <td className="hourData">{hour.main.humidity}</td>
                      <td className="hourData">
                        {hour.rain?.["1h"] ?? hour.snow?.["1h"] ?? 0}
                      </td>
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
