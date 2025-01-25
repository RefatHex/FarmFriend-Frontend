// Replace these URLs with your actual API endpoints
const CURRENT_WEATHER_API_URL =
  "http://127.0.0.1:8000/api/current-weather/?city=";
const HISTORICAL_RAINFALL_API_URL =
  "http://127.0.0.1:8000/api/historical-rainfall/?city=";

// Ask for user's location and fetch city name
async function getCityFromLocation() {
  if (!navigator.geolocation) {
    alert("Geolocation is not supported by your browser.");
    return null;
  }

  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        console.log("User's Coordinates:", latitude, longitude);

        // Reverse geocode to get city name (using OpenCage API as an example)
        const REVERSE_GEOCODE_URL = `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=YOUR_OPENCAGE_API_KEY`;

        try {
          const response = await fetch(REVERSE_GEOCODE_URL);
          if (!response.ok) {
            throw new Error("Failed to fetch city name from location.");
          }
          const data = await response.json();
          const city =
            data.results[0].components.city ||
            data.results[0].components.town ||
            data.results[0].components.village;

          console.log("Detected City:", city);
          resolve(city);
        } catch (error) {
          console.error("Error fetching city name:", error);
          reject(null);
        }
      },
      (error) => {
        console.error("Error getting user location:", error);
        alert(
          "Unable to retrieve your location. Please enable location services."
        );
        reject(null);
      }
    );
  });
}

// Fetch current weather data
async function fetchCurrentWeather(city) {
  try {
    const response = await fetch(
      CURRENT_WEATHER_API_URL + encodeURIComponent(city)
    );
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

// Fetch historical rainfall data
async function fetchHistoricalRainfall(city) {
  try {
    const response = await fetch(
      HISTORICAL_RAINFALL_API_URL + encodeURIComponent(city)
    );
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

// Populate current weather UI
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

// Populate historical rainfall UI
function populateHistoricalRainfall(data) {
  document.getElementById(
    "historicalRainfall"
  ).innerText = `${data.total_rainfall_last_year} mm`;
}

// Initialize page
async function initializePage() {
  try {
    const city = await getCityFromLocation();
    if (!city) {
      alert("Unable to determine your location. Using default city: London.");
      await fetchCurrentWeather("London");
      await fetchHistoricalRainfall("London");
    } else {
      await fetchCurrentWeather(city);
      await fetchHistoricalRainfall(city);
    }
  } catch (error) {
    console.error("Error during initialization:", error);
    alert("An error occurred while loading weather data.");
  }
}

document.addEventListener("DOMContentLoaded", initializePage);
