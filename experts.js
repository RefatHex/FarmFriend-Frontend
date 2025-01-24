document.addEventListener("DOMContentLoaded", () => {
  const cardsSection = document.querySelector(".cards-section");
  let selectedAgronomistId = null;
  let selectedFee = 0;

  // Fetch agronomist data from the server
  const fetchAgronomists = async () => {
    try {
      const response = await fetch(
        "http://localhost:8000/consultations/agronomists/?availability=true"
      );
      if (response.ok) {
        const { results: agronomists } = await response.json();

        // Clear any existing cards
        cardsSection.innerHTML = "";

        // Generate cards dynamically
        agronomists.forEach((agronomist) => {
          const card = document.createElement("div");
          card.classList.add("card");

          card.innerHTML = `
            <img src="assets/images/expert-placeholder.jpg" alt="${
              agronomist.name
            }">
            <h3>${agronomist.name}</h3>
            <p>${agronomist.description || "N/A"}</p>
            <div class="price">Price: $${parseFloat(agronomist.fee).toFixed(
              2
            )}/day</div>
            <button class="btn btn-primary mt-3" data-bs-toggle="modal" data-bs-target="#bookingModal" onclick="openModal(${
              agronomist.id
            }, ${agronomist.fee})">Book Now</button>
            <div class="details-bar">
              <p><strong>Specialty:</strong> ${agronomist.specialty}</p>
              <p><strong>Years of Experience:</strong> ${
                agronomist.years_of_experience
              }</p>
              <p><strong>Contact:</strong> ${agronomist.contact}</p>
              <p><strong>Address:</strong> ${agronomist.address}</p>
              <p><strong>Availability:</strong> ${
                agronomist.availability ? "✅ Available" : "❌ Not Available"
              }</p>
            </div>
          `;

          cardsSection.appendChild(card);
        });
      } else {
        console.error("Failed to fetch agronomists:", await response.json());
        alert("Failed to load agronomist data.");
      }
    } catch (error) {
      console.error("Error fetching agronomist data:", error);
      alert("An error occurred while loading agronomist data.");
    }
  };

  fetchAgronomists();

  // Modal functions
  window.openModal = (agronomistId, fee) => {
    selectedAgronomistId = agronomistId;
    selectedFee = fee;
  };

  const bookingForm = document.getElementById("bookingForm");

  bookingForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const requestDate = document.getElementById("requestDate").value;
    const details = document.getElementById("details").value.trim();

    if (!requestDate || !details) {
      alert("All fields are required!");
      return;
    }

    const bookingData = {
      farmer: 1, // Replace with the logged-in farmer's ID
      agronomist: selectedAgronomistId,
      fee: selectedFee,
      status: "Pending",
      request_date: requestDate,
      details,
    };

    try {
      const response = await fetch(
        "http://localhost:8000/consultations/consultation-requests/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(bookingData),
        }
      );

      if (response.ok) {
        alert("Booking successfully created!");
        const modal = bootstrap.Modal.getInstance(
          document.getElementById("bookingModal")
        );
        modal.hide();
      } else {
        console.error("Failed to create booking:", await response.json());
        alert("Failed to create booking. Please try again.");
      }
    } catch (error) {
      console.error("Error creating booking:", error);
      alert("An error occurred while creating the booking.");
    }
  });
});
