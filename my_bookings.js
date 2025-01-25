const API_ENDPOINTS = {
  equipment: "http://localhost:8000/rentals/rent-item-orders/?rent_taker=",
  storage: "http://localhost:8000/storage/storage-deals-details/?farmer=",
  consultation:
    "http://localhost:8000/consultations/consultation-requests-details/?farmer=",
};

// Get user ID from cookies
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
  return null;
}

// Fetch bookings based on the selected type
async function fetchBookings() {
  const userId = getCookie("farmersId");
  const bookingType = document.getElementById("bookingType").value;
  const apiUrl = `${API_ENDPOINTS[bookingType]}${userId}`;

  try {
    const response = await fetch(apiUrl);
    if (!response.ok)
      throw new Error(`Failed to fetch ${bookingType} bookings`);
    const data = await response.json();

    // Call appropriate display function based on booking type
    if (bookingType === "equipment") {
      displayEquipmentBookings(data.results);
    } else if (bookingType === "storage") {
      displayStorageBookings(data.results);
    } else if (bookingType === "consultation") {
      displayConsultationBookings(data.results);
    }
  } catch (error) {
    console.error(`Error fetching ${bookingType} bookings:`, error);
    Swal.fire({
      icon: "error",
      title: "Error",
      text: `Failed to fetch ${bookingType} bookings. Please try again later.`,
      showConfirmButton: true,
    });
  }
}

// Display Equipment bookings
function displayEquipmentBookings(bookings) {
  const bookingsSection = document.getElementById("bookingsSection");
  const oldBookingsSection = document.getElementById("oldBookingsSection");
  bookingsSection.innerHTML = "";
  oldBookingsSection.innerHTML = "";

  if (bookings.length === 0) {
    bookingsSection.innerHTML =
      "<p class='no-bookings'>No equipment bookings found.</p>";
    return;
  }

  const today = new Date();

  bookings.forEach((booking) => {
    const returnDate = new Date(booking.return_date);
    const daysRemaining = Math.ceil(
      (returnDate - today) / (1000 * 60 * 60 * 24)
    );

    const bookingCard = document.createElement("div");
    bookingCard.className = "booking-item";

    bookingCard.innerHTML = `
      <h3>${booking.title}</h3>
      <p>${booking.description}</p>
      <p>Price: $${booking.price}</p>
      <p>Order Date: ${booking.order_date}</p>
      <p>Return Date: ${booking.return_date}</p>
      <p>Status: ${getEquipmentStatus(booking)}</p>
      ${
        daysRemaining > 0
          ? `<p class="countdown">Days Left: ${daysRemaining}</p>`
          : `<p class="countdown expired">Expired</p>`
      }
    `;

    if (daysRemaining <= 0) {
      oldBookingsSection.appendChild(bookingCard);
    } else {
      bookingsSection.appendChild(bookingCard);
    }
  });
}

function getEquipmentStatus(booking) {
  if (booking.is_confirmed) {
    return booking.is_ready_for_pickup
      ? "Ready for Pickup"
      : "Confirmed but not ready";
  }
  return "Pending Confirmation";
}

// Display Storage bookings
function displayStorageBookings(bookings) {
  const bookingsSection = document.getElementById("bookingsSection");
  const oldBookingsSection = document.getElementById("oldBookingsSection");
  bookingsSection.innerHTML = "";
  oldBookingsSection.innerHTML = "";

  if (bookings.length === 0) {
    bookingsSection.innerHTML =
      "<p class='no-bookings'>No storage bookings found.</p>";
    return;
  }

  const today = new Date();

  bookings.forEach((booking) => {
    const endDate = new Date(booking.end_date);
    const daysRemaining = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));

    const bookingCard = document.createElement("div");
    bookingCard.className = "booking-item";

    bookingCard.innerHTML = `
      <h3>Storage Booking</h3>
      <p>Gigs Offered: ${booking.gigs_offered}</p>
      <p>Crops Stored: ${booking.crops}</p>
      <p>Start Date: ${booking.start_date}</p>
      <p>End Date: ${booking.end_date}</p>
      <p>Status: ${getStorageStatus(booking)}</p>
      ${
        daysRemaining > 0
          ? `<p class="countdown">Days Left: ${daysRemaining}</p>`
          : `<p class="countdown expired">Expired</p>`
      }
    `;

    if (daysRemaining <= 0) {
      oldBookingsSection.appendChild(bookingCard);
    } else {
      bookingsSection.appendChild(bookingCard);
    }
  });
}

function getStorageStatus(booking) {
  if (booking.is_confirmed) {
    return booking.is_ready_for_pickup
      ? "Ready for Pickup"
      : "Confirmed but not ready";
  }
  return booking.completed ? "Completed" : "Pending Confirmation";
}

// Display Consultation bookings
function displayConsultationBookings(bookings) {
  const bookingsSection = document.getElementById("bookingsSection");
  const oldBookingsSection = document.getElementById("oldBookingsSection");
  bookingsSection.innerHTML = "";
  oldBookingsSection.innerHTML = "";

  if (bookings.length === 0) {
    bookingsSection.innerHTML =
      "<p class='no-bookings'>No consultation bookings found.</p>";
    return;
  }

  bookings.forEach((booking) => {
    const bookingCard = document.createElement("div");
    bookingCard.className = "booking-item";

    bookingCard.innerHTML = `
      <h3>Consultation Request #${booking.id}</h3>
      <p>Request Date: ${booking.request_date}</p>
      <p>Status: ${booking.status}</p>
      <p>Fee: $${booking.fee}</p>
      <p>Details: ${booking.details}</p>
      <p>Resolution: ${booking.resolution || "Pending"}</p>
      ${
        booking.meet_link
          ? `<a href="${booking.meet_link}" target="_blank" class="meet-link">Join Meeting</a>`
          : ""
      }
    `;

    bookingsSection.appendChild(bookingCard);
  });
}

// Fetch bookings on page load
document.addEventListener("DOMContentLoaded", fetchBookings);
