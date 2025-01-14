// rentAdmin.js

// Grab relevant DOM elements
const form = document.getElementById("categoryForm");
const categoryList = document.getElementById("categoryList");

// ============== FETCH & DISPLAY PRODUCTS ==============
async function fetchAvailableProducts() {
  try {
    const response = await fetch(
      "http://localhost:8000/rentals/rent-items/?rent_owner=1"
    );
    if (response.ok) {
      const data = await response.json();
      const products = data.results;
      categoryList.innerHTML = "";

      products.forEach((product) => {
        const productItem = document.createElement("div");
        productItem.className = "category-item";

        productItem.innerHTML = `
          <img src="${
            product.image || "assets/images/default-product.jpg"
          }" alt="${product.product_name}">
          <div class="category-item-content">
              <h3>${product.product_name}</h3> 
              <p>${product.description}</p>
              <p><strong>Price Per Day:</strong> $${product.price}</p>
              <p><strong>Owner:</strong> ${product.rent_owner.name}</p>
              <p><strong>Contact:</strong> ${product.rent_owner.contact}</p>
              <p><strong>Deals Completed:</strong> ${
                product.rent_owner.no_of_deals
              }</p>
              <p><strong>Next Available Date:</strong> ${
                product.availabilityDate || "N/A"
              }</p>
          </div>
          <div class="category-item-actions">
              <button class="edit">Edit</button>
              <button class="remove">Remove</button>
          </div>
        `;

        categoryList.appendChild(productItem);

        // ============== REMOVE BUTTON (DELETE) ==============
        const removeButton = productItem.querySelector(".remove");
        removeButton.addEventListener("click", () => {
          const confirmDelete = confirm(
            `Are you sure you want to remove "${product.product_name}"?`
          );
          if (confirmDelete) {
            deleteProduct(product.id);
          }
        });
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
      fetchAvailableProducts(); // Refresh list
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
    formData.append("rent_owner", 1);
    formData.append("product_name", type);
    formData.append("description", description);
    formData.append("price", price);
    formData.append("quantity", quantity);
    formData.append("is_available", true);
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
        console.log("Gig posted successfully:", await response.json());
        fetchAvailableProducts(); // Refresh list
      } else {
        console.error("Failed to post gig:", await response.text());
        alert("Failed to post gig. Please try again.");
      }
    } catch (error) {
      console.error("Error posting gig:", error);
      alert("An error occurred. Please try again later.");
    }

    form.reset();
  } else {
    alert("Please fill out all required fields.");
  }
});

// ============== INITIAL LOAD ==============
fetchAvailableProducts();
