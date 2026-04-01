import "./App.css";
import WarningIcon from "./components/WarningIcon/WarningIcon.jsx";
import WarningModal from "./components/WarningModal/WarningModal.jsx";
import Tooltip from "./components/Tooltip/Tooltip.jsx";
import { useEffect, useState, useRef } from "react";
import { translateEpochTime, translateEpochDayShort, getWeatherIcon, getWeatherIconFromDescription } from "./helpers.js";

const API_BASE_URL = `https://api.alexbierhance.com/weather/aggregate?`;

const createApiUrl = ({ lat, lon }, measureValue) => {
  const units = measureValue == "°C" ? "metric" : "imperial";
  return `${API_BASE_URL}lat=${lat}&lon=${lon}&units=${units}`;
};

const toJSON = (response) => response.json();

// Weather condition icons are provided by helpers: `getWeatherIcon` and `getWeatherIconFromDescription`.

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
  const [activeNav, setActiveNav] = useState("weather");
  const [expandedDay, setExpandedDay] = useState(null);
  const [activeTooltip, setActiveTooltip] = useState(null);
  const abortControllerRef = useRef(null);

  // Close tooltip when clicking outside or pressing Escape
  useEffect(() => {
    if (!activeTooltip) return;
    const handleClick = () => setActiveTooltip(null);
    const handleKey = (e) => { if (e.key === 'Escape') setActiveTooltip(null); };
    // Delay to avoid immediate close from the same click
    const timer = setTimeout(() => {
      document.addEventListener('click', handleClick);
      document.addEventListener('keydown', handleKey);
    }, 0);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('click', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [activeTooltip]);

  useEffect(() => {
    // Cancel any in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Clear stale data and set loading state
    setLoading(true);
    setWeather(null);
    setForecast([]);
    setWeatherWarning(null);
    
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      setLoading(false);
      return;
    }
    
    // Create new AbortController for this request
    const controller = new AbortController();
    abortControllerRef.current = controller;
    
    getWeatherData(measure, controller.signal);
    
    return () => {
      // Cleanup: abort on unmount or before next effect
      controller.abort();
    };
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
      return permission.state;
    });
  const printNoLocationError = () =>
    getPermissonStatus().then((state) => {
      if (state === "denied") setCity("Location permission denied");
      else setCity("Unable to retrieve your location");
    });

  const cacheCoords = (coords) => {
    setCoords(coords);
    return coords;
  };
  const getWeatherData = (measureValue, signal) => {
    setCity(null);
    getLatLon()
      .then(cacheCoords)
      .then((coords) => createApiUrl(coords, measureValue))
      .then((url) => fetch(url, { signal }))
      .then(toJSON)
      .then((res) => {
        // Only update if this request wasn't aborted
        if (!signal?.aborted) {
          updateData(res.data);
        }
      })
      .then(() => navigator.geolocation.clearWatch(geoId))
      .catch((err) => {
        // Ignore abort errors, handle other errors
        if (err.name === 'AbortError') {
          return;
        }
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
    return forecast.filter(dayData => dayData.length > 0).map((dayData, idx) => {
      const firstEntry = dayData[0];
      // Find entry closest to midday (12:00-15:00 range typical in 3-hour data)
      const noonEntry = dayData.find(h => {
        const hour = new Date(h.dt * 1000).getHours();
        return hour >= 12 && hour <= 15;
      }) || firstEntry;
      const temps = dayData.map(h => h.main.temp);
      const maxTemp = Math.round(Math.max(...temps));
      const minTemp = Math.round(Math.min(...temps));
      // Calculate total precipitation for the day
      const totalPrecipitation = dayData.reduce((sum, h) => sum + (h.rain?.["3h"] ?? h.snow?.["3h"] ?? 0), 0);
      return {
        day: translateEpochDayShort(firstEntry.dt),
        icon: getWeatherIcon(noonEntry.weather[0]),
        maxTemp,
        minTemp,
        precipitation: Math.round(totalPrecipitation * 10) / 10,
        isFirst: idx === 0,
        hourlyData: dayData.map(hour => ({
          time: translateEpochTime(hour.dt),
          temp: Math.round(hour.main.temp),
          feelsLike: Math.round(hour.main.feels_like),
          description: hour.weather[0]?.description,
          icon: getWeatherIcon(hour.weather[0]),
          wind: Math.round(hour.wind.speed),
          humidity: hour.main.humidity,
          precipitation: hour.rain?.["3h"] ?? hour.snow?.["3h"] ?? 0
        }))
      };
    });
  };

  const toggleDayExpanded = (idx) => {
    setActiveTooltip(null);
    setExpandedDay(expandedDay === idx ? null : idx);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-x-hidden">
      {/* TopAppBar */}
      <header className="bg-background flex justify-between items-center px-4 py-4 w-full fixed top-0 z-50 box-border">
        <div className="max-w-[1200px] mx-auto w-full flex justify-between items-center">
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
      onClick={refresh}
      className="flex items-center justify-center bg-surface-container-low rounded-full p-2 text-on-surface-variant hover:text-primary transition-colors"
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
        </div>
      </header>

      <main className="px-4 pt-20 pb-4 w-full box-border flex-1 max-w-[1200px] mx-auto">
        {/* Hero Temperature Section */}
        <section className="flex flex-col items-center mb-16 lg:mb-20">
          {loading ? (
            <div className="h-36 w-48 bg-surface-container-low rounded-xl animate-pulse"></div>
          ) : weather ? (
            <div className="relative">
              <span className="text-[clamp(6rem,20vw,9rem)] font-medium text-primary tracking-tighter leading-none">
                {Math.floor(weather.main.temp)}°
              </span>
              <div className="absolute -top-4 -right-8">
                <span className="material-symbols-outlined text-secondary text-5xl">
                  {getWeatherIcon(weather.weather[0])}
                </span>
              </div>
            </div>
          ) : null}
          <p className="font-['Inter'] text-[0.6875rem] font-bold uppercase tracking-[0.05em] text-on-surface-variant mt-4">
            {loading ? (
              <span className="inline-block h-4 w-24 bg-surface-container-low rounded animate-pulse"></span>
            ) : weather ? (
              <>
                feels like {Math.floor(weather.main.feels_like)}°
                {precipitation > 0 && (
                  <span className="ml-2">
                    • {precipitation} mm/h
                    {weather.snow?.["1h"] && (
                      <Tooltip
                        text="While snow is measured in mm, 1 mm of snow is approximately equivalent to 1 cm of snow depth."
                        ariaLabel="Snow measurement info"
                      />
                    )}
                  </span>
                )}
              </>
            ) : null}
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
              ) : weather ? (
                `${weather.wind.speed}${distanceTime}`
              ) : '--'}
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
              ) : weather ? (
                `${weather.main.humidity}%`
              ) : '--'}
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
                  ) : weather ? (
                    translateEpochTime(weather.sys.sunrise)
                  ) : '--'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-semibold text-on-surface">
                  {loading ? (
                    <span className="inline-block h-6 w-14 bg-surface-container-low rounded animate-pulse"></span>
                  ) : weather ? (
                    translateEpochTime(weather.sys.sunset)
                  ) : '--'}
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
                    aria-expanded={expandedDay === idx}
                    aria-controls={`day-panel-${idx}`}
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
                      {day.precipitation > 0 && (
                        <div className="flex items-center gap-1 text-on-surface-variant text-xs">
                          <span className="material-symbols-outlined text-sm">water_drop</span>
                          <span>{day.precipitation}mm</span>
                        </div>
                      )}
                      <span className="text-on-surface font-semibold">{day.maxTemp}°</span>
                      <span className="text-on-surface-variant text-sm">{day.minTemp}°</span>
                      <span className={`material-symbols-outlined text-on-surface-variant text-lg transition-transform duration-200 ${expandedDay === idx ? 'rotate-180' : ''}`}>
                        expand_more
                      </span>
                    </div>
                  </button>
                  {expandedDay === idx && (
                    <div id={`day-panel-${idx}`} className={`bg-surface-container p-4 rounded-b-3xl space-y-3 ${
                      day.isFirst ? 'border-t border-outline-variant/20' : ''
                    }`}>
                      {day.hourlyData.map((hour, hIdx) => (
                        <div key={`${day.day}-${hour.time}`} className="flex items-center justify-between py-2 border-b border-outline-variant/10 last:border-b-0">
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-on-surface-variant w-12">{hour.time}</span>
                            <button
                              type="button"
                              className="relative"
                              onClick={() => setActiveTooltip(activeTooltip === `${idx}-${hIdx}` ? null : `${idx}-${hIdx}`)}
                              aria-label={`Weather: ${hour.description}`}
                            >
                              <span className="material-symbols-outlined text-secondary text-lg cursor-pointer hover:text-primary transition-colors">{hour.icon}</span>
                              {activeTooltip === `${idx}-${hIdx}` && hour.description && (
                                <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 z-50 bg-surface-container-highest text-on-surface text-xs px-3 py-2 rounded-lg shadow-lg whitespace-nowrap capitalize">
                                  {hour.description}
                                </div>
                              )}
                            </button>
                            <span className="text-sm text-on-surface-variant capitalize hidden sm:inline">{hour.description}</span>
                          </div>
                          <div className="flex items-center gap-4">
                            {hour.precipitation > 0 && (
                              <div className="flex items-center gap-1 text-on-surface-variant text-xs">
                                <span className="material-symbols-outlined text-sm">water_drop</span>
                                <span>{Math.round(hour.precipitation * 10) / 10}mm</span>
                              </div>
                            )}
                            <div className="flex items-center gap-1 text-on-surface-variant text-xs">
                              <span className="material-symbols-outlined text-sm">air</span>
                              <span>{hour.wind}{distanceTime}</span>
                            </div>
                            <div className="flex items-center gap-1 text-on-surface-variant text-xs hidden sm:flex">
                              <span className="material-symbols-outlined text-sm">humidity_percentage</span>
                              <span>{hour.humidity}%</span>
                            </div>
                            
                            <div className="flex flex-col items-end">
                              <span className="text-on-surface font-medium">{hour.temp}°</span>
                              <span className="text-on-surface-variant text-xs">Feels {hour.feelsLike}°</span>
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
      <nav className="sticky bottom-0 z-50 flex justify-around items-center px-4 pb-6 pt-4 bg-background/60 backdrop-blur-xl rounded-t-3xl shadow-[0_-10px_30px_rgba(0,0,0,0.08)] w-full box-border">
        <div className="max-w-[1200px] mx-auto w-full flex justify-around items-center">
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
        </div>
      </nav>

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
