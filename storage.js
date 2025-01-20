////////////////////////////////////////
// Slider and dot navigation
////////////////////////////////////////
let currentSlide = 0;
const slides = document.querySelectorAll(".slide");
const dotsContainer = document.getElementById("dot-nav");

// Generate dot navigation dynamically
for (let i = 0; i < slides.length; i++) {
  const dot = document.createElement("div");
  dot.classList.add("dot");
  dot.addEventListener("click", () => moveToSlide(i));
  dotsContainer.appendChild(dot);
}
const dots = document.querySelectorAll(".dot");

// Move to a specific slide
function moveToSlide(index) {
  const slider = document.getElementById("slider");
  slider.style.transform = `translateX(-${index * 100}%)`;
  dots.forEach((dot) => dot.classList.remove("active"));
  dots[index].classList.add("active");
}

// Auto-move to the next slide every 3 seconds
setInterval(() => {
  currentSlide = (currentSlide + 1) % slides.length;
  moveToSlide(currentSlide);
}, 3000);

////////////////////////////////////////
// Fetch data and render cards
////////////////////////////////////////
document.addEventListener("DOMContentLoaded", () => {
  fetchDataAndRenderCards();
});

async function fetchDataAndRenderCards() {
  try {
    const response = await fetch(
      "http://localhost:8000/storage/storage-deals-details/"
    );
    const data = await response.json();
    const results = data.results || [];

    const cardsContainer = document.getElementById("cardsContainer");
    cardsContainer.innerHTML = ""; // clear any existing content

    results.forEach((gig) => {
      // Destructure gig object
      const {
        storage_owner,
        address,
        image,
        description,
        price,
        is_Available,
        prefered_crop,
        quantity,
        // If there's an ID for the gig or something similar, e.g. 'id'
        id,
      } = gig;

      // Create card element
      const cardDiv = document.createElement("div");
      cardDiv.classList.add("card");

      // Image
      const imgEl = document.createElement("img");
      imgEl.src = image;
      imgEl.alt = storage_owner?.name || "Storage Image";
      cardDiv.appendChild(imgEl);

      // Title (owner name or gig name)
      const titleEl = document.createElement("h3");
      titleEl.textContent = storage_owner?.name || "Unknown Storage";
      cardDiv.appendChild(titleEl);

      // Show address or other info
      const addressEl = document.createElement("p");
      addressEl.textContent = `Address: ${address}`;
      cardDiv.appendChild(addressEl);

      // Show capacity
      const capacityEl = document.createElement("p");
      capacityEl.textContent = `Capacity: ${quantity} tonnes`;
      cardDiv.appendChild(capacityEl);

      // Optional: Price
      const priceEl = document.createElement("p");
      priceEl.classList.add("price");
      priceEl.textContent = `Price: $${price}/day`;
      cardDiv.appendChild(priceEl);

      // Remove the Book Now button from the card
      // so that it only appears in the details modal

      // Add "View Details" button
      const detailsBtn = document.createElement("button");
      detailsBtn.classList.add("btn-view-details");
      detailsBtn.textContent = "View Details";
      detailsBtn.addEventListener("click", () => {
        // Open the details modal with full info
        openDetailsModal({
          id,
          storage_owner,
          address,
          image,
          description,
          price,
          is_Available,
          prefered_crop,
          quantity,
        });
      });
      cardDiv.appendChild(detailsBtn);

      // Optional small details bar
      const detailsBarDiv = document.createElement("div");
      detailsBarDiv.classList.add("details-bar");
      const detailText = document.createElement("p");
      detailText.innerHTML = `<strong>Short Info:</strong> ${description}`;
      detailsBarDiv.appendChild(detailText);
      cardDiv.appendChild(detailsBarDiv);

      // Append card to the container
      cardsContainer.appendChild(cardDiv);
    });
  } catch (error) {
    console.error("Failed to fetch gigs data:", error);
  }
}

////////////////////////////////////////
// Details Modal Logic
////////////////////////////////////////
let currentGigPrice = 0;
let currentGigId = null; // to fetch feedback based on gig id, if needed

async function openDetailsModal(gig) {
  // gig has all the fields we need
  currentGigId = gig.id || null;
  currentGigPrice = parseFloat(gig.price) || 0;

  // Fill the HTML elements
  document.getElementById("detailName").textContent =
    gig.storage_owner?.name || "Unknown Storage";
  document.getElementById("detailImage").src = gig.image;
  document.getElementById(
    "detailAddress"
  ).textContent = `Address: ${gig.address}`;
  document.getElementById(
    "detailCapacity"
  ).textContent = `Capacity: ${gig.quantity} tonnes`;
  document.getElementById(
    "detailPrice"
  ).textContent = `Price: $${gig.price}/day`;
  document.getElementById("detailAvailability").textContent = gig.is_Available
    ? "Available"
    : "Not Available";
  document.getElementById(
    "detailPreferredCrop"
  ).textContent = `Preferred Crop: ${gig.prefered_crop || "N/A"}`;

  // If there's owner contact or DOB
  document.getElementById("detailOwnerContact").textContent = `Contact: ${
    gig.storage_owner?.contact || "N/A"
  }`;
  document.getElementById("detailOwnerDOB").textContent = `DOB: ${
    gig.storage_owner?.dob || "N/A"
  }`;

  // Description
  document.getElementById("detailDescription").textContent =
    gig.description || "";

  // Show the details modal
  document.getElementById("detailsModal").style.display = "flex";

  // Fetch and display feedback for this gig
  await fetchAndDisplayFeedback(gig.id);
}

