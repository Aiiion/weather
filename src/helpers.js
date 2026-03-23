//translated the epoch value to the weekday of the date
export const translateEpochDay = (epoch) => {
  let newDate = new Date(epoch * 1000);

  switch (newDate.getDay()) {
    case 1:
      return "Monday";
    case 2:
      return "Tuesday";
    case 3:
      return "Wednesday";
    case 4:
      return "Thursday";
    case 5:
      return "Friday";
    case 6:
      return "Saturday";
    case 0:
      return "Sunday";
    default:
      return "error";
  }
};

//translates the epoch value to short weekday (3 letters)
export const translateEpochDayShort = (epoch) => {
  let newDate = new Date(epoch * 1000);

  switch (newDate.getDay()) {
    case 1:
      return "Mon";
    case 2:
      return "Tue";
    case 3:
      return "Wed";
    case 4:
      return "Thu";
    case 5:
      return "Fri";
    case 6:
      return "Sat";
    case 0:
      return "Sun";
    default:
      return "---";
  }
};

//translates the epoch value to time in hours and minutes
export const translateEpochTime = (epoch) => {
  if(!epoch) return "";
  let date = new Date(epoch * 1000);
  let hour = date.getHours();
  let minute = date.getMinutes();
  if (minute < 10) {
    minute = `0${minute}`;
  }
  if (hour < 10) {
    hour = `0${hour}`;
  }
  return `${hour}:${minute}`;
};

export const trimIfPhone = (str) => {
  return window.innerWidth > 768 ? str : str.slice(0, 3);
};

export const getCurrentPosition = () =>
  new Promise((resolve, reject) =>
    navigator.geolocation.getCurrentPosition(
      (position) =>
        resolve({
          lat: position.coords.latitude.toFixed(3),
          lon: position.coords.longitude.toFixed(3),
        }),
      () => {
        reject("Unable to retrieve your location");
      }
    )
  );

// Weather condition to icon mapping
// Accepts weather object with icon code (e.g., "01d") or falls back to description
export const getWeatherIconFromDescription = (description, isDay = true) => {
  const desc = description?.toLowerCase() || "";
  // Check thunder/storm before rain/drizzle to handle "thunderstorm with rain" correctly
  if (desc.includes("thunder") || desc.includes("storm")) return "thunderstorm";
  if (desc.includes("snow")) return "weather_snowy";
  if (desc.includes("rain") || desc.includes("drizzle")) return "rainy";
  if (desc.includes("mist") || desc.includes("fog") || desc.includes("haze")) return "foggy";
  if (desc.includes("cloud") && desc.includes("partly")) return isDay ? "partly_cloudy_day" : "partly_cloudy_night";
  if (desc.includes("cloud")) return "cloudy";
  if (desc.includes("clear") || desc.includes("sunny")) return isDay ? "wb_sunny" : "nights_stay";
  // Neutral default when context is unknown
  return "thermostat";
};

export const getWeatherIcon = (weatherData, isDay = true) => {
  // If passed a string (description only), use legacy fallback
  if (typeof weatherData === "string") {
    return getWeatherIconFromDescription(weatherData, isDay);
  }

  // Prefer icon code from API (e.g., "01d", "10n")
  const iconCode = weatherData?.icon;
  if (iconCode) {
    const isDayFromIcon = iconCode.endsWith("d");
    const code = iconCode.slice(0, 2);
    switch (code) {
      case "01": return isDayFromIcon ? "wb_sunny" : "nights_stay";
      case "02": return isDayFromIcon ? "partly_cloudy_day" : "partly_cloudy_night";
      case "03": return "cloudy";
      case "04": return "cloudy";
      case "09": return "rainy";
      case "10": return "rainy";
      case "11": return "thunderstorm";
      case "13": return "weather_snowy";
      case "50": return "foggy";
      default: break;
    }
  }

  // Fall back to description parsing
  return getWeatherIconFromDescription(weatherData?.description, isDay);
};
