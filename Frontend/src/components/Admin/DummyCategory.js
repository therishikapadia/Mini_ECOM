import React, { useState, useEffect } from "react";
import axios from "axios";
import { Card, Row, Col, Button, Form, Modal } from "react-bootstrap";
import { MdDelete } from "react-icons/md";

const darkModeColors = {
  background: "#111d2e",
  text: "#e0e0e0",
  border: "#2c2c2c",
  icon: "#fff",
};

const lightModeColors = {
  background: "#f8f9fa",
  text: "#000",
  border: "#ddd",
  icon: "#000",
};

const cardDarkModeColors = {
  background: "#18283e",
  text: "#e0e0e0",
  border: "#2c2c2c",
  icon: "#fff",
};

const cardLightModeColors = {
  background: "#f8f9fa",
  text: "#000",
  border: "#ddd",
  icon: "#000",
};

const Category = ({ darkMode }) => {
  const currentColors = darkMode ? darkModeColors : lightModeColors;
  const cardCurrentColors = darkMode ? cardDarkModeColors : cardLightModeColors;

  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState({
    name: "",
    attributes: [], // Array of objects containing grouped key-value pairs
    categoryType: "",
  });
  const [showModal, setShowModal] = useState(false);
  const [editIndex, setEditIndex] = useState(null);

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const response = await axios.get("http://localhost:8000/admin/categories");
      setCategories(response.data.categories);
      console.log(response)
    } catch (error) {
      console.error("Failed to fetch categories:", error.response?.data || error.message);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Handle form changes
  const handleFormChange = (field, value) => {
    setNewCategory({ ...newCategory, [field]: value });
  };

  // Handle attribute key-value changes for a specific attribute group
  const handleAttributeChange = (groupIndex, pairIndex, key, value) => {
    const updatedAttributes = [...newCategory.attributes];
    const attributeGroup = [...(updatedAttributes[groupIndex]?.pairs || [])];
    attributeGroup[pairIndex] = { ...attributeGroup[pairIndex], [key]: value };
    updatedAttributes[groupIndex] = { pairs: attributeGroup };
    handleFormChange("attributes", updatedAttributes);
  };

  // Add a new key-value pair to a specific attribute group
  const addNewPair = (groupIndex) => {
    const updatedAttributes = [...newCategory.attributes];
    updatedAttributes[groupIndex] = {
      ...updatedAttributes[groupIndex],
      pairs: [...(updatedAttributes[groupIndex]?.pairs || []), { key: "", value: "" }],
    };
    handleFormChange("attributes", updatedAttributes);
  };

  // Add a new attribute group
  const addNewAttributeGroup = () => {
    handleFormChange("attributes", [
      ...newCategory.attributes,
      { pairs: [{ key: "", value: "" }] },
    ]);
  };

  // Remove a specific key-value pair from a group
  const removePair = (groupIndex, pairIndex) => {
    const updatedAttributes = [...newCategory.attributes];
    const attributeGroup = [...(updatedAttributes[groupIndex]?.pairs || [])];
    attributeGroup.splice(pairIndex, 1);
    updatedAttributes[groupIndex] = { pairs: attributeGroup };
    handleFormChange("attributes", updatedAttributes);
  };

  // Remove an attribute group
  const removeAttributeGroup = (groupIndex) => {
    const updatedAttributes = newCategory.attributes.filter((_, i) => i !== groupIndex);
    handleFormChange("attributes", updatedAttributes);
  };

  const handleSaveCategory = async () => {
    try {
      let payload;

      if (editIndex !== null) {
        // Editing an existing category
        payload = {
          oldName: categories[editIndex].name, // Pass old name
          newName: newCategory.name, // Updated name
          attributes: newCategory.attributes,
          categoryType: newCategory.categoryType,
        };

        await axios.patch("http://localhost:8000/admin/categories", payload);
      } else {
        // Adding a new category
        payload = {
          name: newCategory.name,
          attributes: newCategory.attributes,
          categoryType: newCategory.categoryType,
        };

        await axios.post("http://localhost:8000/admin/categories", payload);
      }

      fetchCategories();
      setShowModal(false);
      setNewCategory({ name: "", attributes: [], categoryType: "" });
      setEditIndex(null);
    } catch (error) {
      console.error("Failed to save category:", error.response?.data || error.message);
    }
  };

  return (
    <div className="p-4" style={{ backgroundColor: currentColors.background }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 style={{ color: currentColors.text }}>Categories</h3>
        <Button
          variant="primary"
          onClick={() => {
            setNewCategory({ name: "", attributes: [], categoryType: "" });
            setEditIndex(null);
            setShowModal(true);
          }}
        >
          Add Category
        </Button>
      </div>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{editIndex !== null ? "Edit Category" : "Add Category"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Category Name:</Form.Label>
              <Form.Control
                type="text"
                value={newCategory.name}
                onChange={(e) => handleFormChange("name", e.target.value)}
                placeholder="Enter category name"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Category Type:</Form.Label>
              <Form.Control
                type="text"
                value={newCategory.categoryType}
                onChange={(e) => handleFormChange("categoryType", e.target.value)}
                placeholder="Enter category type"
              />
            </Form.Group>

            <h5>Attributes:</h5>
            {newCategory.attributes.map((attributeGroup, groupIndex) => (
              <div key={groupIndex} className="mb-3">
                <h6>Group {groupIndex + 1}</h6>
                {attributeGroup.pairs.map((pair, pairIndex) => (
                  <div key={pairIndex} className="d-flex mb-2">
                    <Form.Control
                      type="text"
                      placeholder="Key"
                      value={pair.key || ""}
                      onChange={(e) => handleAttributeChange(groupIndex, pairIndex, "key", e.target.value)}
                      className="me-2"
                    />
                    <Form.Control
                      type="text"
                      placeholder="Value"
                      value={pair.value || ""}
                      onChange={(e) => handleAttributeChange(groupIndex, pairIndex, "value", e.target.value)}
                    />
                    <Button variant="danger" onClick={() => removePair(groupIndex, pairIndex)}>
                      Remove
                    </Button>
                  </div>
                ))}
                <Button variant="success" onClick={() => addNewPair(groupIndex)}>
                  Add Pair
                </Button>
                <Button variant="danger" onClick={() => removeAttributeGroup(groupIndex)} className="ms-2">
                  Remove Group
                </Button>
              </div>
            ))}
            <Button variant="primary" onClick={addNewAttributeGroup}>
              Add Attribute Group
            </Button>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={handleSaveCategory}>
            Save Category
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Category;
