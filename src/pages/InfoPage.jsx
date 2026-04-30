const VERSION = "v1.1.0";

const formatProviders = (providers) => {
  if (!providers) return null;
  if (Array.isArray(providers)) return providers.join(", ");
  return String(providers);
};

function InfoPage({ weather, weatherWarning, loading, onBack }) {
  const weatherProvider = formatProviders(weather?.providers);
  const warningProviders = Array.isArray(weatherWarning?.providers)
    ? weatherWarning.providers
    : weatherWarning?.providers
    ? [String(weatherWarning.providers)]
    : null;

  return (
    <div className="pt-2 pb-4 space-y-16">
      {/* Data Sources */}
      <section className="space-y-8">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold tracking-[0.05em] uppercase text-on-surface-variant">
            Data Sources
          </h3>
          <span className="h-[1px] flex-grow ml-4 bg-outline-variant/15"></span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Weather Card */}
          <div className="asymmetric-radius bg-surface-container-low p-6 flex flex-col justify-between hover:bg-surface-container transition-colors duration-300">
            <div className="space-y-3">
              <span className="material-symbols-outlined text-secondary text-3xl">
                cloud_queue
              </span>
              <h4 className="text-lg font-semibold text-on-surface">Weather</h4>
              <p className="text-sm text-on-surface-variant">
                Real-time atmospheric modeling and hyper-local forecasting.
              </p>
            </div>
            <div className="mt-8">
              {loading ? (
                <span className="inline-block h-4 w-36 bg-surface-container rounded animate-pulse" />
              ) : (
                <span className="text-xs font-bold tracking-[0.05em] uppercase text-tertiary">
                  {weatherProvider ?? "OpenWeatherMap API"}
                </span>
              )}
            </div>
          </div>

          {/* Pollution Card */}
          <div className="asymmetric-radius bg-surface-container-low p-6 flex flex-col justify-between hover:bg-surface-container transition-colors duration-300">
            <div className="space-y-3">
              <span className="material-symbols-outlined text-secondary text-3xl">
                air
              </span>
              <h4 className="text-lg font-semibold text-on-surface">Pollution</h4>
              <p className="text-sm text-on-surface-variant">
                Global air quality monitoring and particulate matter analysis.
              </p>
            </div>
            <div className="mt-8">
              <span className="text-xs font-bold tracking-[0.05em] uppercase text-tertiary">
                OpenWeatherMap API
              </span>
            </div>
          </div>

          {/* Warnings Card */}
          <div className="asymmetric-radius bg-surface-container-low p-6 md:col-span-2 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:bg-surface-container transition-colors duration-300">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-error text-3xl">
                  warning
                </span>
                <h4 className="text-lg font-semibold text-on-surface">Warnings</h4>
              </div>
              <p className="text-sm text-on-surface-variant max-w-md">
                Critical alerts and meteorological hazards aggregated from national
                and global weather warning systems.
              </p>
            </div>
            <div className="flex gap-2 flex-wrap">
              {loading ? (
                <span className="inline-block h-6 w-24 bg-surface-container rounded-full animate-pulse" />
              ) : warningProviders ? (
                warningProviders.map((p) => (
                  <span
                    key={p}
                    className="px-3 py-1 bg-surface-container-highest rounded-full text-[10px] font-bold tracking-[0.05em] uppercase text-on-surface-variant"
                  >
                    {p}
                  </span>
                ))
              ) : (
                <>
                  <span className="px-3 py-1 bg-surface-container-highest rounded-full text-[10px] font-bold tracking-[0.05em] uppercase text-on-surface-variant">
                    NWS
                  </span>
                  <span className="px-3 py-1 bg-surface-container-highest rounded-full text-[10px] font-bold tracking-[0.05em] uppercase text-on-surface-variant">
                    GWS
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Engineering */}
      <section className="space-y-8">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold tracking-[0.05em] uppercase text-on-surface-variant">
            Engineering
          </h3>
          <span className="h-[1px] flex-grow ml-4 bg-outline-variant/15"></span>
        </div>

        <div className="space-y-4">
          <a
            className="group flex items-center justify-between p-5 asymmetric-radius bg-surface-container-low hover:bg-surface-container-highest transition-all duration-300"
            href="https://github.com/aiiion/express-api"
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-primary">
                <span className="material-symbols-outlined">terminal</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-on-surface">Backend Engine</p>
                <p className="text-xs text-on-surface-variant">
                  github.com/aiiion/express-api
                </p>
              </div>
            </div>
            <span className="material-symbols-outlined text-outline-variant group-hover:translate-x-1 transition-transform">
              chevron_right
            </span>
          </a>

          <a
            className="group flex items-center justify-between p-5 asymmetric-radius bg-surface-container-low hover:bg-surface-container-highest transition-all duration-300"
            href="https://github.com/aiiion/weather"
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-primary">
                <span className="material-symbols-outlined">layers</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-on-surface">Frontend Interface</p>
                <p className="text-xs text-on-surface-variant">
                  github.com/aiiion/weather
                </p>
              </div>
            </div>
            <span className="material-symbols-outlined text-outline-variant group-hover:translate-x-1 transition-transform">
              chevron_right
            </span>
          </a>
        </div>
      </section>
    </div>
  );
}

export default InfoPage;
