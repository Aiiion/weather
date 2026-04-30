import "./App.css";
import WarningIcon from "./components/WarningIcon/WarningIcon.jsx";
import WarningModal from "./components/WarningModal/WarningModal.jsx";
import WeatherPage from "./pages/WeatherPage.jsx";
import DetailsPage from "./pages/DetailsPage.jsx";
import InfoPage from "./pages/InfoPage.jsx";
import { useEffect, useState, useRef } from "react";

const DEV_BASE_URL = "http://localhost:3000/v1/weather?days=5&";
const API_BASE_URL = `https://api.alexbierhance.com/v1/weather?days=5&`;

const createApiUrl = ({ lat, lon }, measureValue) => {
  const units = measureValue == "°C" ? "metric" : "imperial";
  return `${DEV_BASE_URL}lat=${lat}&lon=${lon}&units=${units}`;
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
  const [pollution, setPollution] = useState(null);
  const [activeNav, setActiveNav] = useState("weather");
  const abortControllerRef = useRef(null);

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
      setCity(data.currentWeather.location?.name || "Unknown");
      setLoading(false);
      setPrecipitation(data.currentWeather.precipitation?.amount || 0);
    }
    if (data.currentPollution) {
      setPollution(data.currentPollution);
    }
    if (data.forecastWeather?.list) {
      setForecast(Object.values(data.forecastWeather.list));
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

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-x-hidden">
      {/* TopAppBar */}
      <header className="bg-background flex justify-between items-center px-4 py-4 w-full box-border">
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

      <main className="px-4 pb-32 w-full box-border flex-1 max-w-[1200px] mx-auto">
        {activeNav === "weather" && (
          <WeatherPage 
            loading={loading}
            weather={weather}
            precipitation={precipitation}
            forecast={forecast}
            distanceTime={distanceTime}
          />
        )}
        {activeNav === "details" && (
          <DetailsPage
            loading={loading}
            weather={weather}
            forecast={forecast}
            distanceTime={distanceTime}
            measure={measure}
            pollution={pollution}
          />
        )}
        {activeNav === "info" && (
          <InfoPage
            loading={loading}
            weather={weather}
            weatherWarning={weatherWarning}
          />
        )}
      </main>

      {/* BottomNavBar */}
      <nav className="fixed bottom-5 z-50 flex justify-around items-center px-2 pb-3 pt-3 bg-background/60 backdrop-blur-xl rounded-t-3xl shadow-[0_-10px_30px_rgba(0,0,0,0.08)] w-full box-border">
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
          onClick={() => setActiveNav("info")}
          className={`flex flex-col items-center justify-center p-3 rounded-2xl transition-all duration-200 ${
            activeNav === "info" 
              ? 'bg-surface-variant text-tertiary' 
              : 'text-outline-variant hover:text-primary'
          }`}
        >
          <span className="material-symbols-outlined">info</span>
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
