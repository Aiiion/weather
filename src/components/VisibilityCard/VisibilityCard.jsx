const getVisibilityLabel = (visibilityM) => {
  if (visibilityM == null) return null;
  if (visibilityM >= 10000) return "Perfectly clear";
  if (visibilityM >= 5000) return "Good";
  if (visibilityM >= 2000) return "Moderate";
  return "Poor";
};

const formatVisibility = (visibilityM, measure) => {
  if (visibilityM == null) return null;
  return measure === "°F"
    ? `${(visibilityM / 1609.34).toFixed(1)} mi`
    : `${(visibilityM / 1000).toFixed(1)} km`;
};

function VisibilityCard({ loading, visibilityM, measure }) {
  const formatted = formatVisibility(visibilityM, measure);
  const label = getVisibilityLabel(visibilityM);

  return (
    <div className="p-5 bg-surface-container-low asymmetric-radius flex flex-col justify-between min-h-[120px]">
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-[1.25rem] text-on-surface-variant">visibility</span>
        <span className="text-on-surface-variant font-['Inter'] text-[0.6875rem] font-bold uppercase tracking-[0.05em]">Visibility</span>
      </div>
      <div>
        <div className="text-[1.5rem] font-semibold text-on-surface">
          {loading ? (
            <span className="inline-block h-6 w-16 bg-surface-container rounded animate-pulse" />
          ) : formatted ?? "N/A"}
        </div>
        <div className="text-on-tertiary-container text-[0.75rem]">
          {!loading && label}
        </div>
      </div>
    </div>
  );
}

export default VisibilityCard;
