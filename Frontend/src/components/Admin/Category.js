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
  const [newCategory, setNewCategory] = useState({ name: "", attributes: [] });
  const [showModal, setShowModal] = useState(false);
  const [editIndex, setEditIndex] = useState(null);

  const fetchCategories = async () => {
    try {
      const response = await axios.get("http://localhost:8000/admin/categories");
      setCategories(response.data.categories);
    } catch (error) {
      console.error("Failed to fetch categories:", error.response?.data || error.message);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleFormChange = (field, value) => {
    if (field === "attributes") {
      setNewCategory({ ...newCategory, attributes: value });
    } else {
      setNewCategory({ ...newCategory, [field]: value });
    }
  };

  const handleAttributeChange = (index, field, value) => {
    const updatedAttributes = [...newCategory.attributes];
    updatedAttributes[index] = { ...updatedAttributes[index], [field]: value };
    handleFormChange("attributes", updatedAttributes);
  };

  const addNewAttribute = () => {
    handleFormChange("attributes", [...newCategory.attributes, { key: "", value: "" }]);
  };

  const removeAttribute = (index) => {
    const updatedAttributes = newCategory.attributes.filter((_, i) => i !== index);
    handleFormChange("attributes", updatedAttributes);
  };

  const handleSaveCategory = async () => {
    try {
      const formattedAttributes = newCategory.attributes.reduce((acc, { key, value }) => {
        if (key && value) acc[key] = value.split(",").map((item) => item.trim());
        return acc;
      }, {});

      if (editIndex !== null) {
        await axios.patch("http://localhost:8000/admin/categories", {
          oldName: categories[editIndex].name,
          newName: newCategory.name,
          attributes: formattedAttributes,
        });
      } else {
        await axios.post("http://localhost:8000/admin/categories", {
          name: newCategory.name,
          attributes: formattedAttributes,
        });
      }

      fetchCategories();
      setShowModal(false);
      setNewCategory({ name: "", attributes: [] });
      setEditIndex(null);
    } catch (error) {
      console.error("Failed to save category:", error.response?.data || error.message);
    }
  };

  const handleEditCategory = (index) => {
    const category = categories[index];
    const attributes = Object.entries(category.attributes || {}).map(([key, values]) => ({
      key,
      value: values.join(", "),
    }));

    setNewCategory({ name: category.name, attributes });
    setEditIndex(index);
    setShowModal(true);
  };

  const handleRemoveCategory = async (index) => {
    try {
      await axios.delete("http://localhost:8000/admin/categories", {
        data: { name: categories[index].name },
      });
      fetchCategories();
    } catch (error) {
      console.error("Failed to delete category:", error.response?.data || error.message);
    }
  };

  return (
    <div className="p-4" style={{ backgroundColor: currentColors.background }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 style={{ color: currentColors.text }}>Categories</h3>
        <Button
          variant="primary"
          onClick={() => {
            setNewCategory({ name: "", attributes: [] });
            setEditIndex(null);
            setShowModal(true);
          }}
        >
          Add Category
        </Button>
      </div>

      <Row>
        {categories.map((item, index) => (
          <Col key={index} md={4}>
            <Card
              className="mb-4 position-relative"
              style={{ backgroundColor: cardCurrentColors.background, color: currentColors.text }}
            >
              <Button
                variant="danger"
                className="position-absolute d-flex justify-content-center align-items-center"
                style={{
                  top: "5px",
                  right: "5px",
                  borderRadius: "10px",
                  width: "35px",
                  height: "35px",
                  padding: "0",
                  border: "none",
                  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
                }}
                onClick={() => handleRemoveCategory(index)}
              >
                <MdDelete size={15} color="white" />
              </Button>

              <Card.Body>
                <Card.Title>{item.name}</Card.Title>
                {Object.keys(item.attributes || {}).map((key) => (
                  <div key={key}>
                    <h5>{key.charAt(0).toUpperCase() + key.slice(1)}:</h5>
                    <ul>
                      {item.attributes[key].map((value, idx) => (
                        <li key={idx}>{value}</li>
                      ))}
                    </ul>
                  </div>
                ))}
                <Button variant="warning" onClick={() => handleEditCategory(index)}>
                  Edit
                </Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

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

            <Form.Label>Attributes:</Form.Label>
            {newCategory.attributes.map((attr, index) => (
              <div key={index} className="d-flex mb-2">
                <Form.Control
                  type="text"
                  value={attr.key}
                  onChange={(e) => handleAttributeChange(index, "key", e.target.value)}
                  placeholder="Attribute Key (e.g., color)"
                  className="me-2"
                />
                <Form.Control
                  type="text"
                  value={attr.value}
                  onChange={(e) => handleAttributeChange(index, "value", e.target.value)}
                  placeholder="Attribute Values (e.g., red, blue)"
                />
                <Button
                  variant="danger"
                  onClick={() => removeAttribute(index)}
                  className="ms-2"
                >
                  Remove
                </Button>
              </div>
            ))}
            <Button variant="secondary" onClick={addNewAttribute}>
              Add Attribute
            </Button>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSaveCategory}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Category;
