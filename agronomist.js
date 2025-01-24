document.addEventListener("DOMContentLoaded", () => {
  const agronomistId = 1;
  const form = document.getElementById("agronomistForm");

  // Function to fetch and populate existing data
  const fetchExistingData = async () => {
    try {
      const response = await fetch(
        `http://localhost:8000/consultations/agronomists/${agronomistId}/`
      );
      if (response.ok) {
        const data = await response.json();

        // Populate form fields with server data
        document.getElementById("name").value = data.name || "";
        document.getElementById("contact").value = data.contact || "";
        document.getElementById("address").value = data.address || "";
        document.getElementById("description").value = data.description || "";
        document.getElementById("specialty").value = data.specialty || "";
        document.getElementById("fee").value = data.fee || 0;
        document.getElementById("experience").value =
          data.years_of_experience || 0;
        document.getElementById("availability").checked =
          data.availability || false;
      } else {
        console.error("Failed to fetch existing data:", await response.json());
        alert("Failed to load existing data.");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      alert("An error occurred while loading data.");
    }
  };

  const patchField = async (field, value) => {
    const data = { [field]: value };

    try {
      const response = await fetch(
        `http://localhost:8000/consultations/agronomists/${agronomistId}/`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        console.error(`Failed to update ${field}:`, await response.json());
        alert(`Failed to update ${field}.`);
      } else {
        console.log(`Successfully updated ${field}`);
      }
    } catch (error) {
      console.error(`Error updating ${field}:`, error);
      alert(`An error occurred while updating ${field}.`);
    }
  };

  // Add event listeners to form fields for automatic PATCH on change
  const addPatchListeners = () => {
    const fields = [
      { id: "name", field: "name" },
      { id: "contact", field: "contact" },
      { id: "address", field: "address" },
      { id: "description", field: "description" },
      { id: "specialty", field: "specialty" },
      { id: "fee", field: "fee" },
      { id: "experience", field: "years_of_experience" },
    ];

    fields.forEach(({ id, field }) => {
      const input = document.getElementById(id);
      input.addEventListener("change", (event) => {
        const value =
          field === "fee" || field === "years_of_experience"
            ? parseFloat(event.target.value) || 0
            : event.target.value;
        patchField(field, value);
      });
    });

    // Special handling for availability (checkbox)
    const availabilityInput = document.getElementById("availability");
    availabilityInput.addEventListener("change", (event) => {
      patchField("availability", event.target.checked);
    });
  };

  // Fetch data and set up listeners on page load
  fetchExistingData();
  addPatchListeners();
});
