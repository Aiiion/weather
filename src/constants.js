export const DEV_BASE_URL = "http://localhost:3000/v1/weather?days=5&";
export const API_BASE_URL = "https://api.alexbierhance.com/v1/weather?days=5&";

export const BASE_URL =
  import.meta.env.VITE_ENV === "dev" ? DEV_BASE_URL : API_BASE_URL;
