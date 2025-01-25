// Fetch user and role details
async function fetchRoleDetails() {
  const selectedRole = getCookie("selectedRole"); // Retrieve selectedRole from cookies
  const userId = getCookie("userId"); // Retrieve userId from cookies

  if (!selectedRole || !userId) {
    alert("User role or ID not found. Redirecting to login page...");
    window.location.href = "login.html";
    return;
  }

  const roleEndpoints = {
    farmersId: "farmers/farmers",
    "rent-ownersId": "rentals/rent-owners",
    "storage-ownersId": "storage/storage-owners",
    agronomistsId: "consultations/agronomists",
  };

  const endpoint = roleEndpoints[selectedRole];
  if (!endpoint) {
    alert("Invalid role. Redirecting to login page...");
    window.location.href = "login.html";
    return;
  }

  try {
    const response = await fetch(
      `http://127.0.0.1:8000/${endpoint}/?user=${userId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (response.ok) {
      const data = await response.json();

      // Extract the first result
      const roleDetails = data.results && data.results[0];
      if (roleDetails) {
        // Update general information
        document.getElementById("username").innerText =
          roleDetails.name || "User";
        document.getElementById("userName").innerText =
          roleDetails.name || "Unknown Username";
        document.getElementById("userRole").innerText =
          selectedRole || "Unknown Role";

        // Generate role-based information
        populateRoleDetails(roleDetails);
      } else {
        console.warn("No role details found.");
        alert("No role details available. Redirecting to homepage...");
        window.location.href = "index.html";
      }
    } else {
      console.error("Failed to fetch role details:", response.statusText);
      alert("Error loading role details. Redirecting to login page...");
      window.location.href = "login.html";
    }
  } catch (error) {
    console.error("An error occurred while fetching role details:", error);
    alert("Error loading profile. Redirecting to login page...");
    window.location.href = "login.html";
  }
}

// Populate role-based details with edit functionality
function populateRoleDetails(roleDetails) {
  const roleDetailsContainer = document.getElementById("roleDetails");
  roleDetailsContainer.innerHTML = ""; // Clear existing content

  // List of immutable fields
  const immutableFields = ["no_of_deals", "id", "user"];

  Object.keys(roleDetails).forEach((key) => {
    const value = roleDetails[key];
    const isImmutable = immutableFields.includes(key);

    // Create a container for each field
    const fieldContainer = document.createElement("div");
    fieldContainer.classList.add("field-container");

    // Create a label
    const label = document.createElement("strong");
    label.innerText = `${key.replace(/_/g, " ").toUpperCase()}: `;
    fieldContainer.appendChild(label);

    // Create a span to show the value
    const valueSpan = document.createElement("span");
    valueSpan.innerText = value;
    valueSpan.id = `field-${key}`;
    fieldContainer.appendChild(valueSpan);

    // Add edit button for mutable fields
    if (!isImmutable) {
      const editButton = document.createElement("button");
      editButton.innerText = "Edit";
      editButton.classList.add("btn-edit");
      editButton.onclick = () => editField(key, valueSpan);
      fieldContainer.appendChild(editButton);
    }

    // Append the field container to the role details section
    roleDetailsContainer.appendChild(fieldContainer);
  });
}

// Edit a field
function editField(key, valueSpan) {
  // Replace the value span with an input field
  const currentValue = valueSpan.innerText;
  const input = document.createElement("input");
  input.type = "text";
  input.value = currentValue;
  input.id = `edit-${key}`;

  // Replace the span with the input field
  valueSpan.parentElement.replaceChild(input, valueSpan);

  // Add save button
  const saveButton = document.createElement("button");
  saveButton.innerText = "Save";
  saveButton.classList.add("btn-save");
  saveButton.onclick = () => saveField(key, input);
  input.parentElement.appendChild(saveButton);
}

// Save the edited field
async function saveField(key, input) {
  const newValue = input.value;
  const userId = getCookie("userId");
  const selectedRole = getCookie("selectedRole");

  const roleEndpoints = {
    farmersId: "farmers/farmers",
    "rent-ownersId": "rentals/rent-owners",
    "storage-ownersId": "storage/storage-owners",
    agronomistsId: "consultations/agronomists",
  };

  const endpoint = roleEndpoints[selectedRole];

  try {
    const response = await fetch(
      `http://127.0.0.1:8000/${endpoint}/${userId}/`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ [key]: newValue }),
      }
    );

    if (response.ok) {
      alert("Field updated successfully.");
      // Reload the page to reflect changes
      window.location.reload();
    } else {
      alert("Failed to update field. Please try again.");
      console.error("Error updating field:", response.statusText);
    }
  } catch (error) {
    alert("An error occurred while updating the field.");
    console.error("Error updating field:", error);
  }
}

// Redirect to change password page
function redirectToChangePassword() {
  window.location.href = "changePassword.html";
}

// Logout function
function logout() {
  alert("You have been logged out.");
  // Clear cookies
  document.cookie = "userId=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  document.cookie =
    "selectedRole=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  window.location.href = "login.html";
}

// Load role details on page load
document.addEventListener("DOMContentLoaded", fetchRoleDetails);
// Toggle the visibility of the billing section
function toggleBillingSection() {
  const billingSection = document.getElementById("billingSection");
  billingSection.style.display =
    billingSection.style.display === "none" ? "block" : "none";

  // Fetch billing details if not already fetched
  if (billingSection.style.display === "block") {
    fetchBillingDetails();
  }
}

