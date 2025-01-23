// Dynamically show additional fields based on the role
function showAdditionalFields() {
  const role = document.getElementById("role").value;
  const additionalFields = document.getElementById("additional-fields");
  let fieldsHTML = "";

  switch (role) {
    case "farmer":
      fieldsHTML = `
        <input type="date" name="dob" id="dob" placeholder="Date of Birth" required>
        <textarea name="address" id="address" placeholder="Address" required></textarea>
        <input type="number" name="field_size" id="field_size" placeholder="Field Size (in hectares)" required>
        <input type="hidden" name="average_rating" id="average_rating" value="4.5">
      `;
      break;
    case "storage_owner":
      fieldsHTML = `
        <input type="date" name="dob" id="dob" placeholder="Date of Birth" required>
        <textarea name="address" id="address" placeholder="Location Address" required></textarea>
        <input type="tel" name="contact" id="contact" placeholder="Contact Number" required>
      `;
      break;
    case "equipment_renter":
      fieldsHTML = `
        <input type="date" name="dob" id="dob" placeholder="Date of Birth" required>
        <textarea name="address" id="address" placeholder="Address" required></textarea>
        <input type="tel" name="contact" id="contact" placeholder="Contact Number" required>
        <input type="hidden" name="no_of_deals" id="no_of_deals" value="0">
      `;
      break;
    case "agronomist":
      fieldsHTML = `
        <input type="date" name="dob" id="dob" placeholder="Date of Birth" required>
        <textarea name="address" id="address" placeholder="Address" required></textarea>
        <input type="tel" name="contact" id="contact" placeholder="Contact Number" required>
        <input type="text" name="specialty" id="specialty" placeholder="Specialty" required>
        <input type="number" name="years_of_experience" id="years_of_experience" placeholder="Years of Experience" required min="0">
        <label>
          <input type="checkbox" id="availability" name="availability"> Available
        </label>
      `;
      break;
    default:
      fieldsHTML = ""; // Clear additional fields if no role is selected
  }

  additionalFields.innerHTML = fieldsHTML;
}

async function handleFormSubmit(event) {
  event.preventDefault(); // Prevent default form submission

  // Get form values
  const role = document.getElementById("role").value;
  const firstName = document.getElementById("first-name").value;
  const lastName = document.getElementById("last-name").value;
  const username = document.getElementById("username").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirm-password").value;
  const profilePicture = document.getElementById("profilePicture").files[0]; // Get the file object

  // Check if passwords match
  if (password !== confirmPassword) {
    Swal.fire({
      icon: "error",
      title: "Passwords Mismatch",
      text: "Your passwords do not match. Please try again.",
      confirmButtonText: "OK",
    });
    return;
  }

  // Prepare FormData for the userPayload
  const formData = new FormData();
  formData.append("username", username);
  formData.append("email", email);
  formData.append("password", password);
  formData.append("name", `${firstName} ${lastName}`); // Combine first and last name
  if (profilePicture) {
    formData.append("profile_picture", profilePicture); // Attach the file
  }
  formData.append("is_farmer", role === "farmer");
  formData.append("is_storage_owner", role === "storage_owner");
  formData.append("is_rent_owner", role === "equipment_renter");

  try {
    // Send data to general user endpoint
    const userResponse = await fetch("http://localhost:8000/users/user-info/", {
      method: "POST",
      body: formData, // Send FormData instead of JSON
    });

    if (!userResponse.ok) {
      const errorText = await userResponse.text();
      console.error("User Error Response:", errorText);
      throw new Error("Failed to save user information.");
    }

    const userData = await userResponse.json();
    console.log("User Created Successfully:", userData);

    const userId = userData.id;

    // Role-specific payloads
    let rolePayload;
    let roleUrl;

    switch (role) {
      case "farmer":
        rolePayload = {
          user: userId,
          name: `${firstName} ${lastName}`,
          dob: document.getElementById("dob").value,
          address: document.getElementById("address").value,
          field_size: parseFloat(document.getElementById("field_size").value),
          average_rating: 4.5,
        };
        roleUrl = "http://localhost:8000/farmers/farmers/";
        break;
      case "storage_owner":
        rolePayload = {
          user: userId,
          name: `${firstName} ${lastName}`,
          dob: document.getElementById("dob").value,
          contact: document.getElementById("contact").value,
          address: document.getElementById("address").value,
        };
        roleUrl = "http://localhost:8000/storage/storage-owners/";
        break;
      case "equipment_renter":
        rolePayload = {
          user: userId,
          name: `${firstName} ${lastName}`,
          dob: document.getElementById("dob").value,
          contact: document.getElementById("contact").value,
          address: document.getElementById("address").value,
          no_of_deals: 0,
        };
        roleUrl = "http://localhost:8000/rentals/rent-owners/";
        break;
      case "agronomist":
        rolePayload = {
          user: userId,
          name: `${firstName} ${lastName}`,
          dob: document.getElementById("dob").value,
          contact: document.getElementById("contact").value,
          address: document.getElementById("address").value,
          specialty: document.getElementById("specialty").value,
          years_of_experience: parseInt(
            document.getElementById("years_of_experience").value,
            10
          ),
          availability: document.getElementById("availability").checked,
        };
        roleUrl = "http://localhost:8000/consultations/agronomists/";
        break;
      default:
        throw new Error("Invalid role selected.");
    }

    console.log("Role Payload:", rolePayload);

    const roleResponse = await fetch(roleUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(rolePayload),
    });

    if (!roleResponse.ok) {
      const errorText = await roleResponse.text();
      console.error("Role Error Response:", errorText);
      Swal.fire({
        icon: "error",
        title: "Signup Failed",
        text: `Failed to save ${role} information. ${errorText}`,
        confirmButtonText: "Try Again",
      });
      return;
    }

    console.log(`${role} account created successfully.`);

    // Redirect after successful signup
    Swal.fire({
      icon: "success",
      title: "Signup Successful",
      text: "Your account has been created! Redirecting to Login page...",
      timer: 3000,
      showConfirmButton: false,
    }).then(() => {
      window.location.href = "login.html";
    });
  } catch (error) {
    console.error("Error:", error);
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "An error occurred while saving information. Please try again.",
      confirmButtonText: "OK",
    });
  }
}

// Attach the submit event listener
document
  .getElementById("signupForm")
  .addEventListener("submit", handleFormSubmit);
