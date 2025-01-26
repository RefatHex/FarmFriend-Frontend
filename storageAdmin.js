document.addEventListener("DOMContentLoaded", () => {
  const cropDropdown = document.getElementById("preferredCrop");
  const form = document.getElementById("categoryForm");
  const categoryList = document.getElementById("categoryList");
  const editModal = document.getElementById("editModal");
  const closeModalButton = document.querySelector(".close-button");
  const editForm = document.getElementById("editForm");

  // Load available crops for the dropdown
  async function loadCrops() {
    try {
      const response = await fetch(
        "http://localhost:8000/farmers/crops/?=Wheat"
      );

      // Ensure response is OK
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const rawData = await response.json();
      console.log("Raw API Response:", rawData);

      // Extract crops from the results key
      const crops = rawData.results;

      if (!Array.isArray(crops) || crops.length === 0) {
        cropDropdown.innerHTML = '<option value="">No crops available</option>';
        return;
      }

      cropDropdown.innerHTML = "";
      crops.forEach((crop) => {
        const option = document.createElement("option");
        option.value = crop.id;
        option.textContent = crop.name;
        cropDropdown.appendChild(option);
      });
    } catch (error) {
      console.error("Error fetching crops:", error);
      cropDropdown.innerHTML = '<option value="">Failed to load crops</option>';
    }
  }

  // Load and display available gigs
  async function loadGigs() {
    try {
      const response = await fetch(
        "http://localhost:8000/storage/storage-gigs/"
      );
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      const gigs = await response.json();
      displayGigs(gigs.results || []);
    } catch (error) {
      console.error("Error fetching gigs:", error);
    }
  }

  function displayGigs(gigs) {
    categoryList.innerHTML = "";
    gigs.forEach((gig) => {
      const card = document.createElement("div");
      card.className = "category-item";
      card.innerHTML = `
        <div>
          <h3>${gig.address}</h3>
          <p>${gig.description}</p>
          <p>Price: $${gig.price}</p>
          <p>Quantity: ${gig.quantity} tonnes</p>
          <button class="edit-button" data-id="${gig.id}">Edit</button>
          <button class="delete-button" data-id="${gig.id}">Delete</button>
        </div>
      `;
      categoryList.appendChild(card);
    });

    // Add event listeners to edit and delete buttons
    document
      .querySelectorAll(".edit-button")
      .forEach((button) => button.addEventListener("click", openEditModal));
    document
      .querySelectorAll(".delete-button")
      .forEach((button) => button.addEventListener("click", deleteGig));
  }

  // Open edit modal
  function openEditModal(event) {
    const gigId = event.target.dataset.id;

    fetch(`http://localhost:8000/storage/storage-gigs/${gigId}/`)
      .then((response) => response.json())
      .then((gig) => {
        document.getElementById("editGigId").value = gig.id;
        document.getElementById("editAddress").value = gig.address;
        document.getElementById("editDescription").value = gig.description;
        document.getElementById("editPrice").value = gig.price;
        document.getElementById("editQuantity").value = gig.quantity;

        editModal.style.display = "block"; // Show modal
      });
  }

  // Handle gig update
  editForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(editForm);
    const gigId = formData.get("id");

    try {
      const response = await fetch(
        `http://localhost:8000/storage/storage-gigs/${gigId}/`,
        {
          method: "PUT",
          body: formData,
        }
      );
      if (response.ok) {
        Swal.fire({
          icon: 'success', // Indicates success
          title: 'গিগ সফলভাবে আপডেট হয়েছে!',
          confirmButtonText: 'ঠিক আছে'
        });
        editModal.style.display = "none"; // Hide modal
        loadGigs(); // Refresh gig list
      } else {
        Swal.fire({
          icon: 'error', // Indicates an error
          title: 'গিগ আপডেট করতে ব্যর্থ হয়েছে!',
          confirmButtonText: 'ঠিক আছে'
        });
      }
    } catch (error) {
      console.error("Error updating gig:", error);
    }
  });

  // Close edit modal
  closeModalButton.addEventListener("click", () => {
    editModal.style.display = "none";
  });

  // Handle gig deletion
  async function deleteGig(event) {
    const gigId = event.target.dataset.id;

    if (!confirm("Are you sure you want to delete this gig?")) return;

    try {
      const response = await fetch(
        `http://localhost:8000/storage/storage-gigs/${gigId}/`,
        { method: "DELETE" }
      );
      if (response.ok) {
        Swal.fire({
          icon: 'success', // Indicates success
          title: 'গিগ সফলভাবে মুছে ফেলা হয়েছে!',
          confirmButtonText: 'ঠিক আছে'
        });
        loadGigs(); // Refresh gig list
      } else {
        Swal.fire({
          icon: 'error', // Indicates an error
          title: 'গিগ মুছে ফেলতে ব্যর্থ হয়েছে!',
          confirmButtonText: 'ঠিক আছে'
        });
      }
    } catch (error) {
      console.error("Error deleting gig:", error);
    }
  }

  // Handle new gig creation
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(form);

    const userId = getCookie("userID"); // Replace with actual user ID if dynamic
    if (!userId) {
      Swal.fire({
        icon: 'error', // Indicates an error
        title: 'ইউজার আইডি পাওয়া যায়নি!',
        text: 'অনুগ্রহ করে পুনরায় লগইন করুন।',
        confirmButtonText: 'ঠিক আছে'
      });
      return;
    }

    formData.append("storage_owner", userId);

    try {
      const response = await fetch(
        "http://localhost:8000/storage/storage-gigs/",
        {
          method: "POST",
          body: formData,
        }
      );

      if (response.ok) {
        Swal.fire({
          icon: 'success', // Indicates success
          title: 'স্টোরেজ গিগ সফলভাবে পোস্ট করা হয়েছে!',
          confirmButtonText: 'ঠিক আছে'
        });
        form.reset();
        cropDropdown.value = "";
        loadGigs(); // Refresh gig list
      } else {
        const errorData = await response.json();
        console.error("Failed to post storage gig:", errorData);
        alert(`Failed to post storage gig: ${JSON.stringify(errorData)}`);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      Swal.fire({
        icon: 'error', // Indicates an error
        title: 'ফর্ম সাবমিট করতে একটি ত্রুটি ঘটেছে!',
        confirmButtonText: 'ঠিক আছে'
      });
    }
  });

  loadCrops();
  loadGigs();
});
