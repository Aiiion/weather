import { useState, useCallback } from "react";

const STORAGE_PREFIX = "settings.cards.";

export const CARD_DEFAULTS = {
  Wind: true,
  Humidity: true,
  Sunrise: true,
  UVIndex: false,
  Visibility: false,
  Pressure: false,
  WeatherWarnings: false,
};

function readSettings() {
  const result = { ...CARD_DEFAULTS };
  try {
    for (const key of Object.keys(CARD_DEFAULTS)) {
      const stored = localStorage.getItem(STORAGE_PREFIX + key);
      if (stored !== null) {
        result[key] = stored === "true";
      }
    }
  } catch {
    return { ...CARD_DEFAULTS };
  }
  return result;
}

export function useCardSettings() {
  const [settings, setSettings] = useState(readSettings);

  const toggleCard = useCallback((cardKey) => {
    setSettings((prev) => {
      const next = { ...prev, [cardKey]: !prev[cardKey] };
      try {
        localStorage.setItem(STORAGE_PREFIX + cardKey, String(next[cardKey]));
      } catch {
        // storage unavailable; UI state still updates
      }
      return next;
    });
  }, []);

  return { settings, toggleCard };
}
