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
        Swal.fire({
          icon: 'warning', // Icon to indicate a warning or information
          title: 'ভূমিকা সম্পর্কিত তথ্য পাওয়া যায়নি।',
          text: 'আপনাকে হোমপেজে পুনঃনির্দেশিত করা হচ্ছে...',
          confirmButtonText: 'ঠিক আছে'
        }).then(() => {
          // Redirect to the homepage after the alert is closed
          window.location.href = '/'; // Replace '/' with your homepage URL
        });
        window.location.href = "index.html";
      }
    } else {
      console.error("Failed to fetch role details:", response.statusText);
      Swal.fire({
        icon: 'error', // Icon to indicate an error
        title: 'ভূমিকা সম্পর্কিত তথ্য লোড করতে সমস্যা হয়েছে।',
        text: 'আপনাকে লগইন পৃষ্ঠায় পুনঃনির্দেশিত করা হচ্ছে...',
        confirmButtonText: 'ঠিক আছে'
      }).then(() => {
        // Redirect to the login page after the alert is closed
        window.location.href = "login.html"; // Replace '/login' with your login page URL
      });
      
    }
  } catch (error) {
    console.error("An error occurred while fetching role details:", error);
    Swal.fire({
      icon: 'error', // Icon to indicate an error
      title: 'প্রোফাইল লোড করতে সমস্যা হয়েছে।',
      text: 'আপনাকে লগইন পৃষ্ঠায় পুনঃনির্দেশিত করা হচ্ছে...',
      confirmButtonText: 'ঠিক আছে'
    }).then(() => {
      // Redirect to the login page after the alert is closed
      window.location.href = "login.html"; // Replace '/login' with your login page URL
    });
    
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
      Swal.fire({
        icon: 'success', // Icon to indicate success
        title: 'ফিল্ড সফলভাবে আপডেট করা হয়েছে।',
        confirmButtonText: 'ঠিক আছে'
      });
      // Reload the page to reflect changes
      window.location.reload();
    } else {
      Swal.fire({
        icon: 'error', // Icon to indicate an error
        title: 'ফিল্ড আপডেট করতে ব্যর্থ হয়েছে।',
        text: 'দয়া করে আবার চেষ্টা করুন।',
        confirmButtonText: 'ঠিক আছে'
      });
      console.error("Error updating field:", response.statusText);
    }
  } catch (error) {
    Swal.fire({
      icon: 'error', // Icon to indicate an error
      title: 'ফিল্ড আপডেট করার সময় একটি ত্রুটি ঘটেছে।',
      confirmButtonText: 'ঠিক আছে'
    });
    console.error("Error updating field:", error);
  }
}

// Redirect to change password page