// Fetch billing details
async function fetchBillingDetails() {
  const userId = getCookie("userId");

  try {
    const response = await fetch(
      `http://localhost:8000/billing/billing-addresses/?user=${userId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (response.ok) {
      const data = await response.json();

      if (data.results && data.results.length > 0) {
        populateBillingForm(data.results[0]);
      } else {
        console.warn("No billing details found.");
        alert("No billing details found. Please add your billing information.");
      }
    } else {
      console.error("Failed to fetch billing details:", response.statusText);
      alert("Error fetching billing details. Please try again.");
    }
  } catch (error) {
    console.error("Error occurred while fetching billing details:", error);
    alert("An error occurred. Please try again.");
  }
}

// Populate billing form with existing data
function populateBillingForm(billingData) {
  document.getElementById("street").value = billingData.street || "";
  document.getElementById("city").value = billingData.city || "";
  document.getElementById("state").value = billingData.state || "";
  document.getElementById("postal_code").value = billingData.postal_code || "";
  document.getElementById("country").value = billingData.country || "";
}

// Submit billing form
document
  .getElementById("billingForm")
  .addEventListener("submit", async (event) => {
    event.preventDefault();

    const userId = getCookie("userId");
    const billingData = {
      user: userId,
      street: document.getElementById("street").value,
      city: document.getElementById("city").value,
      state: document.getElementById("state").value,
      postal_code: document.getElementById("postal_code").value,
      country: document.getElementById("country").value,
    };

    try {
      // Check if billing info exists
      const checkResponse = await fetch(
        `http://localhost:8000/billing/billing-addresses/?user=${userId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (checkResponse.ok) {
        const checkData = await checkResponse.json();
        if (checkData.results && checkData.results.length > 0) {
          // Update existing billing info
          const billingId = checkData.results[0].id;
          await updateBillingInfo(billingId, billingData);
        } else {
          // Create new billing info
          await createBillingInfo(billingData);
        }
      } else {
        console.error(
          "Failed to check billing details:",
          checkResponse.statusText
        );
        alert("Error checking billing details. Please try again.");
      }
    } catch (error) {
      console.error("Error occurred while saving billing details:", error);
      alert("An error occurred. Please try again.");
    }
  });

// Create new billing info
async function createBillingInfo(billingData) {
  try {
    const response = await fetch(
      `http://localhost:8000/billing/billing-addresses/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(billingData),
      }
    );

    if (response.ok) {
      alert("Billing information saved successfully!");
      fetchBillingDetails(); // Refresh form
    } else {
      console.error("Failed to create billing info:", response.statusText);
      alert("Error saving billing information. Please try again.");
    }
  } catch (error) {
    console.error("Error occurred while creating billing info:", error);
    alert("An error occurred. Please try again.");
  }
}

// Update existing billing info
async function updateBillingInfo(billingId, billingData) {
  try {
    const response = await fetch(
      `http://localhost:8000/billing/billing-addresses/${billingId}/`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(billingData),
      }
    );

    if (response.ok) {
      alert("Billing information updated successfully!");
      fetchBillingDetails(); // Refresh form
    } else {
      console.error("Failed to update billing info:", response.statusText);
      alert("Error updating billing information. Please try again.");
    }
  } catch (error) {
    console.error("Error occurred while updating billing info:", error);
    alert("An error occurred. Please try again.");
  }
}

// Toggle the visibility of the payments section
function togglePaymentsSection() {
  const paymentsSection = document.getElementById("paymentsSection");
  paymentsSection.style.display =
    paymentsSection.style.display === "none" ? "block" : "none";

  // Fetch payments details if not already fetched
  if (paymentsSection.style.display === "block") {
    fetchPayments();
  }
}

// Fetch payments details
async function fetchPayments() {
  const userId = getCookie("userId");

  try {
    const response = await fetch(
      `http://localhost:8000/payment/payments/?user=${userId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (response.ok) {
      const data = await response.json();

      if (data.results && data.results.length > 0) {
        populatePaymentsTable(data.results);
      } else {
        console.warn("No payments found.");
        alert("No payment records found.");
      }
    } else {
      console.error("Failed to fetch payments:", response.statusText);
      alert("Error fetching payments. Please try again.");
    }
  } catch (error) {
    console.error("Error occurred while fetching payments:", error);
    alert("An error occurred. Please try again.");
  }
}

// Populate payments table
function populatePaymentsTable(payments) {
  const paymentsTableBody = document.querySelector("#paymentsTable tbody");
  paymentsTableBody.innerHTML = ""; // Clear existing rows

  payments.forEach((payment) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${payment.amount}</td>
      <td>${payment.payment_date}</td>
      <td>${payment.payment_method}</td>
      <td>${payment.status}</td>
    `;

    paymentsTableBody.appendChild(row);
  });
}

// Cookie helper functions
function getCookie(name) {
  const nameEQ = name + "=";
  const cookies = document.cookie.split(";");
  for (let i = 0; i < cookies.length; i++) {
    let cookie = cookies[i].trim();
    if (cookie.indexOf(nameEQ) === 0) {
      return decodeURIComponent(cookie.substring(nameEQ.length));
    }
  }
  return null;
}
