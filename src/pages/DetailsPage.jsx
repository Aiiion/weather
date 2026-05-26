import { useMemo } from "react";
import { translateEpochDayShort } from "../helpers.js";
import WindCard from "../components/WindCard/WindCard.jsx";
import HumidityCard from "../components/HumidityCard/HumidityCard.jsx";
import UVIndexCard from "../components/UVIndexCard/UVIndexCard.jsx";
import VisibilityCard from "../components/VisibilityCard/VisibilityCard.jsx";
import PressureCard from "../components/PressureCard/PressureCard.jsx";
import SunriseCard from "../components/SunriseCard/SunriseCard.jsx";
import WeatherWarningsCard from "../components/WeatherWarningsCard/WeatherWarningsCard.jsx";

const AQI_LABELS = ["", "Good", "Fair", "Moderate", "Poor", "Very Poor"];
const AQI_DESCRIPTIONS = [
  "",
  "Air quality is satisfactory, and air pollution poses little or no risk.",
  "Air quality is acceptable. There may be a moderate health concern for a very small number of people.",
  "Members of sensitive groups may experience health effects. The general public is less likely to be affected.",
  "Everyone may begin to experience health effects. Members of sensitive groups may experience more serious effects.",
  "Health alert: everyone may experience more serious health effects.",
];

function AirQualityCard({ loading, pollution }) {
  const entry = pollution?.list?.[0];
  const aqi = entry?.main?.aqi ?? null;
  const label = aqi != null ? AQI_LABELS[aqi] : null;
  const description = aqi != null ? AQI_DESCRIPTIONS[aqi] : null;
  // Bar width: aqi 1-5 maps to 20%-100%
  const barWidth = aqi != null ? `${aqi * 20}%` : "0%";

  return (
    <section className="p-6 bg-surface-container-high asymmetric-radius flex flex-col md:flex-row md:items-center justify-between gap-6 border border-outline-variant/10">
      <div className="space-y-1">
        <span className="text-on-surface-variant font-['Inter'] text-[0.6875rem] font-bold uppercase tracking-[0.05em]">Air Quality</span>
        <div className="text-2xl font-bold text-tertiary">
          {loading ? (
            <span className="inline-block h-7 w-28 bg-surface-container rounded animate-pulse" />
          ) : label ? (
            `${aqi} - ${label}`
          ) : (
            "N/A"
          )}
        </div>
        <p className="text-on-surface-variant text-sm max-w-xs">
          {loading ? (
            <span className="inline-block h-4 w-48 bg-surface-container rounded animate-pulse" />
          ) : description ?? "Air quality data is not available from the current source."}
        </p>
      </div>
      <div className="relative w-32 h-2 bg-surface-container-lowest rounded-full overflow-hidden flex-shrink-0">
        <div
          className="absolute left-0 top-0 h-full bg-tertiary transition-all duration-500"
          style={{ width: barWidth }}
        />
      </div>
    </section>
  );
}

