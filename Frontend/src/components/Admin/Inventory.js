import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
    Button,
    Form,
    Container,
    Row,
    Col,
    Card,
    Spinner,
    Alert,
    Modal,
} from "react-bootstrap";

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
    const currentCardColors = darkMode ? cardDarkModeColors : cardLightModeColors;

    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [category, setCategory] = useState("");
    const [categoryAttributes, setCategoryAttributes] = useState([]);
    const [attributes, setAttributes] = useState([["", ""]]);
    const [quantity, setQuantity] = useState(0);
    const [productId, setProductId] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [fetchingData, setFetchingData] = useState(false);
    const [showModal, setShowModal] = useState(false); // Modal visibility

    // Fetch categories and attributes together
    const fetchCategoriesAndAttributes = useCallback(async () => {
        setFetchingData(true);
        try {
            // Fetch categories first
            const { data: categoriesData } = await axios.get(`${apiBaseUrl}/admin/categories`);
            setCategories(categoriesData.categories || []);
            
            // If a category is already selected, fetch its attributes
            if (category) {
                const { data: attributesData } = await axios.get(`${apiBaseUrl}/admin/categories`, {
                    params: { category },
                });
                setCategoryAttributes(Object.keys(attributesData.categories.filter(c => c.name === category)[0].attributes));
            }
        } catch (error) {
            console.error("Error fetching categories and attributes:", error);
            setMessage("Error fetching categories and attributes.");
        } finally {
            setFetchingData(false);
        }
    }, [apiBaseUrl, category]);

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

    useEffect(() => {
        fetchCategoriesAndAttributes();
        fetchProducts();
    }, [fetchCategoriesAndAttributes, fetchProducts]);

    // Handle category change
    const handleCategoryChange = (e) => {
        const selectedCategory = e.target.value;
        setCategory(selectedCategory);
        if (selectedCategory) {
            // Fetch attributes for selected category
            fetchCategoriesAndAttributes();
        }
    };

    // Form submission handler
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = { category, attributes: Object.fromEntries(attributes), quantity };
            if (productId) {
                // Handle product update (PATCH request)
                await axios.patch(`${apiBaseUrl}/admin/inventory`, { ...payload, productId });
                setMessage("Product updated successfully!");
            } else {
                // Handle product creation (POST request)
                await axios.post(`${apiBaseUrl}/admin/inventory`, payload);
                setMessage("Product added successfully!");
            }
            resetForm();
            fetchProducts();
            setShowModal(false); // Close the modal after saving
        } catch (error) {
            console.error("Error saving product:", error);
            setMessage("Error saving product.");
        }
    };

    // Handle delete product
    const handleDeleteProduct = async (productId) => {
        try {
            await axios.delete(`${apiBaseUrl}/admin/inventory`, { data: { productId } });
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

            {message && (
                <Alert variant={message.includes("Error") ? "danger" : "success"}>{message}</Alert>
            )}

            {fetchingData || isLoading ? (
                <Spinner animation="border" className="d-block mx-auto" />
            ) : (
                <>
                    {/* Add Product Button */}
                    <Button variant="primary" onClick={() => setShowModal(true)} className="mb-4">
                        Add Product
                    </Button>

                    {/* Modal for Adding/Editing Product */}
                    <Modal show={showModal} onHide={() => setShowModal(false)}>
                        <Modal.Header closeButton>
                            <Modal.Title>{productId ? "Update Product" : "Add Product"}</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
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
                                <Button variant="secondary" onClick={() => setShowModal(false)} className="ml-2">
                                    Cancel
                                </Button>
                            </Form>
                        </Modal.Body>
                    </Modal>

                    {/* Product List */}
                    {products.length > 0 && (
                        <div>
                            <h3>Existing Products</h3>
                            {products.map((product) => (
                                <Card key={product._id} style={{ marginBottom: "20px" ,backgroundColor:currentCardColors.background,color:currentCardColors.text }}>
                                    <Card.Body>
                                        <h5>{product.category}</h5>
                                        <p>Attributes: {JSON.stringify(product.attributes)}</p>
                                        <p>Quantity: {product.quantity}</p>
                                        <Button variant="danger" onClick={() => handleDeleteProduct(product._id)}>
                                            Delete
                                        </Button>
                                        <Button
                                            variant="primary"
                                            onClick={() => {
                                                setProductId(product._id);
                                                setCategory(product.category);
                                                setAttributes(Object.entries(product.attributes));
                                                setQuantity(product.quantity);
                                                setShowModal(true); // Open modal for editing
                                            }}
                                            className="ml-2"
                                        >
                                            Edit
                                        </Button>
                                    </Card.Body>
                                </Card>
                            ))}
                        </div>
                    )}
                </>
            )}
        </Container>
    );
};

export default Inventory;
