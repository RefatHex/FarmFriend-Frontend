// Select the login form
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

      // Display success alert with SweetAlert2
      Swal.fire({
        icon: "success",
        title: "Login Successful!",
        text: "Welcome back, " + username + "!",
        showConfirmButton: true,
      });

      console.log("Response:", data);

      // Save the main user ID in localStorage
      localStorage.setItem("userId", data.id);

      // Check and fetch additional details if applicable
      const detailsToFetch = [];

      if (data.is_farmer)
        detailsToFetch.push(fetchDetails("farmers/farmers", data.id));
      if (data.is_rent_owner)
        detailsToFetch.push(fetchDetails("rentals/rent-owners", data.id));
      if (data.is_storage_owner)
        detailsToFetch.push(fetchDetails("storage/storage-owners", data.id));
      if (data.is_agronomist)
        detailsToFetch.push(fetchDetails("consultations/agronomists", data.id));

      const results = await Promise.all(detailsToFetch);

      // Save the respective IDs in localStorage
      results.forEach((result) => {
        if (result) {
          localStorage.setItem(`${result.type}Id`, result.id);
        }
      });

      console.log("Additional details saved in localStorage.");
      
      // Redirect to another page
      setTimeout(() => {
        window.location.href = "contact.html";
      }, 1500); // Delay to let the alert display

    } else {
      const errorData = await response.json();

      // Display error alert with SweetAlert2
      Swal.fire({
        icon: "error",
        title: "Login Failed!",
        text: errorData.detail || "Invalid credentials. Please try again.",
        showConfirmButton: true,
      });

      console.error("Error:", errorData);
    }
  } catch (error) {
    console.error("An error occurred:", error);

    // Display general error alert with SweetAlert2
    Swal.fire({
      icon: "error",
      title: "Error!",
      text: "An error occurred while logging in. Please try again.",
      showConfirmButton: true,
    });
  }
});

// Function to fetch details based on user type
async function fetchDetails(endpoint, userId) {
  const apiUrl = `http://127.0.0.1:8000/${endpoint}/${userId}/`;
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
      return { type: endpoint.split("/")[1], id: data.id }; // Save type and ID
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

  return null; // Return null if fetch fails
}
