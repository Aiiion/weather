import logo from './logo.svg';
import './App.css';

// const API_ENDPOINT = 'https://opendata-download-metobs.smhi.se/api/version/1.0/parameter/1/station/98230/period/latest-hour/data.json';

  // const data = fetch(`${API_ENDPOINT}`)
  const data = fetch('https://opendata-download-metobs.smhi.se/api/version/1.0/parameter/1/station/98230/period/latest-hour/data.json')
  .then((response) => response.json())
  .then(data => console.log(data));


function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        {/* {data.map(weather => <div>{weather.value}</div>)} */}
        <p>{data.parameter.key}</p>
      </header>
    </div>
  );
}

export default App;
