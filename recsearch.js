const recForm = document.getElementById("recForm");
const responseDiv = document.getElementById("response");

recForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const formData = {
    user: 1,
    nitrogen: parseFloat(document.getElementById("nitrogen").value),
    phosphorus: parseFloat(document.getElementById("phosphorus").value),
    potassium: parseFloat(document.getElementById("potassium").value),
    temperature: parseFloat(document.getElementById("temperature").value),
    humidity: parseFloat(document.getElementById("humidity").value),
    moisture: parseFloat(document.getElementById("moisture").value),
    crop_type: parseInt(document.getElementById("crop_type").value),
    soil_type: parseInt(document.getElementById("soil_type").value),
    session_id: parseInt(document.getElementById("session_id").value),
  };

  try {
    const response = await fetch("http://127.0.0.1:8000/ai_responses/fert/", {
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
    responseDiv.textContent = `Recommended Fertilizer: ${data.answer}`;
  } catch (error) {
    // Show error alert
    responseDiv.classList.remove("d-none", "alert-success");
    responseDiv.classList.add("alert-danger");
    responseDiv.textContent = `Error: ${error.message}`;
  }
});
