import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Button, Card, Container, Row, Col, Spinner, Alert } from "react-bootstrap";

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

const DisplayOrder = ({ apiBaseUrl, darkMode }) => {
    const currentColors = darkMode ? darkModeColors : lightModeColors;
    const currentCardColors = darkMode ? cardDarkModeColors : cardLightModeColors;

    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [fetchingData, setFetchingData] = useState(false);

    // Fetch orders
    const fetchOrders = useCallback(async () => {
        setIsLoading(true);
        setFetchingData(true);
        try {
            const { data } = await axios.get(`${apiBaseUrl}/admin/orders`);
            setOrders(data.orders || []);
        } catch (error) {
            console.error("Error fetching orders:", error);
            setMessage("Error fetching orders.");
        } finally {
            setIsLoading(false);
            setFetchingData(false);
        }
    }, [apiBaseUrl]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    // Handle delete order
    const handleDeleteOrder = async (orderId) => {
        try {
            await axios.delete(`${apiBaseUrl}/admin/orders`, { data: { orderId } });
            setMessage("Order deleted successfully!");
            fetchOrders();
        } catch (error) {
            console.error("Error deleting order:", error);
            setMessage("Error deleting order.");
        }
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
            <h1 className="text mb-4">Orders</h1>

            {message && (
                <Alert variant={message.includes("Error") ? "danger" : "success"}>
                    {message}
                </Alert>
            )}

            {fetchingData || isLoading ? (
                <Spinner animation="border" className="d-block mx-auto" />
            ) : (
                <>
                    {/* Order List */}
                    <Row>
                        {orders.length > 0 ? (
                            orders.map((order) => (
                                <Col key={order._id} md={4} className="mb-3">
                                    <Card
                                        style={{
                                            backgroundColor: currentCardColors.background,
                                            color: currentCardColors.text,
                                            border: "1px solid #ccc",
                                        }}
                                    >
                                        <Card.Body>
                                            <Card.Title>Order ID: {order._id}</Card.Title>
                                            <Card.Text>
                                                Status: {order.status}
                                            </Card.Text>
                                            <Card.Text>
                                                Total: ${order.totalAmount}
                                            </Card.Text>
                                            <Card.Text>
                                                Date: {new Date(order.createdAt).toLocaleDateString()}
                                            </Card.Text>

                                            {/* Delete Order Button */}
                                            <Button
                                                variant="danger"
                                                onClick={() => handleDeleteOrder(order._id)}
                                            >
                                                Delete Order
                                            </Button>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            ))
                        ) : (
                            <Col md={12}>
                                <em>No orders available</em>
                            </Col>
                        )}
                    </Row>
                </>
            )}
        </Container>
    );
};

export default DisplayOrder;