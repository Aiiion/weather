import './App.css';



function ViewComponent({getWeatherData}) {
    getWeatherData();
    return (
      
      <div className="App">
        <p>view here</p>
        
      </div>
    );
  }
  
  export default ViewComponent;