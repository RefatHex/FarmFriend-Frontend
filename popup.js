function setCookie(name, value, days) {
  let expires = "";
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

function getCookie(name) {
  const nameEQ = name + "=";
  const ca = document.cookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i].trim();
    if (c.indexOf(nameEQ) === 0) {
      return c.substring(nameEQ.length, c.length);
    }
  }
  return null;
}

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

window.addEventListener("DOMContentLoaded", () => {
  // Collect all possible roles
  const roles = [
    "farmersId",
    "rent-ownersId",
    "storage-ownersId",
    "agronomistsId",
  ];
  const foundRoles = [];

  // Check each role cookie
  roles.forEach((role) => {
    const cookieValue = getCookie(role);
    if (cookieValue) {
      foundRoles.push(role);
    }
  });

  console.log("User has roles:", foundRoles);

  // If no roles, redirect (or handle as needed)
  if (foundRoles.length === 0) {
    console.log("No roles found. Redirecting to homepage...");
    window.location.href = "index.html";
    return;
  }

  // If exactly one role, redirect automatically
  if (foundRoles.length === 1) {
    const singleRole = foundRoles[0];
    // Save that role in a cookie (for reference)
    setCookie("selectedRole", singleRole, 7);
    console.log("Single role found:", singleRole);
    window.location.href = roleRedirects[singleRole];
    return;
  }

  if (foundRoles.length > 1) {
    accountList.innerHTML = ""; // Clear existing
    foundRoles.forEach((role) => {
      // Create a list item with a button
      const li = document.createElement("li");
      const btn = document.createElement("button");
      btn.classList.add("btn", "btn-primary");
      btn.textContent = "Go to " + role;
      // (You might want more user-friendly text, e.g. "Go to Farmer Dashboard")

      // On click: store chosen role, then redirect
      btn.addEventListener("click", () => {
        setCookie("selectedRole", role, 7);
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
  // Optionally redirect if they close
  // window.location.href = "index.html";
});