function DetailsPage({ loading, weather, forecast, distanceTime, measure, pollution, weatherWarning }) {
  const dailyForecast = useMemo(() => {
    if (!forecast || forecast.length === 0) return [];
    return forecast
      .filter((dayData) => dayData.length > 0)
      .slice(0, 3)
      .map((dayData, idx) => {
        const firstEntry = dayData[0];
        const noonEntry =
          dayData.find((h) => {
            const hour = new Date(h.dt * 1000).getHours();
            return hour >= 12 && hour <= 15;
          }) || firstEntry;
        const temps = dayData.map((h) => h.temperature.temp);
        const maxTemp = Math.round(Math.max(...temps));
        const minTemp = Math.round(Math.min(...temps));
        return {
          label: idx === 0 ? "Today" : translateEpochDayShort(firstEntry.dt),
          maxTemp,
          minTemp,
          hourlyData: dayData.map((h) => ({
            dt: h.dt,
            temp: Math.round(h.temperature.temp),
            wind: Math.round(h.wind.speed),
          })),
        };
      });
  }, [forecast]);

  // Build SVG chart points from real hourly data (temp, humidity, wind) across 3 days
  const buildChartPath = (getValue, allHours) => {
    if (!allHours || allHours.length < 2) return "";
    const values = allHours.map(getValue);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;
    const step = 1100 / (allHours.length - 1);
    return allHours
      .map((h, i) => {
        const x = Math.round(i * step);
        // Map to 10-90 range (inverted: higher value = lower y)
        const y = Math.round(90 - ((getValue(h) - min) / range) * 80);
        return `${i === 0 ? "M" : "L"} ${x},${y}`;
      })
      .join(" ");
  };

  const allHours = useMemo(
    () => dailyForecast.flatMap((d) => d.hourlyData),
    [dailyForecast]
  );

  const tempPath = useMemo(() => buildChartPath((h) => h.temp, allHours), [allHours]);
  const windPath = useMemo(() => buildChartPath((h) => h.wind, allHours), [allHours]);

  const currentTemp = weather ? Math.round(weather.temperature.temp) : null;
  const currentDesc = weather?.description ?? null;
  const currentHumidity = weather?.humidity ?? null;
  const currentWind = weather?.wind?.speed ?? null;
  const pressure = weather?.pressure ?? null;
  const sunrise = weather?.sunrise ?? null;
  const sunset = weather?.sunset ?? null;
  const visibilityM = weather?.visibility ?? null; // meters
  const uvIndex = weather?.uv ?? null;

  // Max/min across today's forecast
  const todayData = dailyForecast[0];
  const highTemp = todayData?.maxTemp ?? null;
  const lowTemp = todayData?.minTemp ?? null;

  const windGust = weather?.wind?.gust ?? null;
  const windDeg = weather?.wind?.deg ?? null;

  const skeleton = (w = "w-16") => (
    <span className={`inline-block h-6 ${w} bg-surface-container rounded animate-pulse`} />
  );

  return (
    <div className="space-y-16 pb-4">
      {/* Hero */}
      <section className="flex flex-col items-center text-center space-y-2">
        <div className="text-primary font-medium text-[3.5rem] tracking-tight mb-4">
          {loading ? skeleton("w-24") : currentTemp != null ? `${currentTemp}°` : "--"}
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-on-surface-variant font-['Inter'] text-[0.6875rem] font-bold uppercase tracking-[0.05em] capitalize">
            {loading ? skeleton("w-28") : currentDesc ?? "--"}
          </span>
          <span className="text-on-primary-container font-['Inter'] text-[0.6875rem] font-bold uppercase tracking-[0.05em]">
            {loading
              ? skeleton("w-20")
              : highTemp != null && lowTemp != null
              ? `H:${highTemp}° L:${lowTemp}°`
              : "--"}
          </span>
        </div>
      </section>

      {/* Atmospheric Details grid */}
      <section className="space-y-6">
        <h3 className="text-on-surface font-['Inter'] text-base font-semibold">Atmospheric Details</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {/* UV Index */}
          <UVIndexCard loading={loading} uvIndex={uvIndex} />

          {/* Humidity */}
          <HumidityCard loading={loading} humidity={currentHumidity} />

          {/* Visibility */}
          <VisibilityCard loading={loading} visibilityM={visibilityM} measure={measure} />

          {/* Wind */}
          <WindCard loading={loading} speed={currentWind} gust={windGust} deg={windDeg} distanceTime={distanceTime} />

          {/* Pressure */}
          <PressureCard loading={loading} pressure={pressure} />

          {/* Warnings */}
          <WeatherWarningsCard loading={loading} weatherWarning={weatherWarning} />

          {/* Sunrise / Sunset */}
          <SunriseCard loading={loading} sunrise={sunrise} sunset={sunset} className="col-span-2 md:col-span-1" />
        </div>
      </section>

      {/* Air Quality */}
      <AirQualityCard loading={loading} pollution={pollution} />

      {/* 3-Day Condition Tracking Chart */}
      <section className="space-y-6">
        <div className="flex justify-between items-end">
          <h3 className="text-on-surface font-['Inter'] text-base font-semibold">3-Day Condition Tracking</h3>
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-tertiary" />
              <span className="text-[0.625rem] text-on-surface-variant font-bold uppercase tracking-wider">Temp</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary-fixed-dim" />
              <span className="text-[0.625rem] text-on-surface-variant font-bold uppercase tracking-wider">Wind</span>
            </div>
          </div>
        </div>

        <div className="bg-surface-container-low asymmetric-radius p-6 h-64 flex flex-col justify-between relative overflow-hidden">
          {/* Grid lines */}
          <div className="absolute inset-x-6 inset-y-12 flex flex-col justify-between pointer-events-none">
            <div className="w-full h-px bg-outline-variant/10" />
            <div className="w-full h-px bg-outline-variant/10" />
            <div className="w-full h-px bg-outline-variant/10" />
            <div className="w-full h-px bg-outline-variant/10" />
          </div>

          {/* SVG Chart */}
          <div className="relative flex-1 mt-6 mb-2">
            {loading || allHours.length === 0 ? (
              <div className="w-full h-full bg-surface-container rounded animate-pulse" />
            ) : (
              <svg
                className="w-full h-full overflow-visible"
                viewBox="0 0 1100 100"
                preserveAspectRatio="none"
                role="img"
                aria-label="Temperature and wind trend over the next three days"
              >
                {/* Vertical grid lines */}
                <g className="opacity-10 stroke-outline-variant">
                  {[0, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1100].map((x) => (
                    <line key={x} x1={x} x2={x} y1="0" y2="100" strokeWidth="1" />
                  ))}
                </g>
                {/* Temperature */}
                <path
                  d={tempPath}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-tertiary opacity-90"
                />
                {/* Wind */}
                <path
                  d={windPath}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeDasharray="4 2"
                  className="text-primary-fixed-dim opacity-90"
                />
              </svg>
            )}
          </div>

          {/* X-Axis Labels */}
          <div className="flex justify-between pt-4 border-t border-outline-variant/10">
            {dailyForecast.length > 0
              ? dailyForecast.flatMap((day, di) => [
                  <span
                    key={`day-${di}`}
                    className="text-on-surface-variant font-['Inter'] text-[0.6rem] font-bold uppercase tracking-tight"
                  >
                    {day.label}
                  </span>,
                  <span key={`${di}-6a`} className="text-on-surface-variant/40 font-['Inter'] text-[0.5rem] font-bold uppercase tracking-tight">6a</span>,
                  <span key={`${di}-12p`} className="text-on-surface-variant/40 font-['Inter'] text-[0.5rem] font-bold uppercase tracking-tight">12p</span>,
                  <span key={`${di}-6p`} className="text-on-surface-variant/40 font-['Inter'] text-[0.5rem] font-bold uppercase tracking-tight">6p</span>,
                ])
              : ["Today", "6a", "12p", "6p", "Day 2", "6a", "12p", "6p", "Day 3", "6a", "12p", "6p"].map((l, i) => (
                  <span
                    key={i}
                    className={`font-['Inter'] text-[0.5rem] font-bold uppercase tracking-tight ${
                      i % 4 === 0 ? "text-on-surface-variant" : "text-on-surface-variant/40"
                    }`}
                  >
                    {l}
                  </span>
                ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default DetailsPage;
