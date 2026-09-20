import { useState, useCallback } from "react";

const STORAGE_KEY = "settings.units";

const UNIT_LABELS = { metric: "°C", imperial: "°F" };
const DEFAULT_MEASURE = UNIT_LABELS.metric;

function readMeasure() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return UNIT_LABELS[stored] ?? DEFAULT_MEASURE;
  } catch {
    return DEFAULT_MEASURE;
  }
}

export function useUnits() {
  const [measure, setMeasureState] = useState(readMeasure);

  const setMeasure = useCallback((next) => {
    setMeasureState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next === "°F" ? "imperial" : "metric");
    } catch {
      // storage unavailable; UI state still updates
    }
  }, []);

  return { measure, setMeasure };
}
