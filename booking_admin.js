const API_ENDPOINTS = {
  rent_owner: "http://localhost:8000/rentals/rent-item-orders/",
  agronomist: "http://localhost:8000/consultations/consultation-requests/",
  storage_owner: "http://localhost:8000/storage/storage-deals/",
};

// Get user role from cookies
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
  return null;
}

async function fetchAdminOrders() {
  const selectedRole = getCookie("selectedRole");
  console.log(selectedRole);
  const userId = getCookie("userId");
  const apiUrl = `${API_ENDPOINTS[selectedRole]}?${
    selectedRole === "rent_owner" ? "rent_owner" : "farmer"
  }=${userId}`;

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error("Failed to fetch orders");
    const data = await response.json();

    if (selectedRole === "rent_owner") {
      displayRentOrders(data.results);
    } else if (selectedRole === "agronomist") {
      displayConsultationRequests(data.results);
    } else if (selectedRole === "storage_owner") {
      displayStorageDeals(data.results);
    }
  } catch (error) {
    console.error("Error fetching orders:", error);
    alert("Failed to fetch orders. Please try again later.");
  }
}

// Display rent orders
function displayRentOrders(orders) {
  const activeOrders = document.getElementById("activeOrders");
  activeOrders.innerHTML = "";

  orders.forEach((order) => {
    const orderCard = document.createElement("div");
    orderCard.className = "order-item";

    orderCard.innerHTML = `
      <h3>${order.title}</h3>
      <p>${order.description}</p>
      <p>Price: $${order.price}</p>
      <p>Order Date: ${order.order_date}</p>
      <p>Return Date: ${order.return_date}</p>
      <p>Status: ${order.is_confirmed ? "Confirmed" : "Pending"}</p>
      <p>Ready for Pickup: ${order.is_ready_for_pickup ? "Yes" : "No"}</p>
      <button onclick="updateOrder(${order.id}, 'confirm')">Confirm</button>
      <button onclick="updateOrder(${
        order.id
      }, 'pickup')">Mark as Ready</button>
    `;

    activeOrders.appendChild(orderCard);
  });
}

// Display consultation requests
function displayConsultationRequests(requests) {
  const activeOrders = document.getElementById("activeOrders");
  activeOrders.innerHTML = "";

  requests.forEach((request) => {
    const requestCard = document.createElement("div");
    requestCard.className = "order-item";

    requestCard.innerHTML = `
      <h3>Consultation Request #${request.id}</h3>
      <p>Status: ${request.status}</p>
      <p>Details: ${request.details}</p>
      <p>Fee: $${request.fee}</p>
      <p>Resolution: ${request.resolution || "Pending"}</p>
      ${
        request.meet_link
          ? `<a href="${request.meet_link}" target="_blank" class="meet-link">Join Meeting</a>`
          : ""
      }
    `;

    activeOrders.appendChild(requestCard);
  });
}

// Display storage deals
function displayStorageDeals(deals) {
  const activeOrders = document.getElementById("activeOrders");
  activeOrders.innerHTML = "";

  deals.forEach((deal) => {
    const dealCard = document.createElement("div");
    dealCard.className = "order-item";

    dealCard.innerHTML = `
      <h3>Storage Deal</h3>
      <p>Gigs Offered: ${deal.gigs_offered}</p>
      <p>Crops Stored: ${deal.crops}</p>
      <p>Start Date: ${deal.start_date}</p>
      <p>End Date: ${deal.end_date}</p>
      <p>Status: ${deal.is_confirmed ? "Confirmed" : "Pending"}</p>
      <button onclick="updateStorageDeal(${
        deal.id
      }, 'confirm')">Confirm</button>
      <button onclick="updateStorageDeal(${
        deal.id
      }, 'complete')">Mark as Complete</button>
    `;

    activeOrders.appendChild(dealCard);
  });
}

// Update orders or deals
async function updateOrder(orderId, action) {
  const apiUrl = `${API_ENDPOINTS.rent_owner}${orderId}/`;

  const body =
    action === "confirm"
      ? { is_confirmed: true }
      : { is_ready_for_pickup: true };

  try {
    const response = await fetch(apiUrl, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (response.ok) {
      alert("Order updated successfully!");
      fetchAdminOrders();
    } else {
      alert("Failed to update the order.");
    }
  } catch (error) {
    console.error("Error updating order:", error);
  }
}

// Fetch data on page load
document.addEventListener("DOMContentLoaded", fetchAdminOrders);
