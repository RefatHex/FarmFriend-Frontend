function setCookie(name, value, days) {
  let expires = "";
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = `${name}=${encodeURIComponent(
    value || ""
  )}${expires}; path=/`;
}

function getCookie(name) {
  const nameEQ = name + "=";
  const cookies = document.cookie.split(";");
  for (let i = 0; i < cookies.length; i++) {
    let cookie = cookies[i].trim();
    if (cookie.indexOf(nameEQ) === 0) {
      return decodeURIComponent(cookie.substring(nameEQ.length, cookie.length));
    }
  }
  return null;
}

function hidePopup() {
  document.getElementById("popupOverlay").style.display = "none";
}

function showPopup() {
  document.getElementById("popupOverlay").style.display = "flex";
}

const roleRedirects = {
  farmersId: "farmerLandingPage.html",
  "rent-ownersId": "rentalAdmin.html",
  "storage-ownersId": "storageDashboard.html",
  agronomistsId: "agronomistDashboard.html",
};

document.addEventListener("DOMContentLoaded", () => {
  const roles = [
    "farmersId",
    "rent-ownersId",
    "storage-ownersId",
    "agronomistsId",
  ];
  const foundRoles = [];

  roles.forEach((role) => {
    const roleValue = getCookie(role);
    if (roleValue) {
      foundRoles.push(role);
    }
  });

  if (foundRoles.length === 0) {
    window.location.href = "index.html";
    return;
  }

  if (foundRoles.length === 1) {
    setCookie("selectedRole", foundRoles[0], 7);
    window.location.href = roleRedirects[foundRoles[0]];
    return;
  }

  const accountList = document.getElementById("accountList");
  accountList.innerHTML = "";
  foundRoles.forEach((role) => {
    const li = document.createElement("li");
    const btn = document.createElement("button");
    btn.classList.add("btn", "btn-primary", "mb-2");
    btn.textContent = `Go to ${roleRedirects[role]}`;
    btn.addEventListener("click", () => {
      setCookie("selectedRole", role, 7);
      window.location.href = roleRedirects[role];
    });
    li.appendChild(btn);
    accountList.appendChild(li);
  });

  showPopup();

  document.getElementById("closePopupBtn").addEventListener("click", hidePopup);
});
