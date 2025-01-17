const ADMIN_BOOKINGS_API_URL =
  "http://localhost:8000/rentals/rent-item-orders/";

// Fetch all bookings
async function fetchAdminBookings() {
  try {
    const response = await fetch(ADMIN_BOOKINGS_API_URL);
    if (!response.ok) throw new Error("Failed to fetch bookings");
    const data = await response.json();

    const bookingsSection = document.getElementById("adminBookingsSection");
    const oldBookingsSection = document.getElementById(
      "adminOldBookingsSection"
    );
    bookingsSection.innerHTML = "";
    oldBookingsSection.innerHTML = "";

    if (data.results.length === 0) {
      bookingsSection.innerHTML =
        "<p class='no-bookings'>No bookings found.</p>";
      return;
    }

    const today = new Date();

    data.results.forEach((booking) => {
      const returnDate = new Date(booking.return_date);
      const daysRemaining = Math.ceil(
        (returnDate - today) / (1000 * 60 * 60 * 24)
      );

      const bookingCard = document.createElement("div");
      bookingCard.className = "card-booking";

      bookingCard.innerHTML = `
                <h3>${booking.title}</h3>
                <p><strong>Description:</strong> ${booking.description}</p>
                <p><strong>Price:</strong> $${booking.price}</p>
                <p><strong>Order Date:</strong> ${booking.order_date}</p>
                <p><strong>Return Date:</strong> ${booking.return_date}</p>
                ${
                  booking.is_available
                    ? `<button class="btn-action" onclick="toggleAvailability(${booking.id}, true)">Mark as Unavailable</button>`
                    : `<button class="btn-action" onclick="toggleAvailability(${booking.id}, false)">Mark as Available</button>`
                }
              
            `;

      if (daysRemaining <= 0) {
        oldBookingsSection.appendChild(bookingCard);
      } else {
        bookingsSection.appendChild(bookingCard);
      }
    });
  } catch (error) {
    console.error("Error fetching bookings:", error);
  }
}

// Toggle availability status
async function toggleAvailability(bookingId, currentState) {
  try {
    // Determine the new state based on the current state
    const newAvailability = !currentState;

    // Prepare the patch data
    const patchData = {
      is_available: currentState,
    };

    // Send the PATCH request
    const response = await fetch(`${ADMIN_BOOKINGS_API_URL}${bookingId}/`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(patchData),
    });
    console.log(response);

    // Handle the response
    if (response.ok) {
      alert(
        `Booking marked as ${newAvailability ? "available" : "unavailable"}.`
      );
      fetchAdminBookings();
    } else {
      console.error(`Failed to toggle availability:`, await response.text());
      alert("Failed to toggle availability. Please try again.");
    }
  } catch (error) {
    console.error("Error toggling availability:", error);
    alert("An error occurred. Please try again later.");
  }
}

// Mark a booking as ready for pickup
async function markReadyForPickup(bookingId) {
  try {
    const patchData = {
      is_ready_for_pickup: true,
    };

    const response = await fetch(`${ADMIN_BOOKINGS_API_URL}${bookingId}/`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(patchData),
    });

    if (response.ok) {
      alert("Booking marked as ready for pickup.");
      fetchAdminBookings(); // Refresh bookings
    } else {
      console.error(
        "Failed to mark booking as ready for pickup:",
        await response.text()
      );
      alert("Failed to mark booking as ready for pickup. Please try again.");
    }
  } catch (error) {
    console.error("Error marking booking as ready for pickup:", error);
    alert("An error occurred. Please try again later.");
  }
}

// Fetch bookings on page load
fetchAdminBookings();
