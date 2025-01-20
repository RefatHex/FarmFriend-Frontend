const loginForm = document.querySelector("form");

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  // Gather username and password values from the form
  const username = loginForm.elements["username"].value;
  const password = loginForm.elements["password"].value;
  // Debugging
  console.log("Username:", username);
  console.log("Password:", password);

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
      alert("Login successful!");
      console.log("Response:", data);
      window.location.href = "contact.html";
    } else {
      const errorData = await response.json();
      alert("Login failed: " + errorData.detail);
      console.error("Error:", errorData);
    }
  } catch (error) {
    console.error("An error occurred:", error);
    alert("An error occurred while logging in. Please try again.");
  }
});
