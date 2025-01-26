const form = document.getElementById("categoryForm");
const categoryList = document.getElementById("categoryList");

rent_owner = getCookie("rent-ownersId");
console.log("Rent owner ID:", rent_owner);

let currentEditProductId = null;
const editModalEl = document.getElementById("editModal");

const closeEditModalBtn = document.getElementById("closeEditModal");
const cancelEditModalBtn = document.getElementById("cancelEditModal");

function showEditModal() {
  editModalEl.style.display = "block";
  editModalEl.classList.add("show");
}

function hideEditModal() {
  editModalEl.style.display = "none";
  editModalEl.classList.remove("show");
}

closeEditModalBtn.addEventListener("click", hideEditModal);
cancelEditModalBtn.addEventListener("click", hideEditModal);

// ============== FETCH & DISPLAY PRODUCTS ==============
async function fetchAvailableProducts() {
  try {
    const response = await fetch(
      `http://localhost:8000/rentals/rent-items-with-user/?rent_owner=${rent_owner}`
    );
    if (response.ok) {
      const data = await response.json();
      const products = data.results;
      categoryList.innerHTML = "";

      // Create heading
      const heading = document.createElement("h3");
      heading.textContent = "Available Instruments";
      categoryList.appendChild(heading);

      // Create container for cards
      const cardsContainer = document.createElement("div");
      cardsContainer.className = "cards-container";
      categoryList.appendChild(cardsContainer);

      products.forEach((product) => {
        const productItem = document.createElement("div");
        productItem.className = "category-item";

        // Your existing product item HTML...
        productItem.innerHTML = `
          <img 
            src="${product.image || "assets/images/default-product.jpg"}"
            alt="${product.product_name}"
          >
          <div class="category-item-content">
            <h4>${product.product_name}</h4>
            <p>${product.description}</p>
            <p><strong>Price Per Day:</strong> $${product.price}</p>
            <p><strong>Owner:</strong> ${product.rent_owner.name}</p>
            <p><strong>Contact:</strong> ${product.rent_owner.contact}</p>
            <p><strong>Deals Completed:</strong> ${
              product.rent_owner.no_of_deals
            }</p>
            <p><strong>Available:</strong> ${
              product.is_available ? "Yes" : "No"
            }</p>
          </div>
          <div class="category-item-actions">
            <button class="edit btn btn-sm btn-warning">Edit</button>
            <button class="remove btn btn-sm btn-danger">Remove</button>
          </div>
        `;

        // Append to cards container instead of category list
        cardsContainer.appendChild(productItem);

        // Your existing button event listeners...
      });
    } else {
      console.error(
        "Failed to fetch available products:",
        await response.text()
      );
    }
  } catch (error) {
    console.error("Error fetching available products:", error);
  }
}
// ============== DELETE PRODUCT BY ID ==============
async function deleteProduct(productId) {
  try {
    const response = await fetch(
      `http://localhost:8000/rentals/rent-items/${productId}/`,
      {
        method: "DELETE",
      }
    );
    if (response.ok) {
      alert("Product removed successfully.");
      fetchAvailableProducts();
    } else {
      console.error("Failed to remove the product:", await response.text());
      alert("Failed to remove the product. Please try again.");
    }
  } catch (error) {
    console.error("Error removing product:", error);
    alert("An error occurred. Please try again later.");
  }
}

// ============== FORM SUBMISSION (POST NEW ITEM) ==============
form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const type = document.getElementById("categoryType").value;
  const description = document.getElementById("categoryDescription").value;
  const price = document.getElementById("categoryPrice").value;
  const quantity = document.getElementById("categoryQuantity").value;
  const image = document.getElementById("categoryImage").files[0];

  if (type && description && price && quantity && image) {
    const formData = new FormData();
    formData.append("is_available", "True");

    formData.append("rent_owner", rent_owner || 1);
    formData.append("product_name", type);
    formData.append("description", description);
    formData.append("price", price);
    formData.append("quantity", quantity);
    formData.append("image", image);

    try {
      const response = await fetch(
        "http://localhost:8000/rentals/rent-items/",
        {
          method: "POST",
          body: formData,
        }
      );

      if (response.ok) {
        console.log("Instrument posted successfully:", await response.json());
        fetchAvailableProducts(); // Refresh list
      } else {
        console.error("Failed to post instrument:", await response.text());
        alert("Failed to post instrument. Please try again.");
      }
    } catch (error) {
      console.error("Error posting instrument:", error);
      alert("An error occurred. Please try again later.");
    }

    form.reset();
  } else {
    alert("Please fill out all required fields.");
  }
});

// ============== EDIT FORM SUBMISSION (PATCH EXISTING ITEM) ==============
const editForm = document.getElementById("editForm");
editForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const productId = currentEditProductId;
  if (!productId) {
    alert("No product selected for editing.");
    return;
  }

  const updatedCategoryType = document.getElementById("editCategoryType").value;
  const updatedDescription = document.getElementById(
    "editCategoryDescription"
  ).value;
  const updatedPrice = document.getElementById("editCategoryPrice").value;
  const updatedQuantity = document.getElementById("editCategoryQuantity").value;
  const updatedIsAvailableString =
    document.getElementById("editIsAvailable").value === "true"
      ? "True"
      : "False";

  const updatedImageFile =
    document.getElementById("editCategoryImage").files[0];

  const formData = new FormData();
  formData.append("product_name", updatedCategoryType);
  formData.append("description", updatedDescription);
  formData.append("price", updatedPrice);
  formData.append("quantity", updatedQuantity);
  formData.append("is_available", updatedIsAvailableString);

  if (updatedImageFile) {
    formData.append("image", updatedImageFile);
  }

  try {
    const response = await fetch(
      `http://localhost:8000/rentals/rent-items/${productId}/`,
      {
        method: "PATCH",
        body: formData,
      }
    );

    if (response.ok) {
      alert("Product updated successfully.");
      // Hide the modal
      hideEditModal();
      // Refresh
      fetchAvailableProducts();
    } else {
      console.error("Failed to update the product:", await response.text());
      alert("Failed to update the product. Please try again.");
    }
  } catch (error) {
    console.error("Error updating product:", error);
    alert("An error occurred. Please try again later.");
  }
});

// ============== INITIAL LOAD ==============
fetchAvailableProducts();

// Optional: Clear cookies for debugging
// deleteCookie("rent-ownersId");
// etc.
