const API_ORIGIN = "https://api.alexbierhance.com";
const DEV_ORIGIN = "http://localhost:3000";
const ORIGIN = import.meta.env.VITE_ENV === "dev" ? DEV_ORIGIN : API_ORIGIN;

export const BASE_URL = `${ORIGIN}/v1/weather?days=5&`;
export const IP_LOCATION_URL = `${API_ORIGIN}/ip-location`;
