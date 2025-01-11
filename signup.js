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
      fieldsHTML = "";
  }

  additionalFields.innerHTML = fieldsHTML;
}

// Function to handle form submission
async function handleFormSubmit(event) {
  event.preventDefault(); // Prevent default form submission

  const role = document.getElementById("role").value;
  const username = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  // General user payload
  const userPayload = {
    username,
    email,
    password,
    is_farmer: role === "farmer",
    is_storage_owner: role === "storage_owner",
    is_rent_owner: role === "equipment_renter",
  };

  try {
    // Send data to general user endpoint
    const userResponse = await fetch("http://localhost:8000/users/user-info/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userPayload),
    });

    if (!userResponse.ok) {
      const errorText = await userResponse.text();
      console.error("User Error Response:", errorText);
      throw new Error("Failed to save user information");
    }

    const userData = await userResponse.json();
    console.log("User Created Successfully:", userData);

    // Ensure user ID is correctly extracted as an integer
    const userId = userData.id;

    // Role-specific payloads
    let rolePayload;
    let roleUrl;

    if (role === "farmer") {
      rolePayload = {
        user: userId, // Send as integer
        name: username,
        dob: document.getElementById("dob").value,
        address: document.getElementById("address").value,
        field_size: parseFloat(document.getElementById("field_size").value),
        average_rating: 4.5,
      };
      roleUrl = "http://localhost:8000/farmers/farmers/";
    } else if (role === "storage_owner") {
      rolePayload = {
        user: userId, // Send as integer
        name: username,
        dob: document.getElementById("dob").value,
        contact: document.getElementById("contact").value,
        address: document.getElementById("address").value,
      };
      roleUrl = "http://localhost:8000/storage/storage-owners/";
    } else if (role === "equipment_renter") {
      rolePayload = {
        user: userId, // Send as integer
        name: username,
        dob: document.getElementById("dob").value,
        contact: document.getElementById("contact").value,
        address: document.getElementById("address").value,
        no_of_deals: 0,
      };
      roleUrl = "http://localhost:8000/rentals/rent-owners/";
    } else if (role === "agronomist") {
      rolePayload = {
        user: userId, // Send as integer
        name: username,
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
    } else {
      throw new Error("Invalid role selected or role not supported.");
    }

    console.log("Role Payload:", rolePayload); // Debug the payload

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
      alert(`Failed to save ${role} information: ${errorText}`);
      return;
    }

    console.log(`${role} account created successfully.`);

    // Redirect after successful signup
    alert("Signup successful! Redirecting to contact page...");
    window.location.href = "contact.html";
  } catch (error) {
    console.error("Error:", error);
    alert("An error occurred while saving information.");
  }
}

// Attach the submit event listener
document
  .getElementById("signupForm")
  .addEventListener("submit", handleFormSubmit);
