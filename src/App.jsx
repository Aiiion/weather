import "./App.css";
import WarningIcon from "./components/WarningIcon/WarningIcon.jsx";
import WarningModal from "./components/WarningModal/WarningModal.jsx";
import Tooltip from "./components/Tooltip/Tooltip.jsx";
import { useEffect, useState } from "react";
import { translateEpochTime, translateEpochDayShort } from "./helpers.js";

const API_BASE_URL = `https://api.alexbierhance.com/weather/aggregate?`;

const createApiUrl = ({ lat, lon }, measureValue) => {
  const units = measureValue == "°C" ? "metric" : "imperial";
  return `${API_BASE_URL}lat=${lat}&lon=${lon}&units=${units}`;
};

const toJSON = (response) => response.json();

// Weather condition to icon mapping
const getWeatherIcon = (description) => {
  const desc = description?.toLowerCase() || "";
  if (desc.includes("clear") || desc.includes("sunny")) return "wb_sunny";
  if (desc.includes("cloud") && desc.includes("partly")) return "partly_cloudy_day";
  if (desc.includes("cloud")) return "cloudy";
  if (desc.includes("rain") || desc.includes("drizzle")) return "rainy";
  if (desc.includes("thunder") || desc.includes("storm")) return "thunderstorm";
  if (desc.includes("snow")) return "weather_snowy";
  if (desc.includes("mist") || desc.includes("fog") || desc.includes("haze")) return "foggy";
  return "wb_sunny";
};

