import { useEffect, useRef, useState } from "react";
import WarningModal from "../WarningModal/WarningModal.jsx";
import { LOCATIONS_URL } from "../../constants.js";

const DEBOUNCE_MS = 300;

const rowClass =
  "w-full flex items-center gap-3 p-3 rounded-xl text-left transition-colors";

// Searches locations saved in the API. `onSelect(location)` picks a saved
// location; `onSelect(null)` switches back to the device's own location.
function LocationSearch({ onClose, onSelect, selectedLocation }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  // The trimmed query the current `results` were fetched for
  const [resultsQuery, setResultsQuery] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const trimmed = query.trim();
    const url = trimmed
      ? `${LOCATIONS_URL}?search=${encodeURIComponent(trimmed)}`
      : LOCATIONS_URL;

    setLoading(true);
    setError(false);

    // No debounce for the initial (empty) listing so the dialog fills immediately
    const timer = setTimeout(() => {
      fetch(url, { signal: controller.signal })
        .then((res) => {
          if (!res.ok) throw new Error(`Request failed (${res.status})`);
          return res.json();
        })
        .then(({ data }) => {
          setResults(Array.isArray(data) ? data : []);
          setResultsQuery(trimmed);
          setLoading(false);
        })
        .catch((err) => {
          if (err.name === "AbortError") return;
          setError(true);
          setLoading(false);
        });
    }, trimmed ? DEBOUNCE_MS : 0);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  const trimmedQuery = query.trim();
  const resultsAreCurrent = !loading && !error && resultsQuery === trimmedQuery;

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      onClose();
    } else if (e.key === "Enter" && resultsAreCurrent && results.length > 0) {
      onSelect(results[0]);
    }
  };

  return (
    <WarningModal open onClose={onClose}>
      <h2 className="font-['Inter'] text-[1.125rem] font-medium tracking-tight text-primary pr-8">
        Saved locations
      </h2>
      <input
        type="search"
        autoFocus
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Search by name…"
        aria-label="Search saved locations"
        className="mt-4 w-full bg-surface-container-low border border-surface-container-high rounded-full px-4 py-2 text-sm text-on-surface placeholder:text-on-surface-variant focus:border-primary focus:ring-0 focus:outline-none"
      />

      <div className="mt-3 max-h-[50vh] overflow-y-auto space-y-1">
        {selectedLocation && (
          <button
            onClick={() => onSelect(null)}
            className={`${rowClass} text-on-surface-variant hover:text-primary hover:bg-surface-container-high`}
          >
            <span className="material-symbols-outlined">my_location</span>
            <span className="text-sm font-medium">Use my location</span>
          </button>
        )}

        {loading && (
          <p className="text-on-surface-variant text-sm px-3 py-2">Searching…</p>
        )}

        {!loading && error && (
          <p className="text-error text-sm px-3 py-2">Couldn't load saved locations.</p>
        )}

        {!loading && !error && results.length === 0 && (
          <p className="text-on-surface-variant text-sm px-3 py-2">
            {trimmedQuery
              ? `No saved locations match “${trimmedQuery}”.`
              : "No saved locations yet. Use + to save your current location."}
          </p>
        )}

        {!loading && !error &&
          results.map((location) => {
            const isActive = selectedLocation?.id === location.id;
            return (
              <button
                key={location.id}
                onClick={() => onSelect(location)}
                aria-current={isActive ? "true" : undefined}
                className={`${rowClass} ${
                  isActive
                    ? "bg-surface-variant text-tertiary"
                    : "text-on-surface hover:bg-surface-container-high"
                }`}
              >
                <span className="material-symbols-outlined shrink-0">bookmark</span>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-medium truncate">{location.name}</span>
                  {location.provider_name &&
                    location.provider_name !== location.name && (
                      <span className="text-on-surface-variant text-xs truncate">
                        {location.provider_name}
                      </span>
                    )}
                </div>
              </button>
            );
          })}
      </div>
    </WarningModal>
  );
}

export default LocationSearch;
