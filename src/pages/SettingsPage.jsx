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

function SettingsPage({ settings, onToggle }) {
  return (
    <div className="space-y-10 pb-4">
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
  );
}

export default SettingsPage;
