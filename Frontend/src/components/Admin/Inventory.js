import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Button, Form, Container, Row, Col, Card, Spinner, Alert } from "react-bootstrap";

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

const Inventory = ({ apiBaseUrl, darkMode }) => {
    const currentColors = darkMode ? darkModeColors : lightModeColors;
    const cardColors = darkMode ? cardDarkModeColors : cardLightModeColors;

    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [category, setCategory] = useState("");
    const [categoryAttributes, setCategoryAttributes] = useState([]);
    const [attributes, setAttributes] = useState([["", ""]]);
    const [quantity, setQuantity] = useState(0);
    const [productId, setProductId] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [fetchingCategories, setFetchingCategories] = useState(false);

    // Fetch categories
    const fetchCategories = useCallback(async () => {
        setFetchingCategories(true);
        try {
            const { data } = await axios.get(`${apiBaseUrl}/admin/categories`);
            setCategories(data.categories || []);
        } catch (error) {
            console.error("Error fetching categories:", error);
            setMessage("Error fetching categories.");
        } finally {
            setFetchingCategories(false);
        }
    }, [apiBaseUrl]);

    // Fetch products
    const fetchProducts = useCallback(async () => {
        setIsLoading(true);
        try {
            const { data } = await axios.get(`${apiBaseUrl}/admin/inventory`);
            setProducts(data.products || []);
        } catch (error) {
            console.error("Error fetching products:", error);
            setMessage("Error fetching products.");
        } finally {
            setIsLoading(false);
        }
    }, [apiBaseUrl]);

    // Fetch attributes for the selected category
    const fetchAttributes = async (selectedCategory) => {
        try {
            const { data } = await axios.get(`${apiBaseUrl}/admin/category-attributes`, {
                params: { category: selectedCategory },
            });
            setCategoryAttributes(data.attributes || []);
        } catch (error) {
            console.error("Error fetching category attributes:", error);
            setMessage("Error fetching category attributes.");
        }
    };

    useEffect(() => {
        fetchCategories();
        fetchProducts();
    }, [fetchCategories, fetchProducts]);

    // Handle category change
    const handleCategoryChange = (e) => {
        const selectedCategory = e.target.value;
        setCategory(selectedCategory);
        if (selectedCategory) fetchAttributes(selectedCategory);
    };

    // Form submission handler
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = { category, attributes: Object.fromEntries(attributes), quantity };
            if (productId) {
                await axios.patch(`${apiBaseUrl}/admin/inventory`, { ...payload, productId });
                setMessage("Product updated successfully!");
            } else {
                await axios.post(`${apiBaseUrl}/admin/inventory`, payload);
                setMessage("Product added successfully!");
            }
            resetForm();
            fetchProducts();
        } catch (error) {
            console.error("Error saving product:", error);
            setMessage("Error saving product.");
        }
    };

    // Reset form
    const resetForm = () => {
        setCategory("");
        setAttributes([["", ""]]);
        setQuantity(0);
        setProductId("");
    };

    return (
        <Container
            fluid
            style={{
                backgroundColor: currentColors.background,
                color: currentColors.text,
                padding: "20px",
            }}
        >
            <h1 className="text mb-4">Inventory Management</h1>

            {message && (
                <Alert variant={message.includes("Error") ? "danger" : "success"}>{message}</Alert>
            )}

            {fetchingCategories || isLoading ? (
                <Spinner animation="border" className="d-block mx-auto" />
            ) : (
                <>
                    <Card className="mb-4" style={{ backgroundColor: cardColors.background, color: cardColors.text }}>
                        <Card.Body>
                            <h3>{productId ? "Update Product" : "Add Product"}</h3>
                            <Form onSubmit={handleSubmit}>
                                <Form.Group controlId="formCategory">
                                    <Form.Label>Category</Form.Label>
                                    <Form.Control
                                        as="select"
                                        value={category}
                                        onChange={handleCategoryChange}
                                        required
                                    >
                                        <option value="">Select Category</option>
                                        {categories.map((cat) => (
                                            <option key={cat._id} value={cat.name}>
                                                {cat.name}
                                            </option>
                                        ))}
                                    </Form.Control>
                                </Form.Group>

                                <Form.Group>
                                    <Form.Label>Attributes</Form.Label>
                                    {attributes.map(([key, value], index) => (
                                        <Row key={index} className="mb-2">
                                            <Col>
                                                <Form.Control
                                                    as="select"
                                                    value={key}
                                                    onChange={(e) =>
                                                        setAttributes((prev) =>
                                                            prev.map((attr, i) =>
                                                                i === index ? [e.target.value, attr[1]] : attr
                                                            )
                                                        )
                                                    }
                                                    required
                                                >
                                                    <option value="">Select Attribute</option>
                                                    {categoryAttributes.map((attr) => (
                                                        <option key={attr} value={attr}>
                                                            {attr}
                                                        </option>
                                                    ))}
                                                </Form.Control>
                                            </Col>
                                            <Col>
                                                <Form.Control
                                                    placeholder="Value"
                                                    value={value}
                                                    onChange={(e) =>
                                                        setAttributes((prev) =>
                                                            prev.map((attr, i) =>
                                                                i === index ? [attr[0], e.target.value] : attr
                                                            )
                                                        )
                                                    }
                                                    required
                                                />
                                            </Col>
                                            <Col xs="auto">
                                                <Button
                                                    variant="danger"
                                                    onClick={() =>
                                                        setAttributes((prev) =>
                                                            prev.filter((_, i) => i !== index)
                                                        )
                                                    }
                                                >
                                                    Remove
                                                </Button>
                                            </Col>
                                        </Row>
                                    ))}
                                    <Button variant="success" onClick={() => setAttributes((prev) => [...prev, ["", ""]])}>
                                        Add Attribute
                                    </Button>
                                </Form.Group>

                                <Form.Group controlId="formQuantity">
                                    <Form.Label>Quantity</Form.Label>
                                    <Form.Control
                                        type="number"
                                        value={quantity}
                                        onChange={(e) => setQuantity(Number(e.target.value))}
                                        required
                                    />
                                </Form.Group>

                                <Button variant="primary" type="submit">
                                    {productId ? "Update Product" : "Add Product"}
                                </Button>
                                <Button variant="secondary" onClick={resetForm} className="ml-2">
                                    Reset
                                </Button>
                            </Form>
                        </Card.Body>
                    </Card>
                </>
            )}
        </Container>
    );
};

export default Inventory;