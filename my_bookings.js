const API_ENDPOINTS = {
  rental: "http://localhost:8000/rentals/rent-item-orders/",
  storage: "http://localhost:8000/storage/storage-deals/",
  consultation: "http://localhost:8000/consultations/consultation-requests/",
};

const QUERY_PARAMS = {
  rental: "rent_taker",
  storage: "farmer",
  consultation: "farmer",
};
document.addEventListener("DOMContentLoaded", () => {
  // Remove the dropdown selector addition as it's already in HTML
  const bookingTypeSelect = document.getElementById("bookingType");
  if (bookingTypeSelect) {
    bookingTypeSelect.addEventListener("change", (e) => {
      fetchBookings(e.target.value);
    });
  }

  fetchBookings("rental"); // Default to rental bookings
});
async function fetchBookings(bookingType = "rental") {
  const userId = getCookie("farmersId") || getCookie("userId");

  if (!userId) {
    await showAlert(
      "error",
      "ত্রুটি",
      "ইউজার আইডি পাওয়া যায়নি। আবার লগইন করুন।"
    );
    window.location.href = "login.html";
    return;
  }

  try {
    const response = await fetch(
      `${API_ENDPOINTS[bookingType]}?${QUERY_PARAMS[bookingType]}=${userId}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    if (!data.results) {
      throw new Error("Invalid data format received from server");
    }

    displayBookings(data.results, bookingType);
  } catch (error) {
    console.error("Error fetching bookings:", error);
    showAlert(
      "error",
      "ত্রুটি",
      "বুকিং লোড করতে সমস্যা হচ্ছে। আবার চেষ্টা করুন।"
    );
  }
}

function displayBookings(bookings, bookingType) {
  const bookingsSection = document.getElementById("bookingsSection");
  const oldBookingsSection = document.getElementById("oldBookingsSection");

  bookingsSection.innerHTML = "";
  oldBookingsSection.innerHTML = "";

  if (!bookings || bookings.length === 0) {
    bookingsSection.innerHTML =
      "<p class='no-bookings'>কোনো বুকিং পাওয়া যায়নি।</p>";
    return;
  }

  const today = new Date();

  bookings.forEach((booking) => {
    const bookingCard = createBookingCard(booking, bookingType, today);

    if (bookingType === "rental" || bookingType === "storage") {
      const returnDate = new Date(booking.return_date || booking.end_date);
      const daysRemaining = Math.ceil(
        (returnDate - today) / (1000 * 60 * 60 * 24)
      );

      if (daysRemaining <= 0) {
        oldBookingsSection.appendChild(bookingCard);
      } else {
        bookingsSection.appendChild(bookingCard);
      }
    } else {
      // For consultations, show based on status
      if (booking.status === "Completed") {
        oldBookingsSection.appendChild(bookingCard);
      } else {
        bookingsSection.appendChild(bookingCard);
      }
    }
  });
}

function createBookingCard(booking, bookingType, today) {
  const card = document.createElement("div");
  card.className = "booking-item";

  let cardContent = "";

  switch (bookingType) {
    case "rental":
      cardContent = createRentalCard(booking, today);
      break;
    case "storage":
      cardContent = createStorageCard(booking, today);
      break;
    case "consultation":
      cardContent = createConsultationCard(booking);
      break;
  }

  card.innerHTML = cardContent;
  return card;
}

function createRentalCard(booking, today) {
  const returnDate = new Date(booking.return_date);
  const daysRemaining = Math.ceil((returnDate - today) / (1000 * 60 * 60 * 24));
  const rentalPeriod = calculateRentalPeriod(
    booking.order_date,
    booking.return_date
  );

  return `
        <div class="booking-image">
            <img src="assets/images/tractor.jpg" alt="${booking.title}">
        </div>
        <div class="booking-details">
            <h3>${booking.title}</h3>
            <p>বুকিং তারিখ: ${formatDate(booking.order_date)}</p>
            <p>ফেরত তারিখ: ${formatDate(booking.return_date)}</p>
            <p>ভাড়ার মেয়াদ: ${rentalPeriod} দিন</p>
            <p>মোট খরচ: ৳${booking.price}</p>
            ${
              daysRemaining > 0
                ? `<p class="countdown">বাকি দিন: ${daysRemaining}</p>`
                : ""
            }
            <div class="booking-status">
                ${
                  booking.is_confirmed
                    ? '<span class="badge bg-success">নিশ্চিত করা হয়েছে</span>'
                    : '<span class="badge bg-warning">অপেক্ষমান</span>'
                }
                ${
                  booking.is_ready_for_pickup
                    ? '<span class="badge bg-info">পিকআপের জন্য প্রস্তুত</span>'
                    : ""
                }
            </div>
            ${
              !booking.is_confirmed
                ? `<button class="btn btn-danger" onclick="deleteBooking(${booking.id}, 'rental')">
                    বাতিল করুন
                </button>`
                : ""
            }
        </div>
    `;
}

function createStorageCard(booking, today) {
  const endDate = new Date(booking.end_date);
  const daysRemaining = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));

  return `
        <div class="booking-image">
            <img src="assets/images/storage.jpg" alt="Storage">
        </div>
        <div class="booking-details">
            <h3>স্টোরেজ বুকিং</h3>
            <p>শুরুর তারিখ: ${formatDate(booking.start_date)}</p>
            <p>শেষ তারিখ: ${formatDate(booking.end_date)}</p>
            <p>গিগস অফার: ${booking.gigs_offered}</p>
            <p>ফসল: ${booking.crops}</p>
            ${
              daysRemaining > 0
                ? `<p class="countdown">বাকি দিন: ${daysRemaining}</p>`
                : ""
            }
            <div class="booking-status">
                ${
                  booking.is_confirmed
                    ? '<span class="badge bg-success">নিশ্চিত করা হয়েছে</span>'
                    : '<span class="badge bg-warning">অপেক্ষমান</span>'
                }
            </div>
        </div>
    `;
}

function createConsultationCard(booking) {
  return `
        <div class="booking-details">
            <h3>পরামর্শ সেবা</h3>
            <p>অনুরোধের তারিখ: ${formatDate(booking.request_date)}</p>
            <p>বিস্তারিত: ${booking.details}</p>
            <p>ফি: ৳${booking.fee}</p>
            ${booking.resolution ? `<p>সমাধান: ${booking.resolution}</p>` : ""}
            <div class="booking-status">
                <span class="badge bg-${getStatusColor(
                  booking.status
                )}">${getStatusText(booking.status)}</span>
            </div>
            ${
              booking.meet_link
                ? `<a href="${booking.meet_link}" target="_blank" class="btn btn-primary">মিটিং-এ যোগ দিন</a>`
                : ""
            }
        </div>
    `;
}

function getStatusColor(status) {
  const colors = {
    Pending: "warning",
    Accepted: "success",
    Completed: "info",
    Cancelled: "danger",
  };
  return colors[status] || "secondary";
}

function getStatusText(status) {
  const texts = {
    Pending: "অপেক্ষমান",
    Accepted: "গৃহীত",
    Completed: "সম্পন্ন",
    Cancelled: "বাতিল",
  };
  return texts[status] || status;
}

// Modified delete function to handle different booking types
async function deleteBooking(bookingId, bookingType) {
  try {
    const confirmResult = await showAlert(
      "warning",
      "নিশ্চিত করুন",
      "আপনি কি এই বুকিং বাতিল করতে চান?",
      {
        showCancelButton: true,
        confirmButtonText: "হ্যাঁ",
        cancelButtonText: "না",
      }
    );

    if (!confirmResult.isConfirmed) return;

    const response = await fetch(`${API_ENDPOINTS[bookingType]}${bookingId}/`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    await showAlert("success", "সফল", "বুকিং বাতিল করা হয়েছে।");
    await fetchBookings(bookingType);
  } catch (error) {
    console.error("Error deleting booking:", error);
    await showAlert(
      "error",
      "ত্রুটি",
      "বুকিং বাতিল করতে সমস্যা হচ্ছে। আবার চেষ্টা করুন।"
    );
  }
}

// Initialize on page load
document.addEventListener("DOMContentLoaded", () => {
  if (typeof Swal === "undefined") {
    console.warn("SweetAlert2 is not loaded. Falling back to regular alerts.");
  }

  fetchBookings("rental"); // Default to rental bookings
});
