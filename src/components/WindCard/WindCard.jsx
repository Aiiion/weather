const getWindDirection = (deg) => {
  if (deg == null) return null;
  const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  return dirs[Math.round(deg / 45) % 8];
};

function WindCard({ loading, speed, gust, deg, distanceTime }) {
  const windDir = getWindDirection(deg);

  return (
    <div className="p-5 bg-surface-container-low asymmetric-radius flex flex-col justify-between min-h-[120px]">
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-[1.25rem] text-on-surface-variant">air</span>
        <span className="text-on-surface-variant font-['Inter'] text-[0.6875rem] font-bold uppercase tracking-[0.05em]">Wind</span>
      </div>
      <div>
        <div className="text-[1.5rem] font-semibold text-on-surface">
          {loading ? (
            <span className="inline-block h-6 w-16 bg-surface-container rounded animate-pulse" />
          ) : speed != null ? (
            <>{speed.toFixed(1)} <span className="text-[0.875rem]">{distanceTime}</span></>
          ) : "--"}
        </div>
        <div className="text-on-tertiary-container text-[0.75rem]">
          {!loading && windDir ? `From ${windDir}` : ""}
          {!loading && gust != null && (
            <span>{windDir ? " · " : ""}Gusts {gust.toFixed(1)} {distanceTime}</span>
          )}
        </div>
      </div>
    </div>
  );
}

export default WindCard;
