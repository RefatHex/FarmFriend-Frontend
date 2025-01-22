////////////////////////////////////////
// Slider and Dot Navigation
////////////////////////////////////////
let currentSlide = 0;
const slides = document.querySelectorAll(".slide");
const dotsContainer = document.getElementById("dot-nav");

// Generate dot navigation dynamically
slides.forEach((_, index) => {
  const dot = document.createElement("div");
  dot.classList.add("dot");
  dot.addEventListener("click", () => moveToSlide(index));
  dotsContainer.appendChild(dot);
});
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
// Fetch Data and Render Cards
////////////////////////////////////////
document.addEventListener("DOMContentLoaded", fetchDataAndRenderCards);

async function fetchDataAndRenderCards() {
  try {
    const response = await fetch(
      "http://localhost:8000/storage/storage-gigs-details/"
    );
    const { results = [] } = await response.json();

    const cardsContainer = document.getElementById("cardsContainer");
    cardsContainer.innerHTML = ""; // Clear existing content

    results.forEach((gig) => createCard(gig, cardsContainer));
  } catch (error) {
    console.error("Failed to fetch storage data:", error);
  }
}

// Create a card dynamically
function createCard(gig, container) {
  const {
    storage_owner: owner,
    address,
    image,
    description,
    price,
    is_Available,
    prefered_crop,
    quantity,
    id,
  } = gig;

  const cardDiv = document.createElement("div");
  cardDiv.classList.add("card");

  // Image
  const imgEl = document.createElement("img");
  imgEl.src = image;
  imgEl.alt = owner?.name || "Storage Image";
  cardDiv.appendChild(imgEl);

  // Title
  const titleEl = document.createElement("h3");
  titleEl.textContent = owner?.name || "Unknown Storage";
  cardDiv.appendChild(titleEl);

  // Address
  const addressEl = document.createElement("p");
  addressEl.textContent = `Address: ${address}`;
  cardDiv.appendChild(addressEl);

  // Capacity
  const capacityEl = document.createElement("p");
  capacityEl.textContent = `Capacity: ${quantity} tonnes`;
  cardDiv.appendChild(capacityEl);

  // Price
  const priceEl = document.createElement("p");
  priceEl.classList.add("price");
  priceEl.textContent = `Price: $${price}/day`;
  cardDiv.appendChild(priceEl);

  // View Details Button
  const detailsBtn = document.createElement("button");
  detailsBtn.classList.add("btn-view-details");
  detailsBtn.textContent = "View Details";
  detailsBtn.addEventListener("click", () =>
    openDetailsModal({
      id,
      owner,
      address,
      image,
      description,
      price,
      is_Available,
      prefered_crop,
      quantity,
    })
  );
  cardDiv.appendChild(detailsBtn);

  container.appendChild(cardDiv);
}

////////////////////////////////////////
// Details Modal Logic
////////////////////////////////////////
let currentGigPrice = 0;

function openDetailsModal(gig) {
  currentGigPrice = parseFloat(gig.price) || 0;

  document.getElementById("detailName").textContent =
    gig.owner?.name || "Unknown Storage";
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
  document.getElementById("detailDescription").textContent =
    gig.description || "";

  document.getElementById("detailsModal").style.display = "flex";
}

function closeDetailsModal() {
  document.getElementById("detailsModal").style.display = "none";
}

////////////////////////////////////////
// Booking Logic
////////////////////////////////////////
function calculateTotalPrice() {
  const startDate = new Date(document.getElementById("detailsStartDate").value);
  const endDate = new Date(document.getElementById("detailsEndDate").value);
  const quantity = document.getElementById("detailsQuantity").value;

  if (!startDate || !endDate || isNaN(startDate) || isNaN(endDate)) {
    showNotification("errorNotification");
    return null;
  }

  if (endDate <= startDate) {
    showNotification("endDateErrorNotification");
    return null;
  }

  const days = (endDate - startDate) / (1000 * 3600 * 24);
  return days * currentGigPrice * quantity;
}

function showNotification(notificationId) {
  const notification = document.getElementById(notificationId);
  notification.style.display = "block";
  setTimeout(() => (notification.style.display = "none"), 3000);
}

document
  .getElementById("detailsSubmitBookingBtn")
  .addEventListener("click", () => {
    const totalPrice = calculateTotalPrice();
    if (totalPrice) {
      document.getElementById(
        "detailsTotalPrice"
      ).textContent = `Total Price: $${totalPrice}`;
      closeDetailsModal();
    }
  });
