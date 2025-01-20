const recForm = document.getElementById("recForm");
const responseDiv = document.getElementById("response");
const weatherInfo = document.getElementById("weatherInfo");
let weatherData = {}; // To store fetched weather data

// Fetch weather data and update UI
async function fetchWeather() {
  try {
    const response = await fetch(
      "http://localhost:8000/api/weather/?city=Dhaka"
    );
    if (!response.ok) {
      throw new Error("Failed to fetch weather data");
    }
    const data = await response.json();

    // Save fetched data
    weatherData.temperature = data.temperature;
    weatherData.humidity = data.humidity;

    // Update weather info on the page
    document.getElementById("city").textContent = `City: ${data.city}`;
    document.getElementById(
      "temperature"
    ).textContent = `Temperature: ${data.temperature} °C`;
    document.getElementById(
      "humidity"
    ).textContent = `Humidity: ${data.humidity}%`;
  } catch (error) {
    weatherInfo.innerHTML = `<p class="text-danger">Error fetching weather data: ${error.message}</p>`;
  }
}

// Fetch weather data on page load
window.addEventListener("DOMContentLoaded", fetchWeather);

recForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const formData = {
    user: 1,
    nitrogen: parseFloat(document.getElementById("nitrogen").value),
    phosphorus: parseFloat(document.getElementById("phosphorus").value),
    potassium: parseFloat(document.getElementById("potassium").value),
    ph: parseFloat(document.getElementById("ph").value),
    rainfall: parseFloat(document.getElementById("rainfall").value),
    temperature: weatherData.temperature,
    humidity: weatherData.humidity,
    session_id: 12,
  };

  try {
    const response = await fetch("http://127.0.0.1:8000/ai_responses/rec/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      throw new Error(
        `Server error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();

    // Show success alert
    responseDiv.classList.remove("d-none", "alert-danger");
    responseDiv.classList.add("alert-success");
    responseDiv.textContent = `Recommended Crop: ${data.answer}`;
  } catch (error) {
    // Show error alert
    responseDiv.classList.remove("d-none", "alert-success");
    responseDiv.classList.add("alert-danger");
    responseDiv.textContent = `Error: ${error.message}`;
  }
});
