const API_ENDPOINTS = {
  "rent-ownersId": "http://localhost:8000/rentals/rent-item-orders/",
  agronomistsId: "http://localhost:8000/consultations/consultation-requests/",
  "storage-ownersId": "http://localhost:8000/storage/storage-deals/",
};

const QUERY_PARAMS = {
  "rent-ownersId": "rent_owner",
  agronomistsId: "agronomist",
  "storage-ownersId": "storage_owner",
};

// Enhanced cookie getter with validation
function getCookie(name) {
  const nameEQ = name + "=";
  const ca = document.cookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i].trim();
    if (c.indexOf(nameEQ) === 0) {
      const value = decodeURIComponent(c.substring(nameEQ.length, c.length));
      return value !== "undefined" && value !== "null" ? value : null;
    }
  }
  return null;
}

// Fetch admin orders based on selected role
async function fetchAdminOrders() {
  try {
    const selectedRole = getCookie("selectedRole");
    console.log("Selected role:", selectedRole);

    // Validate selected role
    if (!selectedRole || !API_ENDPOINTS[selectedRole]) {
      throw new Error("Invalid role selected");
    }

    const roleId = getCookie(selectedRole);
    if (!roleId) {
      throw new Error("Role ID not found");
    }

    // Construct API URL using the correct query parameter
    const queryParam = QUERY_PARAMS[selectedRole];
    const apiUrl = `${API_ENDPOINTS[selectedRole]}?${queryParam}=${roleId}`;
    console.log(`Fetching data from: ${apiUrl}`);

    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Display data based on role
    switch (selectedRole) {
      case "rent-ownersId":
        displayRentOrders(data.results);
        break;
      case "agronomistsId":
        displayConsultationRequests(data.results);
        break;
      case "storage-ownersId":
        displayStorageDeals(data.results);
        break;
      default:
        throw new Error("Unhandled role type");
    }
  } catch (error) {
    console.error("Error in fetchAdminOrders:", error);
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Failed to fetch orders. Please try again later.",
    });
  }
}

function displayRentOrders(orders) {
  const activeOrders = document.getElementById("activeOrders");
  activeOrders.innerHTML = "";

  if (!orders || orders.length === 0) {
    activeOrders.innerHTML = "<p>No rental orders found.</p>";
    return;
  }

  orders.forEach((order) => {
    const orderCard = document.createElement("div");
    orderCard.className = "order-item";

    orderCard.innerHTML = `
            <h3>${escapeHtml(order.title)}</h3>
            <p>${escapeHtml(order.description)}</p>
            <p>Price: ৳${order.price}</p>
            <p>Order Date: ${formatDate(order.order_date)}</p>
            <p>Return Date: ${formatDate(order.return_date)}</p>
            <p>Status: ${
              order.is_confirmed
                ? '<span class="badge bg-success">Confirmed</span>'
                : '<span class="badge bg-warning">Pending</span>'
            }
            </p>
            <p>Ready for Pickup: ${
              order.is_ready_for_pickup
                ? '<span class="badge bg-success">Yes</span>'
                : '<span class="badge bg-warning">No</span>'
            }
            </p>
            ${
              !order.is_confirmed
                ? `<button class="btn btn-primary" onclick="updateOrder(${order.id}, 'confirm')">Confirm</button>`
                : ""
            }
            ${
              order.is_confirmed && !order.is_ready_for_pickup
                ? `<button class="btn btn-success" onclick="updateOrder(${order.id}, 'pickup')">Mark as Ready</button>`
                : ""
            }
        `;

    activeOrders.appendChild(orderCard);
  });
}

function displayConsultationRequests(requests) {
  const activeOrders = document.getElementById("activeOrders");
  activeOrders.innerHTML = "";

  if (!requests || requests.length === 0) {
    activeOrders.innerHTML = "<p>No consultation requests found.</p>";
    return;
  }

  requests.forEach((request) => {
    const requestCard = document.createElement("div");
    requestCard.className = "order-item";

    requestCard.innerHTML = `
            <h3>Consultation Request #${request.id}</h3>
            <p>Status: ${getStatusBadge(request.status)}</p>
            <p>Details: ${escapeHtml(request.details)}</p>
            <p>Fee: ৳${request.fee}</p>
            <p>Resolution: ${
              request.resolution ? escapeHtml(request.resolution) : "Pending"
            }</p>
            ${
              request.meet_link
                ? `<a href="${escapeHtml(
                    request.meet_link
                  )}" target="_blank" class="btn btn-primary">Join Meeting</a>`
                : ""
            }
        `;

    activeOrders.appendChild(requestCard);
  });
}

function displayStorageDeals(deals) {
  const activeOrders = document.getElementById("activeOrders");
  activeOrders.innerHTML = "";

  if (!deals || deals.length === 0) {
    activeOrders.innerHTML = "<p>No storage deals found.</p>";
    return;
  }

  deals.forEach((deal) => {
    const dealCard = document.createElement("div");
    dealCard.className = "order-item";

    dealCard.innerHTML = `
            <h3>Storage Deal</h3>
            <p>Gigs Offered: ${deal.gigs_offered}</p>
            <p>Crops: ${deal.crops}</p>
            <p>Start Date: ${formatDate(deal.start_date)}</p>
            <p>End Date: ${formatDate(deal.end_date)}</p>
            <p>Status: ${
              deal.is_confirmed
                ? '<span class="badge bg-success">Confirmed</span>'
                : '<span class="badge bg-warning">Pending</span>'
            }
            </p>
            ${
              !deal.is_confirmed
                ? `<button class="btn btn-primary" onclick="updateStorageDeal(${deal.id}, 'confirm')">Confirm</button>`
                : ""
            }
            ${
              !deal.completed
                ? `<button class="btn btn-success" onclick="updateStorageDeal(${deal.id}, 'complete')">Mark as Complete</button>`
                : ""
            }
        `;

    activeOrders.appendChild(dealCard);
  });
}

// Utility functions
function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString();
}

function getStatusBadge(status) {
  const statusColors = {
    Pending: "warning",
    Accepted: "success",
    Rejected: "danger",
    Completed: "info",
  };
  const color = statusColors[status] || "secondary";
  return `<span class="badge bg-${color}">${status}</span>`;
}

// Update functions
async function updateOrder(orderId, action) {
  try {
    const selectedRole = getCookie("selectedRole");
    if (!selectedRole || !API_ENDPOINTS[selectedRole]) {
      throw new Error("Invalid role");
    }

    const apiUrl = `${API_ENDPOINTS[selectedRole]}${orderId}/`;
    const body =
      action === "confirm"
        ? { is_confirmed: true }
        : { is_ready_for_pickup: true };

    const response = await fetch(apiUrl, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    await fetchAdminOrders();
    Swal.fire({
      icon: "success",
      title: "Success",
      text: "Order updated successfully!",
    });
  } catch (error) {
    console.error("Error updating order:", error);
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Failed to update the order.",
    });
  }
}

// Initialize on page load
document.addEventListener("DOMContentLoaded", fetchAdminOrders);
