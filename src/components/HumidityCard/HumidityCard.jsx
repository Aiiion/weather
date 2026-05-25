import { memo } from "react";

const getHumidityLabel = (humidity) => {
  if (humidity == null) return "";
  if (humidity > 80) return "Very humid";
  if (humidity > 60) return "Humid";
  if (humidity > 40) return "Comfortable";
  return "Dry";
};

function HumidityCard({ loading, humidity }) {
  return (
    <div className="p-5 bg-surface-container-low asymmetric-radius flex flex-col justify-between min-h-[120px]">
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-[1.25rem] text-on-surface-variant">humidity_percentage</span>
        <span className="text-on-surface-variant font-['Inter'] text-[0.6875rem] font-bold uppercase tracking-[0.05em]">Humidity</span>
      </div>
      <div>
        <div className="text-[1.5rem] font-semibold text-on-surface">
          {loading ? (
            <span className="inline-block h-6 w-12 bg-surface-container rounded animate-pulse" />
          ) : humidity != null ? `${humidity}%` : "--"}
        </div>
        <div className="text-on-tertiary-container text-[0.75rem]">
          {!loading && getHumidityLabel(humidity)}
        </div>
      </div>
    </div>
  );
}

export default memo(HumidityCard);
