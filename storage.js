// Slider and Dot Navigation
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

// Fetch Data and Render Cards
document.addEventListener("DOMContentLoaded", fetchDataAndRenderCards);

async function fetchDataAndRenderCards() {
  try {
    const response = await fetch(
      "http://localhost:8000/storage/storage-gigs-details/"
    );
    const { results = [] } = await response.json();

    const cardsContainer = document.getElementById("cardsContainer");
    cardsContainer.innerHTML = "";

    results.forEach((gig) => createCard(gig, cardsContainer));
  } catch (error) {
    console.error("Failed to fetch storage data:", error);
  }
}

// Create a card dynamically
function createCard(gig, container) {
  const {
    storage_owner: owner = {},
    address = "No address provided",
    image = "assets/images/default.jpg",
    description = "No description available",
    price = 0,
    is_Available = false,
    prefered_crop = "N/A",
    quantity = 0,
    id,
  } = gig;

  const cardDiv = document.createElement("div");
  cardDiv.classList.add("card");

  // Image
  const imgEl = document.createElement("img");
  imgEl.src = image;
  imgEl.alt = owner.name || "Storage Image";
  cardDiv.appendChild(imgEl);

  // Title
  const titleEl = document.createElement("h3");
  titleEl.textContent = owner.name || "Unknown Storage";
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

  // Availability
  const availabilityEl = document.createElement("p");
  availabilityEl.textContent = is_Available ? "Available" : "Not Available";
  cardDiv.appendChild(availabilityEl);

  // Preferred Crop
  const cropEl = document.createElement("p");
  cropEl.textContent = `Preferred Crop: ${prefered_crop.name || "N/A"}`;
  cardDiv.appendChild(cropEl);

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

// Details Modal Logic
let currentGigPrice = 0;

function openDetailsModal(gig) {
  currentGigPrice = parseFloat(gig.price) || 0;

  document.getElementById("detailName").textContent =
    gig.owner?.name || "Unknown Storage";
  document.getElementById("detailImage").src =
    gig.image || "assets/images/default.jpg";
  document.getElementById("detailAddress").textContent = `Address: ${
    gig.address || "N/A"
  }`;
  document.getElementById("detailCapacity").textContent = `Capacity: ${
    gig.quantity || 0
  } tonnes`;
  document.getElementById("detailPrice").textContent = `Price: $${
    gig.price || 0
  }/day`;
  document.getElementById("detailAvailability").textContent = gig.is_Available
    ? "Available"
    : "Not Available";
  document.getElementById(
    "detailPreferredCrop"
  ).textContent = `Preferred Crop: ${gig.prefered_crop.name || "N/A"}`;
  document.getElementById("detailDescription").textContent =
    gig.description || "No description available.";

  const bookNowButton = document.getElementById("detailsSubmitBookingBtn");
  bookNowButton.onclick = () => bookNow(gig);

  document.getElementById("detailsModal").style.display = "flex";
}

function closeDetailsModal() {
  document.getElementById("detailsModal").style.display = "none";
}

// Booking Logic
async function bookNow(gig) {
  const startDate = document.getElementById("detailsStartDate").value;
  const endDate = document.getElementById("detailsEndDate").value;
  const quantity = parseInt(
    document.getElementById("detailsQuantity").value,
    10
  );

  if (!startDate || !endDate || isNaN(quantity) || quantity <= 0) {
    return;
  }

  if (new Date(endDate) <= new Date(startDate)) {
    return;
  }

  const bookingPayload = {
    farmer: getCookie("farmersId") || 1,
    storage_owner: gig.owner?.id || 1,
    gigs_offered: gig.id,
    crops: gig.prefered_crop.id || 1,
    start_date: startDate,
    end_date: endDate,
    completed: false,
    is_confirmed: true,
    is_ready_for_pickup: false,
  };

  try {
    console.log("Booking Payload:", bookingPayload);
    const response = await fetch(
      "http://localhost:8000/storage/storage-deals/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookingPayload),
      }
    );

    if (response.ok) {
      document.getElementById("detailsModal").style.display = "none";
    } else {
      console.error("Booking failed:", response.statusText);
    }
  } catch (error) {
    console.error("Booking failed:", error);
  }
}
