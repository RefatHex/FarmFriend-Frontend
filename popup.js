/**
 * We'll read the cookies set after the user logs in.
 * For example:
 * - farmersId
 * - rent-ownersId
 * - storage-ownersId
 * - agronomistsId
 *
 * If only one is found, we redirect to the correct landing page.
 * If multiple, we show a popup so the user can choose.
 */

// DOM elements
const popupOverlay = document.getElementById("popupOverlay");
const accountList = document.getElementById("accountList");
const closePopupBtn = document.getElementById("closePopupBtn");

// Hide the popup
function hidePopup() {
  popupOverlay.style.display = "none";
}

// Show the popup
function showPopup() {
  popupOverlay.style.display = "flex";
}

// Map each role to a target landing page
const roleRedirects = {
  farmersId: "farmerDashboard.html",
  "rent-ownersId": "rentalAdmin.html",
  "storage-ownersId": "storageDashboard.html",
  agronomistsId: "agronomistDashboard.html",
};

// On page load, decide what to do
window.addEventListener("DOMContentLoaded", () => {
  // Collect all possible roles
  const roles = [
    "farmersId",
    "rent-ownersId",
    "storage-ownersId",
    "agronomistsId",
  ];
  const foundRoles = [];

  roles.forEach((role) => {
    const cookieValue = getCookie(role);
    if (cookieValue) {
      // The cookie exists, meaning user has that account type
      foundRoles.push(role);
    }
  });

  console.log("User has roles:", foundRoles);

  // If the user has NO roles, possibly redirect or show an error
  if (foundRoles.length === 0) {
    // For example, we can just redirect to a default page
    console.log("No roles found. Redirecting to homepage...");
    window.location.href = "index.html";
    return;
  }

  // If exactly one role, redirect automatically
  if (foundRoles.length === 1) {
    const singleRole = foundRoles[0];
    console.log("Single role found:", singleRole);
    window.location.href = roleRedirects[singleRole];
    return;
  }

  // If multiple roles, show popup to select
  if (foundRoles.length > 1) {
    // Populate the list
    accountList.innerHTML = ""; // Clear first
    foundRoles.forEach((role) => {
      // Create a list item with a button
      const li = document.createElement("li");
      const btn = document.createElement("button");
      btn.classList.add("btn", "btn-primary");
      btn.textContent = "Go to " + role;
      // Real-world: text could be more user-friendly (e.g. "Go to Farmer Dashboard")

      btn.addEventListener("click", () => {
        window.location.href = roleRedirects[role];
      });

      li.appendChild(btn);
      accountList.appendChild(li);
    });

    showPopup();
  }
});

// When user clicks "Close"
closePopupBtn.addEventListener("click", () => {
  hidePopup();
  // You could optionally redirect somewhere if they close
  // window.location.href = "index.html";
});
