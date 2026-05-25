import { useState, useMemo } from "react";
import Tooltip from "../components/Tooltip/Tooltip.jsx";
import WindCard from "../components/WindCard/WindCard.jsx";
import HumidityCard from "../components/HumidityCard/HumidityCard.jsx";
import { translateEpochTime, translateEpochDayShort, getWeatherIcon } from "../helpers.js";

const formatPrecipitation = (amount) => {
  if (amount === 0) return "0mm";
  if (amount > 0 && amount < 0.1) return "<0.1mm";
  return `${Math.round(amount * 10) / 10}mm`;
};

function WeatherPage({ loading, weather, precipitation, forecast, distanceTime }) {
  const [expandedDay, setExpandedDay] = useState(null);

  const dailyForecast = useMemo(() => {
    return forecast.filter(dayData => dayData.length > 0).map((dayData, idx) => {
      const firstEntry = dayData[0];
      // Find entry closest to midday (12:00-15:00 range typical in 3-hour data)
      const noonEntry = dayData.find(h => {
        const hour = new Date(h.dt * 1000).getHours();
        return hour >= 12 && hour <= 15;
      }) || firstEntry;
      const temps = dayData.map(h => h.temperature.temp);
      const maxTemp = Math.round(Math.max(...temps));
      const minTemp = Math.round(Math.min(...temps));
      // Calculate total precipitation for the day
      const totalPrecipitation = dayData.reduce((sum, h) => sum + (h.precipitation?.amount || 0), 0);
      
      // Create weather object for icon function
      const noonWeatherObj = { icon: noonEntry.icon, weather: noonEntry.weather, description: noonEntry.description };
      
      return {
        day: translateEpochDayShort(firstEntry.dt),
        icon: getWeatherIcon(noonWeatherObj),
        maxTemp,
        minTemp,
        precipitation: Math.round(totalPrecipitation * 10) / 10,
        isFirst: idx === 0,
        hourlyData: dayData.map(hour => {
          const weatherObj = { icon: hour.icon, weather: hour.weather, description: hour.description };
          return {
            time: translateEpochTime(hour.dt),
            temp: Math.round(hour.temperature.temp),
            feelsLike: Math.round(hour.temperature.feels_like),
            description: hour.description,
            icon: getWeatherIcon(weatherObj),
            wind: Math.round(hour.wind.speed),
            gust: Math.round(hour.wind.gust),
            humidity: hour.humidity,
            precipitation: hour.precipitation?.amount || 0
          };
        })
      };
    });
  }, [forecast]);

  const toggleDayExpanded = (idx) => {
    setExpandedDay(expandedDay === idx ? null : idx);
  };

  return (
    <>
      {/* Hero Temperature Section */}
      <section className="flex flex-col items-center mb-16 lg:mb-20">
        {loading ? (
          <div className="h-36 w-48 bg-surface-container-low rounded-xl animate-pulse"></div>
        ) : weather ? (
          <div className="relative">
            <span className="text-[clamp(6rem,20vw,9rem)] font-medium text-primary tracking-tighter leading-none">
              {Math.floor(weather.temperature.temp)}°
            </span>
            <div className="absolute -top-4 -right-8">
              <span className="material-symbols-outlined text-secondary text-5xl">
                {getWeatherIcon({ icon: weather.icon, weather: weather.weather, description: weather.description })}
              </span>
            </div>
          </div>
        ) : null}
        <p className="font-['Inter'] text-[0.6875rem] font-bold uppercase tracking-[0.05em] text-on-surface-variant mt-4">
          {loading ? (
            <span className="inline-block h-4 w-24 bg-surface-container-low rounded animate-pulse"></span>
          ) : weather ? (
            <>
              feels like {Math.floor(weather.temperature.feels_like)}°
              {precipitation > 0 && (
                <span className="ml-2">
                  • {formatPrecipitation(precipitation)}/h
                  {weather.precipitation?.type === 'snow' && (
                    <Tooltip
                      text="While snow is measured in mm, 1 mm of snow is approximately equivalent to 1 cm of snow depth."
                      ariaLabel="Snow measurement info"
                      icon="info"
                    />
                  )}
                </span>
              )}
            </>
          ) : null}
        </p>
        {!loading && weather?.description && (
          <p className="font-['Inter'] text-sm text-secondary mt-2 capitalize">
            {weather.description}
          </p>
        )}
      </section>

      {/* Bento Grid Data Points */}
      <section className="grid grid-cols-2 gap-4 mb-16 lg:grid-cols-4 lg:gap-6">
        {/* Wind */}
        <WindCard loading={loading} speed={weather?.wind?.speed} gust={weather?.wind?.gust} deg={weather?.wind?.deg} distanceTime={distanceTime} />

        {/* Humidity */}
        <HumidityCard loading={loading} humidity={weather?.humidity} />

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
                  translateEpochTime(weather.sunrise)
                ) : '--'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-semibold text-on-surface">
                {loading ? (
                  <span className="inline-block h-6 w-14 bg-surface-container-low rounded animate-pulse"></span>
                ) : weather ? (
                  translateEpochTime(weather.sunset)
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
            dailyForecast.map((day, idx) => (
              <div key={`${day.day}-${idx}`} className="space-y-0">
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
                        <span>{formatPrecipitation(day.precipitation)}</span>
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
                  <div id={`day-panel-${idx}`} className={`bg-surface-container p-4 rounded-3xl space-y-3 ${
                    day.isFirst ? 'border-t border-outline-variant/20' : ''
                  }`}>
                    {day.hourlyData.map((hour, hIdx) => (
                      <div key={`${day.day}-${hour.time}`} className="flex flex-col py-2 border-b border-outline-variant/10 last:border-b-0">
                        {/* Row 1: time, icon, description, temperature */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-bold text-on-surface-variant w-12">{hour.time.split(':')[0]}</span>
                            <Tooltip
                              text={hour.description}
                              ariaLabel={`Weather: ${hour.description}`}
                              icon={hour.icon}
                            />
                            <span className="text-sm text-on-surface capitalize">{hour.description}</span>
                          </div>
                          <span className="text-on-surface font-medium">{hour.temp}°</span>
                        </div>
                        {/* Row 2: precipitation, humidity, wind on left — feels like on right */}
                        <div className="flex items-center justify-between mt-1 text-xs text-on-surface-variant">
                          <div className="flex items-center gap-4">
                            <div className={`flex items-center gap-1 ${hour.precipitation > 0 ? '' : 'invisible'}`}>
                              <span className="material-symbols-outlined text-xs">water_drop</span>
                              <span>{formatPrecipitation(hour.precipitation)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-xs">humidity_percentage</span>
                              <span>{hour.humidity}%</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-xs">air</span>
                              <span>{hour.wind}{hour.gust ? ` (↑${hour.gust})` : ''}{distanceTime}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-xs">thermostat</span>
                            <span>Feels {hour.feelsLike}°</span>
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
    </>
  );
}

export default WeatherPage;
