const MY_BOOKINGS_API_URL = 'http://localhost:8000/rentals/rent-item-orders/';
const userId = getCookie('userId');

// Get user ID from cookies
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
}

// Fetch all bookings for the logged-in user
async function fetchBookings() {
  try {
    const response = await fetch(`${MY_BOOKINGS_API_URL}?rent_taker=${userId}`);
    if (!response.ok) throw new Error('Failed to fetch bookings');
    const data = await response.json();

    const bookingsSection = document.getElementById('bookingsSection');
    const oldBookingsSection = document.getElementById('oldBookingsSection');
    bookingsSection.innerHTML = '';
    oldBookingsSection.innerHTML = '';

    if (data.results.length === 0) {
      bookingsSection.innerHTML =
        "<p class='no-bookings'>No bookings found.</p>";
      return;
    }

    const today = new Date();

    data.results.forEach(booking => {
      const returnDate = new Date(booking.return_date);
      const daysRemaining = Math.ceil(
        (returnDate - today) / (1000 * 60 * 60 * 24)
      );

      const bookingCard = document.createElement('div');
      bookingCard.className = 'booking-item'; // Changed to match your HTML class

      bookingCard.innerHTML = `
    <img src="assets/images/tractor.jpg" alt="Tractor">  <!-- You can change the image dynamically if needed -->
    <h3>${booking.title}</h3>
    <p>Booking Date: ${
      booking.order_date
    }</p>  <!-- Changed to match your format -->
    <p>Rental Period: ${
      booking.rental_period
    } Days</p>  <!-- Assuming rental_period exists in the data -->
    <p>Total Cost: $${booking.price}</p>  <!-- Changed to match your format -->
    ${
      daysRemaining > 0
        ? `<p class="countdown">Days Left: ${daysRemaining}</p>`
        : ''
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
    console.error('Error fetching bookings:', error);
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Failed to fetch bookings. Please try again later.',
      showConfirmButton: true,
    });
  }
}

// Delete a booking
async function deleteBooking(bookingId) {
  const confirmDelete = await Swal.fire({
    title: 'Are you sure?',
    text: 'You will not be able to recover this booking!',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, delete it!',
  });

  if (!confirmDelete.isConfirmed) return;

  try {
    const response = await fetch(`${MY_BOOKINGS_API_URL}${bookingId}/`, {
      method: 'DELETE',
    });

    if (response.ok) {
      await Swal.fire({
        icon: 'success',
        title: 'Deleted!',
        text: 'Your booking has been deleted.',
        timer: 3000,
        showConfirmButton: false,
      });
      fetchBookings();
    } else {
      const errorText = await response.text();
      console.error('Failed to delete booking:', errorText);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to delete booking. Please try again.',
        showConfirmButton: true,
      });
    }
  } catch (error) {
    console.error('Error deleting booking:', error);
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'An error occurred while deleting the booking. Please try again later.',
      showConfirmButton: true,
    });
  }
}

// Fetch bookings on page load
fetchBookings();
