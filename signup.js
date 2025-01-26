function showAdditionalFields() {
  const checkboxes = document.querySelectorAll('input[name="roles"]:checked');
  const additionalFields = document.getElementById("additional-fields");
  let fieldsHTML = "";

  checkboxes.forEach((checkbox) => {
    const role = checkbox.value;
    fieldsHTML += `<div class="role-fields" data-role="${role}">
            <h4>${role.charAt(0).toUpperCase() + role.slice(1)} Details:</h4>`;

    switch (role) {
      case "farmer":
        fieldsHTML += `
          <div class="role-specific-fields">
              <input type="number" name="field_size" placeholder="জমির মাপ (বিঘা অনুযায়ী)" required>
              <input type="hidden" name="average_rating" value="0">
          </div>`;
        break;
      case "storage_owner":
        fieldsHTML += `
          <div class="role-specific-fields">
              <input type="number" name="storage_capacity" placeholder="গুদাম ঘরের ধারণক্ষমতা (টন এ)" required>
          </div>`;
        break;
      case "equipment_renter":
        break;
      case "agronomist":
        fieldsHTML += `
          <div class="role-specific-fields">
              <select name="specialty" required>
                  <option value="">বিশেষত্ব নির্বাচন করুন</option>
                  <option value="crop_management">ফসল ব্যবস্থাপনা</option>
                  <option value="soil_science">মাটি বিজ্ঞান</option>
                  <option value="pest_control">পোকামাকড় নিয়ন্ত্রণ</option>
                  <option value="other">অন্যান্য</option>
              </select>
              <input type="number" name="years_of_experience" placeholder="অভিজ্ঞতার বছর" required min="0">
          </div>`;
        break;
      
    }
    fieldsHTML += "</div>";
  });

  additionalFields.innerHTML = fieldsHTML;
}

async function handleFormSubmit(event) {
  event.preventDefault();

  const selectedRoles = document.querySelectorAll(
    'input[name="roles"]:checked'
  );
  if (selectedRoles.length === 0) {
    Swal.fire({
      icon: "error",
      title: "একাউন্টের ধরন প্রয়োজন",
      text: "অনুগ্রহ করে কমপক্ষে একটি একাউন্টের ধরন নির্বাচন করুন",
    });
    return;
  }

  // Validate passwords
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirm-password").value;
  if (password !== confirmPassword) {
    Swal.fire({
      icon: "error",
      title: "পাসওয়ার্ড মিলছে না",
      text: "পাসওয়ার্ডগুলি মিলছে না",
    });
    return;
  }

  // Create FormData for user creation
  const formData = new FormData();
  formData.append("username", document.getElementById("username").value);
  formData.append("email", document.getElementById("email").value);
  formData.append("password", password);
  formData.append(
    "name",
    `${document.getElementById("first-name").value} ${
      document.getElementById("last-name").value
    }`
  );

  const profilePicture = document.getElementById("profilePicture").files[0];
  if (profilePicture) {
    formData.append("profile_picture", profilePicture);
  }

  // Add role flags
  selectedRoles.forEach((role) => {
    formData.append(`is_${role.value}`, "true");
  });

  try {
    // Create user account
    const userResponse = await fetch("http://localhost:8000/users/user-info/", {
      method: "POST",
      body: formData,
    });

    if (!userResponse.ok) {
      throw new Error("Failed to create user account");
    }

    const userData = await userResponse.json();
    const userId = userData.id;

    // Create role-specific accounts
    const rolePromises = Array.from(selectedRoles).map(async (roleCheckbox) => {
      const role = roleCheckbox.value;
      const rolePayload = createRolePayload(role, userId);
      const roleUrl = getRoleUrl(role);

      const response = await fetch(roleUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(rolePayload),
      });

      if (!response.ok) {
        throw new Error(`Failed to create ${role} account`);
      }
      return response.json();
    });

    await Promise.all(rolePromises);

    Swal.fire({
      icon: "success",
      title: "সফল!",
      text: "অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে!",
      timer: 2000,
      showConfirmButton: false,
    }).then(() => {
      window.location.href = "login.html";
    });    
  } catch (error) {
    console.error("Error:", error);
    Swal.fire({
      icon: "error",
      title: "ভুল হয়েছে!",
      text: error.message,
    });
    
  }
}

function createRolePayload(role, userId) {
  const basePayload = {
    user: userId,
    name: `${document.getElementById("first-name").value} ${
      document.getElementById("last-name").value
    }`,
    dob: document.getElementById("dob").value,
    address: document.getElementById("address").value,
    contact: document.getElementById("contact").value,
  };

  switch (role) {
    case "farmer":
      return {
        ...basePayload,
        field_size: parseFloat(
          document.querySelector('[name="field_size"]').value
        ),
      };
    case "storage_owner":
      return {
        ...basePayload,
        storage_capacity: parseFloat(
          document.querySelector('[name="storage_capacity"]').value
        ),
      };
    case "equipment_renter":
      return {
        ...basePayload,
        no_of_deals: 0,
      };
    case "agronomist":
      return {
        ...basePayload,
        specialty: document.querySelector('[name="specialty"]').value,
        years_of_experience: parseInt(
          document.querySelector('[name="years_of_experience"]').value
        ),
      };
  }
}

function getRoleUrl(role) {
  const urlMap = {
    farmer: "http://localhost:8000/farmers/farmers/",
    storage_owner: "http://localhost:8000/storage/storage-owners/",
    equipment_renter: "http://localhost:8000/rentals/rent-owners/",
    agronomist: "http://localhost:8000/consultations/agronomists/",
  };
  return urlMap[role];
}

document
  .getElementById("signupForm")
  .addEventListener("submit", handleFormSubmit);
