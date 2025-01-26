// utils.js
// Format date function
function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString("bn-BD", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// Calculate rental period
function calculateRentalPeriod(orderDate, returnDate) {
  const start = new Date(orderDate);
  const end = new Date(returnDate);
  return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
}

// Utility function for showing alerts
function showAlert(type, title, message, options = {}) {
  if (typeof Swal !== "undefined") {
    return Swal.fire({
      icon: type,
      title: title,
      text: message,
      ...options,
    });
  } else {
    alert(message);
    return Promise.resolve({ isConfirmed: confirm("Please confirm") });
  }
}

// Cookie helper function
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
