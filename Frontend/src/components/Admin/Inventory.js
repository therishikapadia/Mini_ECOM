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
            const { data } = await axios.get(`${apiBaseUrl}/admin/inventory`, { params: { category } });
            setProducts(data.products || []);
        } catch (error) {
            console.error("Error fetching products:", error);
            setMessage("Error fetching products.");
        } finally {
            setIsLoading(false);
        }
    }, [apiBaseUrl, category]);

    // Fetch categories and products when the component mounts or `category` changes
    useEffect(() => {
        fetchCategories();
        fetchProducts();
    }, [fetchCategories, fetchProducts]);

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

    // Delete product
    const handleDelete = async (id) => {
        try {
            await axios.delete(`${apiBaseUrl}/admin/inventory`, { data: { productId: id } });
            setMessage("Product deleted successfully!");
            fetchProducts();
        } catch (error) {
            console.error("Error deleting product:", error);
            setMessage("Error deleting product.");
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

            {/* Alert for messages */}
            {message && (
                <Alert variant={message.includes("Error") ? "danger" : "success"}>{message}</Alert>
            )}

            {/* Loading Spinner */}
            {fetchingCategories || isLoading ? (
                <Spinner animation="border" className="d-block mx-auto" />
            ) : (
                <>
                    {/* Product Form */}
                    <Card className="mb-4" style={{ backgroundColor: cardColors.background, color: cardColors.text }}>
                        <Card.Body>
                            <h3>{productId ? "Update Product" : "Add Product"}</h3>
                            <Form onSubmit={handleSubmit}>
                                {/* Category Selection */}
                                <Form.Group controlId="formCategory">
                                    <Form.Label>Category</Form.Label>
                                    <Form.Control
                                        as="select"
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
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

                                {/* Attribute Fields */}
                                <Form.Group>
                                    <Form.Label>Attributes</Form.Label>
                                    {attributes.map(([key, value], index) => (
                                        <Row key={index} className="mb-2">
                                            <Col>
                                                <Form.Control
                                                    placeholder="Key"
                                                    value={key}
                                                    onChange={(e) =>
                                                        setAttributes((prev) =>
                                                            prev.map((attr, i) =>
                                                                i === index ? [e.target.value, attr[1]] : attr
                                                            )
                                                        )
                                                    }
                                                    required
                                                />
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

                                {/* Quantity */}
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
                    <h3>Product List</h3>
                    {/* Product List */}
                    <Row>
                        {products.map((product) => (
                            <Col md={4} key={product._id}>
                                <Card style={{ backgroundColor: cardColors.background, color: cardColors.text }}>
                                    <Card.Body>
                                        <Card.Title>{product.category}</Card.Title>
                                        <Card.Text>
                                            <strong>Attributes:</strong>
                                            <ul>
                                                {Object.entries(product.attributes).map(([key, value]) => (
                                                    <li key={key}>
                                                        <strong>{key}:</strong> {Array.isArray(value) ? value.join(", ") : value}
                                                    </li>
                                                ))}
                                            </ul>
                                        </Card.Text>
                                        <Card.Text>
                                            <strong>Quantity:</strong> {product.quantity}
                                        </Card.Text>
                                        <Button
                                            variant="warning"
                                            onClick={() => {
                                                setProductId(product._id);
                                                setCategory(product.category);
                                                setAttributes(Object.entries(product.attributes));
                                                setQuantity(product.quantity);
                                            }}
                                        >
                                            Edit
                                        </Button>
                                        <Button
                                            variant="danger"
                                            onClick={() => handleDelete(product._id)}
                                        >
                                            Delete
                                        </Button>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>

                </>
            )}
        </Container>
    );
};

export default Inventory;
