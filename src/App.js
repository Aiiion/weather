import logo from './logo.svg';
import './App.css';
import View from './View.js';

const WEATHER_API_KEY = '79bcff7d3cdc32a45c5fc56923b9ae51';
const LOACTION_API_KEY = 'm9W0v1SEGJGYinwToG1OG1dzOEnRRirR';
const LOCATION_SECRET = '95mpGa4jzwDUGX1T';
const API_BASE_URL = `https://api.darksky.net/forecast/${WEATHER_API_KEY}`

const createApiUrl = ({lat, lng}) => {
  const latlng = `${lat},${lng}`
  return `${API_BASE_URL}/${latlng}?&units=si`
}



// const functionWithPromise = () => {
//   return new Promise(resolve => {
//     setTimeout(() => {
//       resolve({
//         lat: position.coords.latitude,
//         lng: position.coords.longitude
//       })
//     }, 3000);
//   })
// }
// const getWeatherByPosition = (position) =>{
//   fetch(createApiUrl({position.coords.latitude, position.coords.longitude}))
// }
const getLatLng = () => {
  return new Promise ((resolve, reject) => {
    if(navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(position => resolve({
        lat: position.coords.latitude,
        lng: position.coords.longitude
      })
      )
    }else{
      reject('Cant find your location, try allowing geolocation services in your brower')
    }
  })
}
const testFunction = () => {
  try {
    getLatLng().then(({lat, lng}) => console.log('does it work?', lat && lng, {lat, lng}))
  } catch (error) {
    console.log('failure')
  }
 
}
  testFunction()

const toJSON = response => response.json()

const getWeatherData= () =>{ 
  getLatLng()
  .then(createApiUrl)
  .then(fetch)
  .then(toJSON)
  .then(console.log);
}

  

function App() {
  return (
    
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
      
      </header>
      <View getWeatherData={getWeatherData}/>
    </div>
  );
}

export default App;
