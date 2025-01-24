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

//-----------------------------
// Select the login form
//-----------------------------
const loginForm = document.querySelector("form");

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  // Gather username and password values from the form
  const username = loginForm.elements["username"].value;
  const password = loginForm.elements["password"].value;

  const payload = {
    username: username,
    password: password,
  };

  try {
    const response = await fetch("http://127.0.0.1:8000/users/login/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    console.log("Response status:", response.status);

    if (response.ok) {
      const data = await response.json();

      Swal.fire({
        icon: "success",
        title: "লগ ইন সফল!",
        text: "স্বাগতম, " + username + "!",
        showConfirmButton: true,
      });      

      console.log("Response:", data);

      // --------------------------------------------
      // Save the main user ID and session ID in cookies
      // --------------------------------------------
      setCookie("userId", data.id, 7);

      if (data.session_id) {
        setCookie("sessionId", data.session_id, 7);
        console.log("Session ID set in cookie:", data.session_id);
      }

      // ------------------------------
      // Fetch additional details
      // ------------------------------
      const detailsToFetch = [];
      if (data.is_farmer) {
        detailsToFetch.push(fetchDetails("farmers/farmers", data.id));
      }
      if (data.is_rent_owner) {
        detailsToFetch.push(fetchDetails("rentals/rent-owners", data.id));
      }
      if (data.is_storage_owner) {
        detailsToFetch.push(fetchDetails("storage/storage-owners", data.id));
      }
      if (data.is_agronomist) {
        detailsToFetch.push(fetchDetails("consultations/agronomists", data.id));
      }

      const results = await Promise.all(detailsToFetch);

      results.forEach((result) => {
        if (result) {
          // e.g., 'farmersId', 'rent-ownersId', 'storage-ownersId', 'agronomistsId'
          setCookie(`${result.type}Id`, result.id, 7);
        }
      });

      console.log("Additional details saved in cookies.");

      // ------------------------------
      // Decide redirect logic based on role_count
      // ------------------------------
      setTimeout(() => {
        if (data.role_count > 1) {
          // If user has multiple roles, go to a popup page to choose
          window.location.href = "popup.html";
        } else if (data.role_count === 1) {
          // Exactly one role -> find which one is true and redirect
          if (data.is_farmer) {
            window.location.href = "farmerLandingPage.html";
          } else if (data.is_rent_owner) {
            window.location.href = "rentalAdmin.html";
          } else if (data.is_storage_owner) {
            window.location.href = "storageAdmin.html";
          } else if (data.is_agronomist) {
            window.location.href = "expertAdmin.html";
          } else {
            // If something is off, fallback
            window.location.href = "contact.html";
          }
        } else {
          // role_count === 0 or not recognized
          // e.g., no roles -> fallback or contact page
          window.location.href = "contact.html";
        }
      }, 1500); // Delay to let the alert display
    } else {
      const errorData = await response.json();

      // Display error alert with SweetAlert2
      Swal.fire({
        icon: "error",
        title: "লগ ইন ব্যর্থ!",
        text: errorData.detail || "কোনো তথ্য ভুল হয়েছে। দয়া করে আবার চেষ্টা করুন।",
        showConfirmButton: true,
      });
      
      console.error("Error:", errorData);
    }
  } catch (error) {
    console.error("An error occurred:", error);

    // Display general error alert with SweetAlert2
    Swal.fire({
      icon: "error",
      title: "ভুল হয়েছে!",
      text: "লগ ইন করতে একটু ভুল হয়েছে। দয়া করে আবার চেষ্টা করুন।",
      showConfirmButton: true,
    });
    
  }
});

/**
 * Helper to fetch details for a specific role endpoint
 */
async function fetchDetails(endpoint, userId) {
  const apiUrl = `http://127.0.0.1:8000/${endpoint}/?user=${userId}`;
  try {
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const data = await response.json();
      console.log(`Fetched ${endpoint} details:`, data);

      // Ensure the response has results and extract the first result's ID
      if (data.results && data.results.length > 0) {
        return { type: endpoint.split("/")[1], id: data.results[0].id };
      } else {
        console.warn(`No results found in ${endpoint} for user ${userId}`);
      }
    } else {
      console.error(
        `Failed to fetch ${endpoint} details:`,
        response.statusText
      );
    }
  } catch (error) {
    console.error(
      `An error occurred while fetching ${endpoint} details:`,
      error
    );
  }
  return null;
}
