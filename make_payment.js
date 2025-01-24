// Fetch and display all payments for the user
async function fetchPayments() {
  const userId = getCookie("userId") || 1;

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

// Submit a new payment
async function submitPayment(event) {
  event.preventDefault();

  const userId = getCookie("userId");
  const paymentData = {
    user: userId,
    amount: document.getElementById("amount").value,
    payment_date: document.getElementById("payment_date").value,
    payment_method: document.getElementById("payment_method").value,
    status: "Pending",
  };

  try {
    const response = await fetch("http://localhost:8000/payment/payments/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(paymentData),
    });

    if (response.ok) {
      alert("Payment submitted successfully!");
      document.getElementById("paymentForm").reset();
      fetchPayments(); // Refresh payments table
    } else {
      alert("Error submitting payment. Please try again.");
      console.error("Error submitting payment:", response.statusText);
    }
  } catch (error) {
    alert("An error occurred. Please try again.");
    console.error("Error occurred while submitting payment:", error);
  }
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

// Load payments on page load
document.addEventListener("DOMContentLoaded", fetchPayments);
