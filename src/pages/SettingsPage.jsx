import { CARD_DEFAULTS } from "../hooks/useCardSettings.js";

const CARD_LABELS = {
  Wind: { label: "Wind", icon: "air" },
  Humidity: { label: "Humidity", icon: "humidity_percentage" },
  Sunrise: { label: "Sunrise & Sunset", icon: "wb_twilight" },
  UVIndex: { label: "UV Index", icon: "light_mode" },
  Visibility: { label: "Visibility", icon: "visibility" },
  Pressure: { label: "Pressure", icon: "compress" },
  WeatherWarnings: { label: "Weather Warnings", icon: "warning" },
};

function Toggle({ enabled, onToggle, label }) {
  return (
    <button
      role="switch"
      aria-checked={enabled}
      aria-label={`Toggle ${label}`}
      onClick={onToggle}
      className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
        enabled ? "bg-primary" : "bg-surface-container-highest"
      }`}
    >
      <span
        className={`inline-block h-5 w-5 rounded-full bg-background shadow transition-transform duration-200 ${
          enabled ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}

const UNITS = ["°C", "°F"];

function UnitToggle({ measure, onChange }) {
  return (
    <div className="flex items-center bg-background rounded-full p-1">
      {UNITS.map((unit) => (
        <button
          key={unit}
          onClick={() => onChange(unit)}
          aria-pressed={measure === unit}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 ${
            measure === unit
              ? "bg-surface-variant text-tertiary"
              : "text-on-surface-variant hover:text-primary"
          }`}
        >
          {unit}
        </button>
      ))}
    </div>
  );
}

function SettingsPage({ settings, onToggle, measure, onMeasureChange }) {
  return (
    <div className="space-y-10 pb-4">
      <div className="space-y-4">
        <section className="space-y-1">
          <h2 className="font-['Inter'] text-[1.125rem] font-medium tracking-tight text-primary">
            Units
          </h2>
          <p className="text-on-surface-variant text-sm">
            Temperature and wind speed units used across the app.
          </p>
        </section>

        <section>
          <div className="flex items-center justify-between p-4 bg-surface-container-low asymmetric-radius">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[1.25rem] text-on-surface-variant">
                thermostat
              </span>
              <div className="flex flex-col">
                <span className="text-on-surface text-sm font-medium">Temperature</span>
                <span className="text-on-surface-variant text-xs">
                  {measure === "°F" ? "Fahrenheit, wind in mph" : "Celsius, wind in m/s"}
                </span>
              </div>
            </div>
            <UnitToggle measure={measure} onChange={onMeasureChange} />
          </div>
        </section>
      </div>

      <div className="space-y-4">
        <section className="space-y-1">
          <h2 className="font-['Inter'] text-[1.125rem] font-medium tracking-tight text-primary">
            Cards
          </h2>
          <p className="text-on-surface-variant text-sm">
            Choose which cards appear on the Landing page.
          </p>
        </section>

        <section className="space-y-2">
          {Object.entries(CARD_LABELS).map(([key, { label, icon }]) => {
            const isDefault = CARD_DEFAULTS[key];
            return (
              <div
                key={key}
                className="flex items-center justify-between p-4 bg-surface-container-low asymmetric-radius"
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[1.25rem] text-on-surface-variant">
                    {icon}
                  </span>
                  <div className="flex flex-col">
                    <span className="text-on-surface text-sm font-medium">{label}</span>
                    {isDefault && (
                      <span className="text-on-surface-variant text-xs">Shown by default</span>
                    )}
                  </div>
                </div>
                <Toggle
                  enabled={settings[key]}
                  onToggle={() => onToggle(key)}
                  label={label}
                />
              </div>
            );
          })}
        </section>
      </div>
    </div>
  );
}

export default SettingsPage;
