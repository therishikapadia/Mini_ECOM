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
    attributes: [],
    categoryType: "",
  });
  const [showModal, setShowModal] = useState(false);
  const [editIndex, setEditIndex] = useState(null);

  // Fetch categories
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

  // Handle form changes
  const handleFormChange = (field, value) => {
    setNewCategory({ ...newCategory, [field]: value });
  };
  
  const handleAttributeChange = (index, field, value) => {
    const updatedAttributes = [...newCategory.attributes];
    updatedAttributes[index] = { ...updatedAttributes[index], [field]: value };
    handleFormChange("attributes", updatedAttributes);
  };
  
  const addNewAttribute = () => {
    handleFormChange("attributes", [
      ...newCategory.attributes,
      { key: "", value: "" }, // Explicit key-value pair structure
    ]);
  };
  
  const removeAttribute = (index) => {
    const updatedAttributes = newCategory.attributes.filter((_, i) => i !== index);
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
  
        // Make an API call to update the category
        await axios.patch("http://localhost:8000/admin/categories", payload);
      } else {
        // Adding a new category
        payload = {
          name: newCategory.name, // New category name
          attributes: newCategory.attributes,
          categoryType: newCategory.categoryType,
        };
  
        // Make an API call to add the category
        await axios.post("http://localhost:8000/admin/categories", payload);
      }
  
      // Refresh categories and reset modal state
      fetchCategories();
      setShowModal(false);
      setNewCategory({ name: "", attributes: [], categoryType: "" });
      setEditIndex(null);
    } catch (error) {
      console.error("Failed to save category:", error.response?.data || error.message);
    }
  };

  const handleEditCategory = (index) => {
    const category = categories[index];
    setNewCategory({
      name: category.name,
      attributes: category.attributes.map(attr => {
        // Create a new object without _id
        const { _id, ...rest } = attr;
        return rest;
      }),
      categoryType: category.categoryType || "",
    });
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

  const handleRemoveSpecificAttribute = async (categoryName, attributeKey) => {
    try {
      await axios.delete("http://localhost:8000/admin/categories/attribute", {
        data: { 
          categoryName, 
          attributeKey 
        },
      });
      fetchCategories();
    } catch (error) {
      console.error("Failed to delete specific attribute:", error.response?.data || error.message);
    }
  };

  return (
    <div className="p-4" style={{ backgroundColor: currentColors.background }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 style={{ color: currentColors.text }}>Products</h3>
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

      <Row>
        {categories.map((item, index) => (
          <Col key={index} md={4}>
            <Card
              className="mb-4 position-relative"
              style={{
                backgroundColor: cardCurrentColors.background,
                color: currentColors.text,
                borderColor: cardCurrentColors.border,
              }}
            >
              <Button
                variant="danger"
                className="position-absolute"
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
                <p><strong>Product In:</strong> {item.categoryType}</p>

                {item.attributes.map((attr, attrIndex) => {
                  // Create a copy of the attribute without _id
                  const { _id, ...displayAttributes } = attr;
                  
                  return (
                    <Card 
                      key={attrIndex} 
                      className="mb-3" 
                      style={{ 
                        backgroundColor: cardCurrentColors.background, 
                        color: currentColors.text 
                      }}
                    >
                      <Card.Body>
                        <h5>Details :</h5>  
                        {Object.entries(displayAttributes).map(([key, value], keyIndex) => (
                          <p key={keyIndex}>
                            <strong>{key}:</strong> {value}
                          </p>
                        ))}
                        <Button
                          variant="danger"
                          onClick={() => handleRemoveSpecificAttribute(item.name, attr.key)}
                        >
                          Delete Attribute
                        </Button>
                      </Card.Body>
                    </Card>
                  );
                })}
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
              <Form.Label>Product Name:</Form.Label>
              <Form.Control
                type="text"
                value={newCategory.name}
                onChange={(e) => handleFormChange("name", e.target.value)}
                placeholder="Enter Product name"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Product Type:</Form.Label>
              <Form.Control
                type="text"
                value={newCategory.categoryType}
                onChange={(e) => handleFormChange("categoryType", e.target.value)}
                placeholder="Enter Product type"
              />
            </Form.Group>

            <h5>Product Details:</h5>
            {newCategory.attributes.map((attribute, index) => (
              <div key={index} className="mb-3">
                <div className="d-flex mb-2">
                  <Form.Control
                    type="text"
                    placeholder="Attribute Key"
                    value={attribute.key}
                    onChange={(e) => handleAttributeChange(index, "key", e.target.value)}
                    className="mr-2"
                  />
                  <Form.Control
                    type="text"
                    placeholder="Attribute Value"
                    value={attribute.value}
                    onChange={(e) => handleAttributeChange(index, "value", e.target.value)}
                  />
                </div>
                <Button
                  variant="danger"
                  onClick={() => removeAttribute(index)}
                  className="mt-2"
                >
                  Remove Attribute
                </Button>
              </div>
            ))}
            <Button variant="success" onClick={addNewAttribute}>
              Add New Attribute
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