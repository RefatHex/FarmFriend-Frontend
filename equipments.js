const API_URL = "http://localhost:8000/rentals/rent-items/";
let nextUrl = null;
let prevUrl = null;

// Fetch and render gigs dynamically
async function fetchAndRenderGigs(url = API_URL) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Failed to fetch gigs");
    }

    const data = await response.json(); // Parse the paginated response
    const gigs = data.results; // Extract results from the response
    nextUrl = data.next; // Save the next page URL
    prevUrl = data.previous; // Save the previous page URL

    const cardsSection = document.querySelector(".cards-section");
    cardsSection.innerHTML = ""; // Clear existing cards

    gigs.forEach((gig) => {
      const card = document.createElement("div");
      card.className = "card";

      const imageUrl = gig.image ? gig.image : "assets/images/farmfriend.png";

      card.innerHTML = `
        <img src="${imageUrl}" alt="${gig.title}" />
        <h3>${gig.product_name}</h3>
        <p>${gig.description}</p>
        <div class="price">Price: $${gig.price}/day</div>
        <button class="btn-booking" onclick="openModal('${gig.title}', ${gig.price})">Book Now</button>
        <div class="details-bar">
          <p><strong>Details:</strong> This gig is provided by ${gig.rent_owner.name}. Contact: ${gig.rent_owner.contact}.</p>
        </div>
      `;

      cardsSection.appendChild(card);
    });

    // Update pagination buttons
    document.getElementById("prevButton").disabled = !prevUrl;
    document.getElementById("nextButton").disabled = !nextUrl;
  } catch (error) {
    console.error("Error fetching gigs:", error);
  }
}

// Add event listeners for pagination buttons
document.getElementById("nextButton").addEventListener("click", () => {
  if (nextUrl) {
    fetchAndRenderGigs(nextUrl);
  }
});

document.getElementById("prevButton").addEventListener("click", () => {
  if (prevUrl) {
    fetchAndRenderGigs(prevUrl);
  }
});

fetchAndRenderGigs();
