export const translateEpochDay = (epoch) => {//translated the epoch value to the weekday of the date
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
}
export const trimIfPhone = (str) => {
  return window.innerWidth > 768 ? str : str.slice(0, 3);
}