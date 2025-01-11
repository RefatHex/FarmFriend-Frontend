// Dynamically show additional fields based on the role
function showAdditionalFields() {
  const role = document.getElementById("role").value;
  const additionalFields = document.getElementById("additional-fields");
  let fieldsHTML = "";

  switch (role) {
    case "farmer":
      fieldsHTML = `
        <input type="date" name="dob" placeholder="Date of Birth" required>
        <textarea name="address" placeholder="Address" required></textarea>
        <input type="number" name="field_size" placeholder="Field Size (in hectares)" required>
        <input type="file" name="picture" accept="image/*" required>
      `;
      break;
    case "agronomist":
      fieldsHTML = `
        <input type="date" name="dob" placeholder="Date of Birth" required>
        <textarea name="address" placeholder="Address" required></textarea>
        <input type="text" name="specialty" placeholder="Specialty" required>
        <input type="number" name="experience" placeholder="Experience (in years)" required min="0">
        <input type="file" name="picture" accept="image/*" required>
      `;
      break;
    case "storage_owner":
      fieldsHTML = `
        <input type="date" name="dob" placeholder="Date of Birth" required>
        <textarea name="address" placeholder="Location Address" required></textarea>
        <input type="number" name="storage_capacity" placeholder="Storage Capacity (in tonnes)" required>
        <input type="file" name="picture" accept="image/*" required>
      `;
      break;
    default:
      fieldsHTML = "";
  }

  additionalFields.innerHTML = fieldsHTML;
}
