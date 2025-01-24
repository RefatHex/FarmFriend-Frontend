// Replace these URLs with your actual API endpoints
const CURRENT_WEATHER_API_URL =
  "http://127.0.0.1:8000/api/current-weather/?city=London";
const HISTORICAL_RAINFALL_API_URL =
  "http://127.0.0.1:8000/api/historical-rainfall/?city=London";

// Fetch current weather data
async function fetchCurrentWeather() {
  try {
    const response = await fetch(CURRENT_WEATHER_API_URL);
    if (!response.ok) {
      throw new Error("Failed to fetch current weather data.");
    }
    const data = await response.json();
    console.log(data);
    populateCurrentWeather(data);
  } catch (error) {
    console.error("Error fetching current weather data:", error);
  }
}

async function fetchHistoricalRainfall() {
  try {
    const response = await fetch(HISTORICAL_RAINFALL_API_URL);
    if (!response.ok) {
      throw new Error("Failed to fetch historical rainfall data.");
    }
    const data = await response.json();
    console.log(data);
    populateHistoricalRainfall(data);
  } catch (error) {
    console.error("Error fetching historical rainfall data:", error);
  }
}

function populateCurrentWeather(data) {
  document.getElementById("tempCircle").innerText = `${data.temperature}°C`;
  document.getElementById("humidityCircle").innerText = `${data.humidity}%`;
  document.getElementById(
    "rainfallCircle"
  ).innerText = `${data.precipitation} mm`;

  const alertsContainer = document.getElementById("alerts");
  alertsContainer.innerHTML = "";
  if (data.warnings && data.warnings.length > 0) {
    data.warnings.forEach((alert) => {
      const alertDiv = document.createElement("div");
      alertDiv.classList.add("alert");
      alertDiv.innerText = alert;
      alertsContainer.appendChild(alertDiv);
    });
  } else {
    const noAlertDiv = document.createElement("div");
    noAlertDiv.classList.add("alert");
    noAlertDiv.innerText = "No current weather alerts.";
    alertsContainer.appendChild(noAlertDiv);
  }
}

function populateHistoricalRainfall(data) {
  document.getElementById(
    "historicalRainfall"
  ).innerText = `${data.total_rainfall_last_year} mm`;
}

async function initializePage() {
  await fetchCurrentWeather();
  await fetchHistoricalRainfall();
}

document.addEventListener("DOMContentLoaded", initializePage);
