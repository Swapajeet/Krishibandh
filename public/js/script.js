let chart;
const statusText = document.getElementById("status");
const loader = document.getElementById("loader");

// PAGE LOAD: GET LOCATION
window.onload = () => {
  if(!navigator.geolocation){
    statusText.innerText = " Location not supported";
    return;
  }
  loader.style.display = "block";

  navigator.geolocation.getCurrentPosition(pos => {
    const lat = pos.coords.latitude;
    const lon = pos.coords.longitude;

    loadWeather(lat, lon);
    loadMap(lat, lon); // add satellite map
  }, () => {
    loader.style.display = "none";
    statusText.innerText = " Location permission denied";
  });
}

// WEATHER API
function loadWeather(lat, lon){
  fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,windspeed_10m_max&timezone=Asia/Kolkata`)
    .then(res=>res.json())
    .then(data=>{
      loader.style.display = "none";
      statusText.innerText = " Weather loaded";

      showToday(data);
      drawChart(data);
      showCards(data);
    });
}

// TODAY CARD
function showToday(data){
  document.getElementById("todayCard").style.display="flex";
  document.getElementById("todayDate").innerText = data.daily.time[0];
  document.getElementById("todayTemp").innerText = data.daily.temperature_2m_max[0];
  document.getElementById("todayWind").innerText = data.daily.windspeed_10m_max[0];
}

// CHART
function drawChart(data){
  const labels = data.daily.time;
  const maxTemp = data.daily.temperature_2m_max;
  const minTemp = data.daily.temperature_2m_min;
  const wind = data.daily.windspeed_10m_max;

  if(chart) chart.destroy();

  chart = new Chart(document.getElementById("weatherChart"),{
    type:"line",
    data:{
      labels,
      datasets:[
        { label:"Max Temp (°C)", data:maxTemp },
        { label:"Min Temp (°C)", data:minTemp },
        { label:"Wind (km/h)", data:wind, yAxisID:"y1" }
      ]
    },
    options:{
      scales:{
        y:{ title:{ display:true, text:"Temperature" }},
        y1:{ position:"right", title:{display:true,text:"Wind"}, grid:{drawOnChartArea:false} }
      }
    }
  });
}

// DATE WISE CARDS
function showCards(data){
  const container = document.getElementById("dailyCards");
  container.innerHTML = "";
  data.daily.time.forEach((date,i)=>{
    container.innerHTML += `
      <div class="card">
        <h4>${date}</h4>
        🌡️ ${data.daily.temperature_2m_max[i]}° / ${data.daily.temperature_2m_min[i]}°<br>
        🌬️ ${data.daily.windspeed_10m_max[i]} km/h
      </div>
    `;
  });
}

// SATELLITE MAP
function loadMap(lat, lon){
  const map = L.map("map").setView([lat, lon],12);

  L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",{
    attribution:"© ESRI Satellite"
  }).addTo(map);

  L.marker([lat, lon]).addTo(map).bindPopup("📍 Your Location").openPopup();
}


