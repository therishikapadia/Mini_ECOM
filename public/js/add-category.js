document.addEventListener('DOMContentLoaded', () => {
  const addButton = document.getElementById('add-attribute-btn');
  const attributesContainer = document.getElementById('attributes-container');
  const categoryForm = document.getElementById('category-form');

  // Add button container styling
  const buttonContainer = document.createElement('div');
  buttonContainer.style.textAlign = 'center';
  buttonContainer.style.margin = '20px 0';
  addButton.style.padding = '10px 20px';
  addButton.style.backgroundColor = '#4CAF50';
  addButton.style.color = 'white';
  addButton.style.border = 'none';
  addButton.style.borderRadius = '4px';
  addButton.style.cursor = 'pointer';
  buttonContainer.appendChild(addButton);
  attributesContainer.parentNode.insertBefore(buttonContainer, attributesContainer);

  // Function to add a new attribute input form
  addButton.addEventListener('click', () => {
    const attributeSection = document.createElement('div');
    attributeSection.classList.add('attribute-section');
    attributeSection.style.padding = '20px';
    attributeSection.style.margin = '10px 0';
    attributeSection.style.border = '1px solid #ddd';
    attributeSection.style.borderRadius = '4px';
    attributeSection.style.backgroundColor = '#f9f9f9';

    attributeSection.innerHTML = `
      <label for="attribute-name">Attribute Name:</label>
      <input type="text" name="attribute-name" required style="margin: 5px 0; padding: 5px;">

      <label for="attribute-type">Type:</label>
      <select name="attribute-type" style="margin: 5px 0; padding: 5px;">
        <option value="array">Array</option>
        <option value="number">Number</option>
      </select>

      <label for="attribute-required">Required:</label>
      <input type="checkbox" name="attribute-required">

      <div class="extra-fields" style="margin-top: 10px;">
        <div class="allowed-values">
          <label for="allowed-values">Allowed Values (comma-separated):</label>
          <input type="text" name="allowed-values" style="margin: 5px 0; padding: 5px;">
        </div>
        <div class="number-fields">
          <label for="min-value">Min Value:</label>
          <input type="number" name="min-value" style="margin: 5px 0; padding: 5px;">

          <label for="max-value">Max Value:</label>
          <input type="number" name="max-value" style="margin: 5px 0; padding: 5px;">
        </div>
      </div>

      <button type="button" class="remove-attribute-btn" style="
        margin-top: 10px;
        padding: 8px 15px;
        background-color: #ff4444;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;">Remove Attribute</button>
    `;

    // Handle attribute removal
    attributeSection.querySelector('.remove-attribute-btn').addEventListener('click', () => {
      attributeSection.remove();
    });

    // Show/Hide extra fields based on the type selected
    const typeSelect = attributeSection.querySelector('select[name="attribute-type"]');
    typeSelect.addEventListener('change', (e) => {
      const extraFields = attributeSection.querySelector('.extra-fields');
      if (e.target.value === 'array') {
        extraFields.querySelector('.allowed-values').style.display = 'block';
        extraFields.querySelector('.number-fields').style.display = 'none';
      } else {
        extraFields.querySelector('.allowed-values').style.display = 'none';
        extraFields.querySelector('.number-fields').style.display = 'block';
      }
    });

    // Append the new attribute section to the container
    attributesContainer.appendChild(attributeSection);
  });

  // Handle form submission
  categoryForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Get category name
    const categoryName = document.getElementById('category-name').value;

    // Collect attribute data
    const attributes = [];
    const attributeSections = document.querySelectorAll('.attribute-section');

    attributeSections.forEach((section) => {
      const attribute = {
        name: section.querySelector('input[name="attribute-name"]').value,
        type: section.querySelector('select[name="attribute-type"]').value,
        required: section.querySelector('input[name="attribute-required"]').checked,
      };

      // Handle extra fields based on the type
      if (attribute.type === 'array') {
        attribute.allowedValues = section.querySelector('input[name="allowed-values"]').value.split(',');
      } else {
        attribute.min = section.querySelector('input[name="min-value"]').value;
        attribute.max = section.querySelector('input[name="max-value"]').value;
      }

      attributes.push(attribute);
    });

    const payload = {
      name: categoryName,
      attributes: attributes.reduce((acc, attr) => {
        acc[attr.name] = {
          type: attr.type,
          required: attr.required,
          allowedValues: attr.allowedValues,
          min: attr.min,
          max: attr.max,
        };
        return acc;
      }, {}),
    };

    try {
      const response = await fetch('/admin/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        alert('Category added successfully!');
        categoryForm.reset();
        attributesContainer.innerHTML = ''; // Clear the attributes
      } else {
        alert('Failed to add category');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error adding category');
    }
  });
});
