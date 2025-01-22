// Fetch crops for dropdown
const fetchCrops = async () => {
  const cropDropdown = document.getElementById("preferedCrop");
  try {
    const response = await fetch("http://localhost:8000/farmers/crops/");
    const data = await response.json();
    cropDropdown.innerHTML = data.results
      .map((crop) => `<option value="${crop.id}">${crop.name}</option>`)
      .join("");
  } catch (error) {
    console.error("Error fetching crops:", error);
  }
};

// Handle gig submission
const submitGig = async () => {
  const address = document.getElementById("address").value;
  const description = document.getElementById("description").value;
  const price = parseFloat(document.getElementById("price").value);
  const preferedCrop = parseInt(document.getElementById("preferedCrop").value);
  const quantity = parseInt(document.getElementById("quantity").value);
  const isAvailable = document.getElementById("isAvailable").checked;
  const image = document.getElementById("image").files[0];

  const formData = new FormData();
  formData.append("storage_owner", 1); // Default storage owner
  formData.append("farmer", 1); // Default farmer
  formData.append("address", address);
  formData.append("description", description);
  formData.append("price", price);
  formData.append("prefered_crop", preferedCrop);
  formData.append("quantity", quantity);
  formData.append("is_Available", isAvailable);
  if (image) {
    formData.append("image", image);
  }

  try {
    const response = await fetch(
      "http://localhost:8000/storage/storage-gigs/",
      {
        method: "POST",
        body: formData,
      }
    );

    if (response.ok) {
      alert("Gig uploaded successfully!");
      location.reload();
    } else {
      console.error("Error uploading gig:", response.statusText);
    }
  } catch (error) {
    console.error("Error uploading gig:", error);
  }
};

// Fetch and display gigs
const loadGigs = async () => {
  const gigsList = document.getElementById("gigsList");
  try {
    const response = await fetch("http://localhost:8000/storage/storage-gigs/");
    const data = await response.json();
    gigsList.innerHTML = data.results
      .map(
        (gig) => `
                    <div class="list-group-item d-flex justify-content-between align-items-center">
                        <div>
                            <h5 class="mb-1">${gig.address}</h5>
                            <p class="mb-1">${gig.description}</p>
                            <small>Price: $${gig.price} | Quantity: ${gig.quantity}</small>
                        </div>
                        <div>
                            <button class="btn btn-warning btn-sm me-2" onclick="editGig(${gig.id})">Edit</button>
                            <button class="btn btn-danger btn-sm" onclick="deleteGig(${gig.id})">Delete</button>
                        </div>
                    </div>`
      )
      .join("");
  } catch (error) {
    console.error("Error fetching gigs:", error);
  }
};

// Handle gig deletion
const deleteGig = async (gigId) => {
  if (confirm("Are you sure you want to delete this gig?")) {
    try {
      const response = await fetch(
        `http://localhost:8000/storage/storage-gigs/${gigId}/`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        alert("Gig deleted successfully!");
        loadGigs();
      } else {
        console.error("Error deleting gig:", response.statusText);
      }
    } catch (error) {
      console.error("Error deleting gig:", error);
    }
  }
};

// Handle gig editing
const editGig = async (gigId) => {
  try {
    const response = await fetch(
      `http://localhost:8000/storage/storage-gigs/${gigId}/`
    );
    const gig = await response.json();

    document.getElementById("editGigId").value = gig.id;
    document.getElementById("editAddress").value = gig.address;
    document.getElementById("editDescription").value = gig.description;
    document.getElementById("editPrice").value = gig.price;
    document.getElementById("editQuantity").value = gig.quantity;
    document.getElementById("editIsAvailable").checked = gig.is_Available;
    document.getElementById("editImagePreview").src = gig.image || "";

    const editModal = new bootstrap.Modal(
      document.getElementById("editGigModal")
    );
    editModal.show();
  } catch (error) {
    console.error("Error fetching gig details:", error);
  }
};

const updateGig = async () => {
  const gigId = document.getElementById("editGigId").value;
  const address = document.getElementById("editAddress").value;
  const description = document.getElementById("editDescription").value;
  const price = parseFloat(document.getElementById("editPrice").value);
  const quantity = parseInt(document.getElementById("editQuantity").value);
  const isAvailable = document.getElementById("editIsAvailable").checked;
  const image = document.getElementById("editImage").files[0];

  const formData = new FormData();
  formData.append("address", address);
  formData.append("description", description);
  formData.append("price", price);
  formData.append("quantity", quantity);
  formData.append("is_Available", isAvailable);
  if (image) {
    formData.append("image", image);
  }

  try {
    const response = await fetch(
      `http://localhost:8000/storage/storage-gigs/${gigId}/`,
      {
        method: "PATCH",
        body: formData,
      }
    );

    if (response.ok) {
      alert("Gig updated successfully!");
      location.reload();
    } else {
      console.error("Error updating gig:", response.statusText);
    }
  } catch (error) {
    console.error("Error updating gig:", error);
  }
};

// Initialize the page
const init = () => {
  fetchCrops();
  loadGigs();

  document.getElementById("uploadGigForm").addEventListener("submit", (e) => {
    e.preventDefault();
    submitGig();
  });

  document.getElementById("editGigForm").addEventListener("submit", (e) => {
    e.preventDefault();
    updateGig();
  });
};

document.addEventListener("DOMContentLoaded", init);
