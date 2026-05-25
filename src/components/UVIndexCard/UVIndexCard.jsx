const getUVLabel = (uvIndex) => {
  if (uvIndex == null) return null;
  if (uvIndex >= 11) return "Extreme";
  if (uvIndex >= 8) return "Very High";
  if (uvIndex >= 6) return "High";
  if (uvIndex >= 3) return "Moderate";
  return "Low";
};

function UVIndexCard({ loading, uvIndex }) {
  const uvLabel = getUVLabel(uvIndex);

  return (
    <div className="p-5 bg-surface-container-low asymmetric-radius flex flex-col justify-between min-h-[120px]">
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-[1.25rem] text-on-surface-variant">light_mode</span>
        <span className="text-on-surface-variant font-['Inter'] text-[0.6875rem] font-bold uppercase tracking-[0.05em]">UV Index</span>
      </div>
      <div>
        <div className="text-[1.5rem] font-semibold text-on-surface">
          {loading ? (
            <span className="inline-block h-6 w-16 bg-surface-container rounded animate-pulse" />
          ) : uvIndex != null ? uvIndex : "N/A"}
        </div>
        <div className="text-on-tertiary-container text-[0.75rem]">
          {!loading && (uvLabel ?? "Not available")}
        </div>
      </div>
    </div>
  );
}

export default UVIndexCard;
