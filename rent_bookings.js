const MY_BOOKINGS_API_URL = "http://localhost:8000/rentals/rent-item-orders/";
const userId = getCookie("userId");

// Get user ID from cookies
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
  return null;
}

// Fetch all bookings for the logged-in user
async function fetchBookings() {
  try {
    const response = await fetch(`${MY_BOOKINGS_API_URL}?rent_taker=${userId}`);
    if (!response.ok) throw new Error("Failed to fetch bookings");
    const data = await response.json();

    const bookingsSection = document.getElementById("bookingsSection");
    const oldBookingsSection = document.getElementById("oldBookingsSection");
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
                        <p><strong>Description:</strong> ${
                          booking.description
                        }</p>
                        <p><strong>Price:</strong> $${booking.price}</p>
                        <p><strong>Order Date:</strong> ${
                          booking.order_date
                        }</p>
                        <p><strong>Return Date:</strong> ${
                          booking.return_date
                        }</p>
                        ${
                          daysRemaining > 0
                            ? `<p class="countdown">Days Left: ${daysRemaining}</p>`
                            : ""
                        }
                        ${
                          booking.is_confirmed
                            ? `<div class="confirmation-message">Order confirmed and ready to be picked</div>`
                            : `<button class="btn-delete" onclick="deleteBooking(${booking.id})">Delete</button>`
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

// Delete a booking
async function deleteBooking(bookingId) {
  const confirmDelete = confirm(
    "Are you sure you want to delete this booking?"
  );
  if (!confirmDelete) return;

  try {
    const response = await fetch(`${MY_BOOKINGS_API_URL}${bookingId}/`, {
      method: "DELETE",
    });

    if (response.ok) {
      alert("Booking deleted successfully.");
      fetchBookings(); // Refresh bookings after deletion
    } else {
      console.error("Failed to delete booking:", await response.text());
      alert("Failed to delete booking. Please try again.");
    }
  } catch (error) {
    console.error("Error deleting booking:", error);
    alert(
      "An error occurred while deleting the booking. Please try again later."
    );
  }
}

fetchBookings();