function App() {
  const [city, setCity] = useState();
  const [measure, setMeasure] = useState("°C");
  const [distanceTime, setDistanceTime] = useState("m/s");
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [weatherWarning, setWeatherWarning] = useState(null);
  const [coords, setCoords] = useState({});
  const [geoId, setGeoId] = useState(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isWarningOpen, setIsWarningOpen] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState("pending");
  const [precipitation, setPrecipitation] = useState(0);
  // const [activeNav, setActiveNav] = useState("weather");
  const [expandedDay, setExpandedDay] = useState(null);

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
            maximumAge: 20 * 1000,
          },
        ),
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
        setError(true);
        setLoading(false);
      });
  };

  const updateData = (data) => {
    if (data.currentWeather) {
      setWeather(data.currentWeather);
      setCity(data.currentWeather.name);
      setLoading(false);
      setPrecipitation(
        data.currentWeather?.rain?.["1h"] ??
          data.currentWeather?.snow?.["1h"] ??
          0,
      );
    }
    if (data.forecastWeather) {
      setForecast(Object.values(data.forecastWeather));
    }
    if (
      data.weatherWarnings?.severity &&
      data.weatherWarnings.severity !== "NONE"
    ) {
      setWeatherWarning(data.weatherWarnings);
    } else {
      setWeatherWarning(null);
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

  // Get daily forecast summary (first entry of each day)
  const getDailyForecast = () => {
    return forecast.map((dayData, idx) => {
      const firstEntry = dayData[0];
      const temps = dayData.map(h => h.main.temp);
      const maxTemp = Math.round(Math.max(...temps));
      const minTemp = Math.round(Math.min(...temps));
      return {
        day: translateEpochDayShort(firstEntry.dt),
        icon: getWeatherIcon(firstEntry.weather[0]?.description),
        maxTemp,
        minTemp,
        isFirst: idx === 0,
        hourlyData: dayData.map(hour => ({
          time: translateEpochTime(hour.dt),
          temp: Math.round(hour.main.temp),
          feelsLike: Math.round(hour.main.feels_like),
          description: hour.weather[0]?.description,
          icon: getWeatherIcon(hour.weather[0]?.description),
          wind: Math.round(hour.wind.speed),
          humidity: hour.main.humidity
        }))
      };
    });
  };

  const toggleDayExpanded = (idx) => {
    setExpandedDay(expandedDay === idx ? null : idx);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-x-hidden">
      {/* TopAppBar */}
      <header className="bg-background flex justify-between items-center px-4 py-4 w-full fixed top-0 z-50 box-border">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">location_on</span>
          {loading ? (
            <div className="h-6 w-32 bg-surface-container-low rounded animate-pulse"></div>
          ) : (
            <h1 className="font-['Inter'] font-semibold tracking-[-0.02em] text-[1.25rem] text-primary">
              {city}
              {weatherWarning && (
                <span className="ml-2 inline-flex">
                  <WarningIcon
                    color={weatherWarning?.severity ?? undefined}
                    title="Click for weather warning details"
                    onClick={() => setIsWarningOpen(true)}
                  />
                </span>
              )}
            </h1>
          )}
        </div>
        {error ? (
          <button 
            onClick={permissionStatus !== "granted" ? refresh : () => getWeatherData(measure)}
            className="text-primary hover:bg-surface-container transition-colors duration-300 p-2 rounded-full active:scale-95"
            title="Retry"
          >
            <span className="material-symbols-outlined">refresh</span>
          </button>
        ) : (
          <div className="flex items-center bg-surface-container-low rounded-full p-1">
            <button
              onClick={() => { if (measure !== "°C") switchTemp(); }}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 ${
                measure === "°C" 
                  ? 'bg-surface-variant text-tertiary' 
                  : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              °C
            </button>
            <button
              onClick={() => { if (measure !== "°F") switchTemp(); }}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 ${
                measure === "°F" 
                  ? 'bg-surface-variant text-tertiary' 
                  : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              °F
            </button>
          </div>
        )}
      </header>

      <main className="px-4 pt-20 pb-4 w-full box-border flex-1">
        {/* Hero Temperature Section */}
        <section className="flex flex-col items-center mb-16 lg:mb-20">
          {loading ? (
            <div className="h-36 w-48 bg-surface-container-low rounded-xl animate-pulse"></div>
          ) : (
            <div className="relative">
              <span className="text-[clamp(6rem,20vw,9rem)] font-medium text-primary tracking-tighter leading-none">
                {Math.floor(weather?.main.temp ?? 0)}°
              </span>
              <div className="absolute -top-4 -right-8">
                <span className="material-symbols-outlined text-secondary text-5xl">
                  {getWeatherIcon(weather?.weather[0]?.description)}
                </span>
              </div>
            </div>
          )}
          <p className="font-['Inter'] text-[0.6875rem] font-bold uppercase tracking-[0.05em] text-on-surface-variant mt-4">
            {loading ? (
              <span className="inline-block h-4 w-24 bg-surface-container-low rounded animate-pulse"></span>
            ) : (
              <>
                feels like {Math.floor(weather?.main.feels_like ?? 0)}°
                {precipitation > 0 && (
                  <span className="ml-2">
                    • {precipitation} mm/h
                    {weather?.snow?.["1h"] && (
                      <Tooltip
                        text="While snow is measured in mm, 1 mm of snow is approximately equivalent to 1 cm of snow depth."
                        ariaLabel="Snow measurement info"
                      />
                    )}
                  </span>
                )}
              </>
            )}
          </p>
          {!loading && weather?.weather[0]?.description && (
            <p className="font-['Inter'] text-sm text-secondary mt-2 capitalize">
              {weather.weather[0].description}
            </p>
          )}
        </section>

        {/* Bento Grid Data Points */}
        <section className="grid grid-cols-2 gap-4 mb-16 lg:grid-cols-4 lg:gap-6">
          {/* Wind */}
          <div className="asymmetric-radius bg-surface-container-low p-5 flex flex-col justify-between h-32">
            <div className="flex justify-between items-start">
              <span className="font-['Inter'] text-[0.6875rem] font-bold uppercase tracking-[0.05em] text-on-surface-variant">Wind</span>
              <span className="material-symbols-outlined text-secondary text-xl">air</span>
            </div>
            <div className="text-xl font-semibold text-on-surface">
              {loading ? (
                <span className="inline-block h-6 w-16 bg-surface-container rounded animate-pulse"></span>
              ) : (
                `${weather?.wind.speed}${distanceTime}`
              )}
            </div>
          </div>

          {/* Humidity */}
          <div className="asymmetric-radius bg-surface-container-low p-5 flex flex-col justify-between h-32">
            <div className="flex justify-between items-start">
              <span className="font-['Inter'] text-[0.6875rem] font-bold uppercase tracking-[0.05em] text-on-surface-variant">Humidity</span>
              <span className="material-symbols-outlined text-secondary text-xl">humidity_low</span>
            </div>
            <div className="text-xl font-semibold text-on-surface">
              {loading ? (
                <span className="inline-block h-6 w-12 bg-surface-container rounded animate-pulse"></span>
              ) : (
                `${weather?.main.humidity}%`
              )}
            </div>
          </div>

          {/* Sunrise / Sunset Spanning Card */}
          <div className="col-span-2 asymmetric-radius bg-surface-container p-5 flex flex-col justify-between h-32">
            <div className="flex justify-between items-start">
              <span className="font-['Inter'] text-[0.6875rem] font-bold uppercase tracking-[0.05em] text-on-surface-variant">Sunrise</span>
              <span className="font-['Inter'] text-[0.6875rem] font-bold uppercase tracking-[0.05em] text-on-surface-variant">Sunset</span>
            </div>
            <div className="flex justify-between items-end">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-tertiary">wb_twilight</span>
                <span className="text-xl font-semibold text-on-surface">
                  {loading ? (
                    <span className="inline-block h-6 w-14 bg-surface-container-low rounded animate-pulse"></span>
                  ) : (
                    translateEpochTime(weather?.sys.sunrise)
                  )}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-semibold text-on-surface">
                  {loading ? (
                    <span className="inline-block h-6 w-14 bg-surface-container-low rounded animate-pulse"></span>
                  ) : (
                    translateEpochTime(weather?.sys.sunset)
                  )}
                </span>
                <span className="material-symbols-outlined text-secondary">nights_stay</span>
              </div>
            </div>
          </div>
        </section>

        {/* Forecast Section */}
        <section>
          <h2 className="font-['Inter'] text-[1.125rem] font-medium tracking-tight text-primary mb-6 ml-1">Upcoming weather</h2>
          <div className="space-y-3">
            {loading ? (
              // Skeleton loading state
              [...Array(5)].map((_, idx) => (
                <div key={idx} className="asymmetric-radius bg-surface-container-low p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="h-5 w-10 bg-surface-container rounded animate-pulse"></span>
                    <span className="h-6 w-6 bg-surface-container rounded animate-pulse"></span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="h-5 w-8 bg-surface-container rounded animate-pulse"></span>
                    <span className="h-4 w-6 bg-surface-container rounded animate-pulse"></span>
                  </div>
                </div>
              ))
            ) : (
              getDailyForecast().map((day, idx) => (
                <div key={day.day} className="space-y-0">
                  <button 
                    onClick={() => toggleDayExpanded(idx)}
                    className={`asymmetric-radius p-4 flex items-center justify-between w-full text-left transition-colors ${
                      day.isFirst ? 'bg-surface-container-highest' : 'bg-surface-container-low'
                    } ${expandedDay === idx ? 'rounded-b-none' : ''}`}
                  >
                    <div className="flex items-center gap-4">
                      <span className={`font-medium w-10 ${day.isFirst ? 'text-tertiary' : ''}`}>
                        {day.day}
                      </span>
                      <span className="material-symbols-outlined text-secondary">{day.icon}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-on-surface font-semibold">{day.maxTemp}°</span>
                      <span className="text-on-surface-variant text-sm">{day.minTemp}°</span>
                      <span className={`material-symbols-outlined text-on-surface-variant text-lg transition-transform duration-200 ${expandedDay === idx ? 'rotate-180' : ''}`}>
                        expand_more
                      </span>
                    </div>
                  </button>
                  {expandedDay === idx && (
                    <div className={`bg-surface-container p-4 rounded-b-3xl space-y-3 ${
                      day.isFirst ? 'border-t border-outline-variant/20' : ''
                    }`}>
                      {day.hourlyData.map((hour, hIdx) => (
                        <div key={`${day.day}-${hour.time}`} className="flex items-center justify-between py-2 border-b border-outline-variant/10 last:border-b-0">
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-on-surface-variant w-12">{hour.time}</span>
                            <span className="material-symbols-outlined text-secondary text-lg">{hour.icon}</span>
                            <span className="text-sm text-on-surface-variant capitalize hidden sm:inline">{hour.description}</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-on-surface font-medium">{hour.temp}°</span>
                            <div className="flex items-center gap-1 text-on-surface-variant text-xs">
                              <span className="material-symbols-outlined text-sm">air</span>
                              <span>{hour.wind}{distanceTime}</span>
                            </div>
                            <div className="flex items-center gap-1 text-on-surface-variant text-xs hidden sm:flex">
                              <span className="material-symbols-outlined text-sm">humidity_percentage</span>
                              <span>{hour.humidity}%</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </section>
      </main>

      {/* BottomNavBar */}
      {/* <nav className="sticky bottom-0 z-50 flex justify-around items-center px-4 pb-6 pt-4 bg-background/60 backdrop-blur-xl rounded-t-3xl shadow-[0_-10px_30px_rgba(0,0,0,0.08)] w-full box-border">
        <button 
          onClick={() => setActiveNav("weather")}
          className={`flex flex-col items-center justify-center p-3 rounded-2xl transition-all duration-200 active:scale-90 ${
            activeNav === "weather" 
              ? 'bg-surface-variant text-tertiary' 
              : 'text-outline-variant hover:text-primary'
          }`}
        >
          <span className="material-symbols-outlined">wb_sunny</span>
        </button>
        <button 
          onClick={() => setActiveNav("details")}
          className={`flex flex-col items-center justify-center p-3 rounded-2xl transition-all duration-200 ${
            activeNav === "details" 
              ? 'bg-surface-variant text-tertiary' 
              : 'text-outline-variant hover:text-primary'
          }`}
        >
          <span className="material-symbols-outlined">table_rows</span>
        </button>
        <button 
          onClick={() => setActiveNav("explore")}
          className={`flex flex-col items-center justify-center p-3 rounded-2xl transition-all duration-200 ${
            activeNav === "explore" 
              ? 'bg-surface-variant text-tertiary' 
              : 'text-outline-variant hover:text-primary'
          }`}
        >
          <span className="material-symbols-outlined">explore</span>
        </button>
        <button 
          onClick={() => setActiveNav("settings")}
          className={`flex flex-col items-center justify-center p-3 rounded-2xl transition-all duration-200 ${
            activeNav === "settings" 
              ? 'bg-surface-variant text-tertiary' 
              : 'text-outline-variant hover:text-primary'
          }`}
          title="Settings"
        >
          <span className="material-symbols-outlined">settings</span>
        </button>
      </nav> */}

      {/* Warning Modal */}
      <WarningModal
        open={isWarningOpen}
        onClose={() => setIsWarningOpen(false)}
      >
        <p className="font-semibold text-on-surface">{weatherWarning?.description}</p>
        <p className="text-on-surface-variant mt-2">{weatherWarning?.severityDescription}</p>
        <span className="text-sm text-on-surface-variant italic mt-4 block">
          This feature is in beta, please check your local weather service for official warnings.
        </span>
      </WarningModal>
    </div>
  );
}

export default App;
