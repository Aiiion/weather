import { memo } from "react";
import { translateEpochTime } from "../../helpers.js";

function SunriseCard({ loading, sunrise, sunset, className = "" }) {
  const daylightText = !loading && sunrise && sunset
    ? (() => {
        const totalMinutes = Math.round((sunset - sunrise) / 60);
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        return `${hours}h ${minutes}m of daylight`;
      })()
    : "";

  return (
    <div className={`p-5 bg-surface-container-low asymmetric-radius flex flex-col justify-between min-h-[120px] ${className}`}>
      <div className="flex justify-between items-start">
        <span className="text-on-surface-variant font-['Inter'] text-[0.6875rem] font-bold uppercase tracking-[0.05em]">Sunrise</span>
        <span className="text-on-surface-variant font-['Inter'] text-[0.6875rem] font-bold uppercase tracking-[0.05em]">Sunset</span>
      </div>
      <div>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-tertiary text-[1.25rem]">wb_twilight</span>
            <span className="text-[1.25rem] font-semibold text-on-surface">
              {loading ? (
                <span className="inline-block h-6 w-14 bg-surface-container rounded animate-pulse" />
              ) : translateEpochTime(sunrise)}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[1.25rem] font-semibold text-on-surface">
              {loading ? (
                <span className="inline-block h-6 w-14 bg-surface-container rounded animate-pulse" />
              ) : translateEpochTime(sunset)}
            </span>
            <span className="material-symbols-outlined text-secondary text-[1.25rem]">nights_stay</span>
          </div>
        </div>
        <div className="text-on-tertiary-container text-[0.75rem] mt-1">
          {daylightText}
        </div>
      </div>
    </div>
  );
}

export default memo(SunriseCard);
