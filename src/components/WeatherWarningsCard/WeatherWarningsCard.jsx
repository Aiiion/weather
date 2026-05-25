import { memo } from "react";
import WarningIcon from "../WarningIcon/WarningIcon.jsx";

const SEVERITY_LABELS = {
  YELLOW: "Yellow",
  ORANGE: "Orange",
  RED: "Red",
};

function WeatherWarningsCard({ loading, weatherWarning }) {
  const severityLabel = weatherWarning
    ? (SEVERITY_LABELS[weatherWarning.severity] ?? weatherWarning.severity)
    : "None";
  const sublabel = weatherWarning?.description ?? "No active warnings";

  return (
    <div className="p-5 bg-surface-container-low asymmetric-radius flex flex-col justify-between min-h-[120px]">
      <div className="flex items-center gap-2">
        {weatherWarning ? (
          <WarningIcon color={weatherWarning.severity} size="1.25rem" className="flex-shrink-0" />
        ) : (
          <span className="material-symbols-outlined text-[1.25rem] text-on-surface-variant">warning</span>
        )}
        <span className="text-on-surface-variant font-['Inter'] text-[0.6875rem] font-bold uppercase tracking-[0.05em]">Warnings</span>
      </div>
      <div>
        <div className="text-[1.5rem] font-semibold text-on-surface">
          {loading ? (
            <span className="inline-block h-6 w-16 bg-surface-container rounded animate-pulse" />
          ) : severityLabel}
        </div>
        <div className="text-on-tertiary-container text-[0.75rem]">
          {!loading && sublabel}
        </div>
      </div>
    </div>
  );
}

export default memo(WeatherWarningsCard);

