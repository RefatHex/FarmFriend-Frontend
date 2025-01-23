const RENT_ITEMS_API_URL =
  'http://localhost:8000/rentals/rent-items-with-user/?rent_owner=1';
const FEEDBACK_API_URL =
  'http://localhost:8000/feedback/feedbacks/?target_user=1&review_type=Gig';
const RENT_ORDER_API_URL = 'http://localhost:8000/rentals/rent-item-orders/';

let selectedGig = null;

// Get user ID from cookies
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
}

// Fetch gig and feedback data, then render the cards
async function fetchAndRenderGigs(url = RENT_ITEMS_API_URL) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch gigs');
    const data = await response.json();
    console.log('Gig Data:', data.results);

    const feedbackResponse = await fetch(FEEDBACK_API_URL);
    if (!feedbackResponse.ok) throw new Error('Failed to fetch feedbacks');
    const feedbackData = await feedbackResponse.json();
    console.log('Feedback Data:', feedbackData.results);

    const cardsSection = document.querySelector('.cards-section');
    cardsSection.innerHTML = ''; // Clear existing cards

    // Iterate through gigs and render each card
    data.results.forEach(gig => {
      const feedbacks = feedbackData.results.filter(
        feedback => feedback.gig_id === gig.id
      );
      console.log(`Feedbacks for gig ${gig.id}:`, feedbacks);

      const avgRating =
        feedbacks.reduce((acc, curr) => acc + curr.rating, 0) /
          feedbacks.length || 0;
      const stars = renderStars(avgRating);

      const card = document.createElement('div');
      card.className = 'card'; // Ensure this matches your original class for consistency
      card.innerHTML = `
    <img src="${gig.image}" alt="${gig.product_name}" />
    <h3>${gig.product_name}</h3>
    <p>${gig.description}</p>
    <div class="price">Price: $${gig.price}/day</div>
    <div class="details-bar">
      <p><strong>Details:</strong> ${gig.details}</p>
    </div>
    <div class="unique-stars">${stars}</div>
    <div class="unique-feedback"><strong>Feedback:</strong> ${feedbacks.length} reviews</div>
    <button class="btn-details" onclick="openDetailsPopup(${gig.id})">View Details</button>
  `;

      cardsSection.appendChild(card);
    });
  } catch (error) {
    console.error('Error fetching gigs or feedbacks:', error);
  }
}

// Render star rating as ★ and ☆
function renderStars(rating) {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.5 ? 1 : 0;
  const emptyStars = 5 - fullStars - halfStar;

  return '★'.repeat(fullStars) + (halfStar ? '★' : '') + '☆'.repeat(emptyStars);
}

// Open the details popup and fetch additional data
async function openDetailsPopup(gigId) {
  try {
    const gigResponse = await fetch(`${RENT_ITEMS_API_URL}&id=${gigId}`);
    if (!gigResponse.ok) throw new Error('Failed to fetch gig details');
    const gigData = (await gigResponse.json()).results[0];
    selectedGig = gigData;

    const feedbackResponse = await fetch(FEEDBACK_API_URL);
    if (!feedbackResponse.ok) throw new Error('Failed to fetch feedbacks');
    const feedbackData = await feedbackResponse.json();

    const feedbacks = feedbackData.results.filter(
      feedback => feedback.gig_id === gigId
    );

    const feedbackList = feedbacks.length
      ? feedbacks
          .map(
            fb =>
              `<li><strong>${fb.rating}★</strong> - ${
                fb.content
              } <em>(on ${new Date(
                fb.created_at
              ).toLocaleDateString()})</em></li>`
          )
          .join('')
      : '<p>No feedback available for this gig.</p>';

    const popup = document.getElementById('detailsPopup');
    popup.innerHTML = `
      <div class="popup-content">
        <span class="close" onclick="closeDetailsPopup()">&times;</span>
        <h2>${gigData.product_name}</h2>
        <img src="${gigData.image}" alt="${gigData.product_name}" />
        <p><strong>Description:</strong> ${gigData.description}</p>
        <p><strong>Price:</strong> $${gigData.price}/day</p>
        <p><strong>Quantity Available:</strong> ${gigData.quantity}</p>
        <p><strong>Owner:</strong> ${gigData.rent_owner.name}</p>
        <p><strong>Contact:</strong> ${gigData.rent_owner.contact}</p>
        <h3>Feedback:</h3>
        <ul>${feedbackList}</ul>
        <label for="returnDate">Return Date:</label>
        <input type="date" id="returnDate" required />
        <button class="btn-booking" onclick="submitBooking()">Book Now</button>
      </div>
    `;
    popup.style.display = 'block';
  } catch (error) {
    console.error('Error opening details popup:', error);
  }
}

// Close the details popup
function closeDetailsPopup() {
  const popup = document.getElementById('detailsPopup');
  popup.style.display = 'none';
}

// Handle booking submission
async function submitBooking() {
  const returnDate = document.getElementById('returnDate').value;
  const rentTakerId = getCookie('farmersId');

  if (!returnDate || !rentTakerId) {
    alert('Please ensure you are logged in and provide a return date.');
    return;
  }

  const bookingData = {
    rent_owner: selectedGig.rent_owner.user,
    rent_taker: rentTakerId,
    title: selectedGig.product_name,
    description: selectedGig.description,
    price: selectedGig.price,
    order_date: new Date().toISOString().split('T')[0],
    return_date: returnDate,
    is_confirmed: false,
    is_ready_for_pickup: false,
  };

  try {
    const response = await fetch(RENT_ORDER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bookingData),
    });

    if (response.ok) {
      alert('Booking successful!');
      closeDetailsPopup();
    } else {
      const errorMessage = await response.json();
      console.error('Failed to submit booking:', errorMessage);
      alert('Booking failed: ' + JSON.stringify(errorMessage));
    }
  } catch (error) {
    console.error('Error submitting booking:', error);
    alert('An error occurred while booking. Please try again later.');
  }
}

// Initialize by fetching and rendering gigs
fetchAndRenderGigs();