// Close the details modal
function closeDetailsModal() {
  document.getElementById("detailsModal").style.display = "none";
}

// Book Now button inside the Details Modal
const detailsBookNowBtn = document.getElementById("detailsBookNowBtn");
detailsBookNowBtn.addEventListener("click", () => {
  // Open the booking modal with the current gig price
  openBookingModal(currentGigPrice);
  // optionally close the details modal
  // closeDetailsModal();
});

////////////////////////////////////////
// Fetch Feedback and Display
////////////////////////////////////////
async function fetchAndDisplayFeedback(gigId) {
  if (!gigId) return;
  const feedbackContainer = document.getElementById("feedbackContainer");
  feedbackContainer.innerHTML = "Loading feedback...";

  try {
    // Example endpoint with gig_id param:
    // Adjust the query params or route as needed.
    const response = await fetch(
      `http://localhost:8000/feedback/feedbacks/?review_type=gig&gig_id=${gigId}`
    );
    const feedbackData = await response.json();

    // If the API returns an array, we iterate over it
    // If it returns an object with array inside, adjust accordingly
    // Let's assume we get an array of feedback objects
    // Example feedback object:
    // {
    //   "user": 1,
    //   "target_user": 1,
    //   "gig_id": 101,
    //   "content": "Great service!",
    //   "rating": 4.5,
    //   "review_type": "Gig"
    // }
    if (!Array.isArray(feedbackData) && feedbackData.results) {
      // maybe your API returns { count, results: [...] }
      renderFeedback(feedbackData.results, feedbackContainer);
    } else if (Array.isArray(feedbackData)) {
      renderFeedback(feedbackData, feedbackContainer);
    } else {
      feedbackContainer.innerHTML = "No feedback found.";
    }
  } catch (error) {
    console.error("Error fetching feedback:", error);
    feedbackContainer.innerHTML = "Failed to load feedback.";
  }
}

function renderFeedback(feedbackArray, container) {
  if (!feedbackArray || feedbackArray.length === 0) {
    container.innerHTML = "No feedback found for this gig.";
    return;
  }

  // Clear container first
  container.innerHTML = "";

  feedbackArray.forEach((fb) => {
    const fbDiv = document.createElement("div");
    fbDiv.classList.add("feedback-item");

    const contentP = document.createElement("p");
    contentP.textContent = `Comment: ${fb.content}`;
    fbDiv.appendChild(contentP);

    const ratingP = document.createElement("p");
    ratingP.textContent = `Rating: ${fb.rating}`;
    fbDiv.appendChild(ratingP);

    // If there's user info or date, you can show that too
    // e.g. user, target_user, etc.

    container.appendChild(fbDiv);
  });
}

////////////////////////////////////////
// Booking Modal Logic (existing)
////////////////////////////////////////
function openBookingModal(price) {
  pricePerDay = price;
  document.getElementById("bookingModal").style.display = "flex";
}

function closeBookingModal() {
  document.getElementById("bookingModal").style.display = "none";
}

let pricePerDay = 0;

function submitBooking() {
  const startDate = document.getElementById("startDate").value;
  const endDate = document.getElementById("endDate").value;

  if (!startDate || !endDate) {
    document.getElementById("errorNotification").style.display = "block";
    setTimeout(() => {
      document.getElementById("errorNotification").style.display = "none";
    }, 3000);
    return;
  }

  const start = new Date(startDate);
  const end = new Date(endDate);
  if (end <= start) {
    document.getElementById("endDateErrorNotification").style.display = "block";
    setTimeout(() => {
      document.getElementById("endDateErrorNotification").style.display =
        "none";
    }, 3000);
    return;
  }

  const timeDifference = end - start;
  const days = timeDifference / (1000 * 3600 * 24);
  const quantity = document.getElementById("quantity").value;
  const totalPrice = days * pricePerDay * quantity;

  document.getElementById(
    "totalPrice"
  ).textContent = `Total Price: $${totalPrice}`;
  document.getElementById("notification").style.display = "block";

  setTimeout(() => {
    document.getElementById("notification").style.display = "none";
    closeBookingModal();
  }, 3000);
}
