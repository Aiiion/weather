import { translateEpochDayShort } from "../helpers.js";

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

function DetailsPage({ loading, weather, forecast, distanceTime, measure, pollution }) {
  // Build 3-day summary from forecast data
  const getDailyForecast = () => {
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
            humidity: h.humidity,
            wind: Math.round(h.wind.speed),
          })),
        };
      });
  };

  const dailyForecast = getDailyForecast();

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

  const allHours = dailyForecast.flatMap((d) => d.hourlyData);

  const tempPath = buildChartPath((h) => h.temp, allHours);
  const humidityPath = buildChartPath((h) => h.humidity, allHours);
  const windPath = buildChartPath((h) => h.wind, allHours);

  const currentTemp = weather ? Math.round(weather.temperature.temp) : null;
  const currentDesc = weather?.description ?? null;
  const currentHumidity = weather?.humidity ?? null;
  const currentWind = weather?.wind?.speed ?? null;
  const pressure = weather?.pressure ?? null;
  const sunrise = weather?.sunrise ?? null;
  const sunset = weather?.sunset ?? null;
  const visibilityM = weather?.visibility ?? null; // meters
  const visibilityFormatted = visibilityM != null
    ? measure === "°F"
      ? `${(visibilityM / 1609.34).toFixed(1)} mi`
      : `${(visibilityM / 1000).toFixed(1)} km`
    : null;
  const visibilityLabel = visibilityM != null
    ? visibilityM >= 10000
      ? "Perfectly clear"
      : visibilityM >= 5000
      ? "Good"
      : visibilityM >= 2000
      ? "Moderate"
      : "Poor"
    : null;
  const uvIndex = weather?.uv ?? null;
  const uvLabel = uvIndex != null
    ? uvIndex >= 11
      ? "Extreme"
      : uvIndex >= 8
      ? "Very High"
      : uvIndex >= 6
      ? "High"
      : uvIndex >= 3
      ? "Moderate"
      : "Low"
    : null;

  // Max/min across today's forecast
  const todayData = dailyForecast[0];
  const highTemp = todayData?.maxTemp ?? null;
  const lowTemp = todayData?.minTemp ?? null;

  const windDeg = weather?.wind?.deg ?? null;
  const getWindDirection = (deg) => {
    if (deg == null) return null;
    const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
    return dirs[Math.round(deg / 45) % 8];
  };
  const windDir = getWindDirection(windDeg);

  const formatTime = (epoch) => {
    if (!epoch) return "--";
    const date = new Date(epoch * 1000);
    let h = date.getHours();
    const m = date.getMinutes().toString().padStart(2, "0");
    const ampm = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
    return `${h}:${m} ${ampm}`;
  };

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
          <div className="p-5 bg-surface-container-low asymmetric-radius flex flex-col justify-between min-h-[120px]">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[1.25rem] text-on-surface-variant">light_mode</span>
              <span className="text-on-surface-variant font-['Inter'] text-[0.6875rem] font-bold uppercase tracking-[0.05em]">UV Index</span>
            </div>
            <div>
              <div className="text-[1.5rem] font-semibold text-on-surface">
                {loading ? skeleton() : uvIndex != null ? uvIndex : "N/A"}
              </div>
              <div className="text-on-tertiary-container text-[0.75rem]">
                {!loading && uvLabel ? uvLabel : !loading ? "Not available" : ""}
              </div>
            </div>
          </div>

          {/* Humidity */}
          <div className="p-5 bg-surface-container-low asymmetric-radius flex flex-col justify-between min-h-[120px]">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[1.25rem] text-on-surface-variant">humidity_percentage</span>
              <span className="text-on-surface-variant font-['Inter'] text-[0.6875rem] font-bold uppercase tracking-[0.05em]">Humidity</span>
            </div>
            <div>
              <div className="text-[1.5rem] font-semibold text-on-surface">
                {loading ? skeleton() : currentHumidity != null ? `${currentHumidity}%` : "--"}
              </div>
              <div className="text-on-tertiary-container text-[0.75rem]">
                {currentHumidity != null
                  ? currentHumidity > 80
                    ? "Very humid"
                    : currentHumidity > 60
                    ? "Humid"
                    : currentHumidity > 40
                    ? "Comfortable"
                    : "Dry"
                  : ""}
              </div>
            </div>
          </div>

          {/* Visibility */}
          <div className="p-5 bg-surface-container-low asymmetric-radius flex flex-col justify-between min-h-[120px]">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[1.25rem] text-on-surface-variant">visibility</span>
              <span className="text-on-surface-variant font-['Inter'] text-[0.6875rem] font-bold uppercase tracking-[0.05em]">Visibility</span>
            </div>
            <div>
              <div className="text-[1.5rem] font-semibold text-on-surface">
                {loading ? skeleton() : visibilityFormatted ?? "N/A"}
              </div>
              <div className="text-on-tertiary-container text-[0.75rem]">
                {!loading && visibilityLabel}
              </div>
            </div>
          </div>

          {/* Wind */}
          <div className="p-5 bg-surface-container-low asymmetric-radius flex flex-col justify-between min-h-[120px]">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[1.25rem] text-on-surface-variant">air</span>
              <span className="text-on-surface-variant font-['Inter'] text-[0.6875rem] font-bold uppercase tracking-[0.05em]">Wind</span>
            </div>
            <div>
              <div className="text-[1.5rem] font-semibold text-on-surface">
                {loading ? skeleton() : currentWind != null ? (
                  <>{currentWind.toFixed(1)} <span className="text-[0.875rem]">{distanceTime}</span></>
                ) : "--"}
              </div>
              <div className="text-on-tertiary-container text-[0.75rem]">
                {windDir ? `From ${windDir}` : ""}
              </div>
            </div>
          </div>

          {/* Pressure */}
          <div className="p-5 bg-surface-container-low asymmetric-radius flex flex-col justify-between min-h-[120px]">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[1.25rem] text-on-surface-variant">compress</span>
              <span className="text-on-surface-variant font-['Inter'] text-[0.6875rem] font-bold uppercase tracking-[0.05em]">Pressure</span>
            </div>
            <div>
              <div className="text-[1.5rem] font-semibold text-on-surface">
                {loading ? skeleton() : pressure != null ? `${pressure}` : "--"}
              </div>
              <div className="text-on-tertiary-container text-[0.75rem]">
                {pressure != null ? "hPa" : ""}
              </div>
            </div>
          </div>

          {/* Sunrise */}
          <div className="p-5 bg-surface-container-low asymmetric-radius flex flex-col justify-between min-h-[120px]">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[1.25rem] text-on-surface-variant">wb_sunny</span>
              <span className="text-on-surface-variant font-['Inter'] text-[0.6875rem] font-bold uppercase tracking-[0.05em]">Sunrise</span>
            </div>
            <div>
              <div className="text-[1.5rem] font-semibold text-on-surface">
                {loading ? skeleton() : formatTime(sunrise)}
              </div>
              <div className="text-on-tertiary-container text-[0.75rem]">
                {!loading && sunset ? `Sunset: ${formatTime(sunset)}` : ""}
              </div>
            </div>
          </div>
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
              <div className="w-2 h-2 rounded-full bg-secondary" />
              <span className="text-[0.625rem] text-on-surface-variant font-bold uppercase tracking-wider">Temp</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-tertiary" />
              <span className="text-[0.625rem] text-on-surface-variant font-bold uppercase tracking-wider">Humidity</span>
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
                aria-label="Temperature, humidity, and wind trend over the next three days"
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
                  className="text-secondary opacity-90"
                />
                {/* Humidity */}
                <path
                  d={humidityPath}
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
