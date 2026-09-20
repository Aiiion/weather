import { useState } from "react";
import WarningModal from "../WarningModal/WarningModal.jsx";
import { LOCATIONS_URL } from "../../constants.js";

// Saves the currently displayed location to the API under a user-chosen name.
// `providerName` is the place name the weather API reported for `coords`.
function SaveLocation({ onClose, providerName, coords }) {
  const [name, setName] = useState("");
  const [status, setStatus] = useState("idle"); // idle | saving | saved
  const [error, setError] = useState(null);

  const trimmedName = name.trim();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!trimmedName || status === "saving") return;

    setStatus("saving");
    setError(null);

    fetch(LOCATIONS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: trimmedName,
        provider_name: providerName,
        lat: Number(coords.lat),
        lon: Number(coords.lon),
      }),
    })
      .then(async (res) => {
        const body = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(body.message || `Request failed (${res.status})`);
        }
        return body;
      })
      .then(() => setStatus("saved"))
      .catch((err) => {
        setError(err.message || "Couldn't save location");
        setStatus("idle");
      });
  };

  return (
    <WarningModal open onClose={onClose}>
      <h2 className="font-['Inter'] text-[1.125rem] font-medium tracking-tight text-primary pr-8">
        Save location
      </h2>

      {status === "saved" ? (
        <>
          <p className="text-on-surface-variant text-sm mt-2">
            Saved as <span className="text-on-surface font-medium">“{trimmedName}”</span>.
            You can find it from search.
          </p>
          <div className="flex justify-end mt-6">
            <button
              onClick={onClose}
              className="text-sm font-semibold text-on-primary bg-primary px-4 py-2 rounded-full transition-opacity hover:opacity-90"
            >
              Done
            </button>
          </div>
        </>
      ) : (
        <form onSubmit={handleSubmit}>
          <p className="text-on-surface-variant text-sm mt-2">
            Give this location a name so you can find it again from search.
          </p>
          <p className="text-on-surface-variant text-xs mt-2 flex items-start gap-1.5">
            <span className="material-symbols-outlined text-[1rem] shrink-0">public</span>
            <span>
              Saved locations are shared: the name and coordinates will be visible to
              everyone who uses this app, and they can't be deleted once saved.
            </span>
          </p>
          <input
            type="text"
            autoFocus
            required
            maxLength={100}
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Escape" && onClose()}
            placeholder="e.g. Home, Cabin, Office"
            aria-label="Location name"
            className="mt-4 w-full bg-surface-container-low border border-surface-container-high rounded-full px-4 py-2 text-sm text-on-surface placeholder:text-on-surface-variant focus:border-primary focus:ring-0 focus:outline-none"
          />
          <p className="text-on-surface-variant text-xs mt-3 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[1rem]">location_on</span>
            <span className="truncate">
              {providerName} · {coords.lat}, {coords.lon}
            </span>
          </p>

          {error && <p className="text-error text-sm mt-3">{error}</p>}

          <div className="flex justify-end gap-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="text-sm font-medium text-on-surface-variant hover:text-primary px-4 py-2 rounded-full transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!trimmedName || status === "saving"}
              className="text-sm font-semibold text-on-primary bg-primary px-4 py-2 rounded-full transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status === "saving" ? "Saving…" : "Save"}
            </button>
          </div>
        </form>
      )}
    </WarningModal>
  );
}

export default SaveLocation;
