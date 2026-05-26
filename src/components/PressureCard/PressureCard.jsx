import { memo } from "react";

function PressureCard({ loading, pressure }) {
  return (
    <div className="p-5 bg-surface-container-low asymmetric-radius flex flex-col justify-between min-h-[120px]">
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-[1.25rem] text-on-surface-variant">compress</span>
        <span className="text-on-surface-variant font-['Inter'] text-[0.6875rem] font-bold uppercase tracking-[0.05em]">Pressure</span>
      </div>
      <div>
        <div className="text-[1.5rem] font-semibold text-on-surface">
          {loading ? (
            <span className="inline-block h-6 w-16 bg-surface-container rounded animate-pulse" />
          ) : pressure != null ? `${pressure}` : "--"}
        </div>
        <div className="text-on-tertiary-container text-[0.75rem]">
          {!loading && pressure != null ? "hPa" : ""}
        </div>
      </div>
    </div>
  );
}

export default memo(PressureCard);