// Logout function
function logout() {
  // Clear cookies
  document.cookie = "userId=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  document.cookie =
    "selectedRole=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    Swal.fire({
      icon: 'info', // Icon to indicate information
      title: 'আপনি লগআউট হয়ে গেছেন।',
      confirmButtonText: 'ঠিক আছে'
    }).then(() => {
      // Redirect to the login page after the alert is closed
      window.location.href = 'login.html'; // Replace with your login page URL
    });
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
        Swal.fire({
          icon: 'warning', // Icon to indicate a warning
          title: 'বিলিং তথ্য পাওয়া যায়নি।',
          text: 'দয়া করে আপনার বিলিং তথ্য যোগ করুন।',
          confirmButtonText: 'ঠিক আছে'
        });
      }
    } else {
      console.error("Failed to fetch billing details:", response.statusText);
      Swal.fire({
        icon: 'error', // Icon to indicate an error
        title: 'বিলিং তথ্য আনতে ত্রুটি হয়েছে।',
        text: 'দয়া করে আবার চেষ্টা করুন।',
        confirmButtonText: 'ঠিক আছে'
      });
    }
  } catch (error) {
    console.error("Error occurred while fetching billing details:", error);
    Swal.fire({
      icon: 'error', // Icon to indicate an error
      title: 'একটি ত্রুটি ঘটেছে।',
      text: 'দয়া করে আবার চেষ্টা করুন।',
      confirmButtonText: 'ঠিক আছে'
    });
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
        Swal.fire({
          icon: 'error', // Icon to indicate an error
          title: 'বিলিং তথ্য যাচাই করতে ত্রুটি হয়েছে।',
          text: 'দয়া করে আবার চেষ্টা করুন।',
          confirmButtonText: 'ঠিক আছে'
        });
      }
    } catch (error) {
      console.error("Error occurred while saving billing details:", error);
      Swal.fire({
        icon: 'error', // Icon to indicate an error
        title: 'একটি ত্রুটি ঘটেছে।',
        text: 'দয়া করে আবার চেষ্টা করুন।',
        confirmButtonText: 'ঠিক আছে'
      });
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
      Swal.fire({
        icon: 'success', // Icon to indicate success
        title: 'বিলিং তথ্য সফলভাবে সেভ করা হয়েছে!',
        confirmButtonText: 'ঠিক আছে'
      });
      fetchBillingDetails(); // Refresh form
    } else {
      console.error("Failed to create billing info:", response.statusText);
      Swal.fire({
        icon: 'error', // Icon to indicate an error
        title: 'বিলিং তথ্য সেভ করতে ত্রুটি হয়েছে।',
        text: 'দয়া করে আবার চেষ্টা করুন।',
        confirmButtonText: 'ঠিক আছে'
      });
    }
  } catch (error) {
    console.error("Error occurred while creating billing info:", error);
    Swal.fire({
      icon: 'error', // Icon to indicate an error
      title: 'একটি ত্রুটি ঘটেছে।',
      text: 'দয়া করে আবার চেষ্টা করুন।',
      confirmButtonText: 'ঠিক আছে'
    });
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
      Swal.fire({
        icon: 'success', // Icon to indicate success
        title: 'বিলিং তথ্য সফলভাবে আপডেট করা হয়েছে!',
        confirmButtonText: 'ঠিক আছে'
      });
      fetchBillingDetails(); // Refresh form
    } else {
      console.error("Failed to update billing info:", response.statusText);
      Swal.fire({
        icon: 'error', // Icon to indicate an error
        title: 'বিলিং তথ্য আপডেট করতে ত্রুটি হয়েছে।',
        text: 'দয়া করে আবার চেষ্টা করুন।',
        confirmButtonText: 'ঠিক আছে'
      });
    }
  } catch (error) {
    console.error("Error occurred while updating billing info:", error);
    Swal.fire({
      icon: 'error', // Icon to indicate an error
      title: 'একটি ত্রুটি ঘটেছে।',
      text: 'দয়া করে আবার চেষ্টা করুন।',
      confirmButtonText: 'ঠিক আছে'
    });
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
        Swal.fire({
          icon: 'warning', // Icon to indicate a warning
          title: 'কোনো পেমেন্ট রেকর্ড পাওয়া যায়নি।',
          confirmButtonText: 'ঠিক আছে'
        });
      }
    } else {
      console.error("Failed to fetch payments:", response.statusText);
      Swal.fire({
        icon: 'error', // Icon to indicate an error
        title: 'পেমেন্ট তথ্য আনতে ত্রুটি হয়েছে।',
        text: 'দয়া করে আবার চেষ্টা করুন।',
        confirmButtonText: 'ঠিক আছে'
      });
    }
  } catch (error) {
    console.error("Error occurred while fetching payments:", error);
    Swal.fire({
      icon: 'error', // Icon to indicate an error
      title: 'একটি ত্রুটি ঘটেছে।',
      text: 'দয়া করে আবার চেষ্টা করুন।',
      confirmButtonText: 'ঠিক আছে'
    });
  }
}

// Populate payments table
function populatePaymentsTable(payments) {
  const paymentsTableBody = document.querySelector("#paymentsTable tbody");
  paymentsTableBody.innerHTML = "";

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
