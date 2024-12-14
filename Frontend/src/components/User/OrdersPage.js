import React, { useState, useEffect } from "react";
import axios from "axios";
import { Modal, Button, Form } from "react-bootstrap";

const Order = ({ apiBaseUrl }) => {
    const [orders, setOrders] = useState([]);
    const [inventory, setInventory] = useState([]);
    const [newOrder, setNewOrder] = useState({ product: "", quantity: "", notes: "" });
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [filterStatus, setFilterStatus] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Modals
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${apiBaseUrl}/customer/order`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("authToken")}`,
                    "Content-Type": "application/json",
                },
                withCredentials: true,
            });
            setOrders(response.data.orders);
            setError("");
        } catch (err) {
            setError(err.response?.data?.error || "Failed to fetch orders");
        } finally {
            setLoading(false);
        }
    };

    const fetchInventory = async () => {
        try {
            const response = await axios.get(`${apiBaseUrl}/admin/inventory`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("authToken")}`,
                    "Content-Type": "application/json",
                },
                withCredentials: true,
            });
            console.log(response)
            setInventory(response.data.products);
        } catch (err) {
            setError("Failed to fetch inventory.");
        }
    };

    const addOrder = async () => {
        if (!newOrder.product || !newOrder.quantity) {
            setError("Product and quantity are required");
            return;
        }
        setLoading(true);
        try {
            const response = await axios.post(
                `${apiBaseUrl}/customer/order`,
                { ...newOrder },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
                        "Content-Type": "application/json",
                    },
                    withCredentials: true,
                }
            );
            setOrders([response.data.order, ...orders]);
            setNewOrder({ product: "", quantity: "", notes: "" });
            setError("");
            setShowAddModal(false);
        } catch (err) {
            setError(err.response?.data?.error || "Failed to add order");
        } finally {
            setLoading(false);
        }
    };

    const updateOrder = async () => {
        if (!selectedOrder || !selectedOrder._id || !selectedOrder.quantity) {
            setError("Order ID and a valid quantity are required.");
            return;
        }
        setLoading(true);
        try {
            const response = await axios.patch(
                `${apiBaseUrl}/customer/order`,
                {
                    orderId: selectedOrder._id,
                    quantity: selectedOrder.quantity
                }, // Only pass orderId and quantity
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
                        "Content-Type": "application/json",
                    },
                    withCredentials: true,
                }
            );

            setOrders((prevOrders) =>
                prevOrders.map((order) =>
                    order._id === selectedOrder._id ? response.data.order : order
                )
            );
            setSelectedOrder(null);
            setShowEditModal(false);
            setError("");
        } catch (err) {
            setError(err.response?.data?.error || "Failed to update order");
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        fetchOrders();
        fetchInventory();
    }, []);

    const filteredOrders = filterStatus
        ? orders.filter((order) => order.orderStatus === filterStatus)
        : orders;

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between">

                <h2>Orders:</h2>
                {error && <div className="alert alert-danger">{error}</div>}

                <div className="mb-4">
                    <Button variant="primary" onClick={() => setShowAddModal(true)}>
                        Add Order
                    </Button>
                </div>
            </div>

            <div className="mb-4">
                <Form.Select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="form-control"
                >
                    <option value="">All Orders</option>
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                </Form.Select>
            </div>

            <h4>Order List</h4>
            <div className="row">
                {loading && (
                    <div className="col-12 text-center">
                        <div className="spinner-border text-primary" role="status"></div>
                    </div>
                )}
                {console.log(filteredOrders)}
                {filteredOrders.map((order) => (
                    <div
                        key={order._id}
                        className="col-12 col-sm-6 col-lg-4 mb-3" // Adjust grid sizes for responsiveness
                    >
                        <div className="card h-100">
                            <div className="card-body">
                                {/* Conditionally render the product category */}
                                <h5 className="card-title">
                                    {order.product ? order.product.category : "No Category"}
                                </h5>
                                <p className="card-text">
                                    <strong>Status:</strong> {order.orderStatus} <br />
                                    <strong>Notes:</strong> {order.notes || "N/A"} <br />
                                    <strong>Quantity:</strong> {order.quantity}
                                </p>
                                <Button
                                    variant="warning"
                                    onClick={() => {
                                        setSelectedOrder(order);
                                        setShowEditModal(true);
                                    }}
                                >
                                    Edit
                                </Button>
                            </div>
                        </div>
                    </div>
                ))}

            </div>


            {/* Add Order Modal */}
            <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Add Order</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Select
                        value={newOrder.product}
                        onChange={(e) => setNewOrder({ ...newOrder, product: e.target.value })}
                        className="mb-3"
                    >
                        <option value="">Select Product</option>
                        {inventory.map((item) => (
                            <option key={item._id} value={item._id}>
                                {item.category}
                                {item.attributes &&
                                    " (" +
                                    Object.entries(item.attributes)
                                        .filter(([key]) => key !== "_id")
                                        .map(([key, value]) => `${key}: ${value}`)
                                        .join(", ") +
                                    ")"}
                            </option>
                        ))}
                    </Form.Select>
                    <Form.Control
                        type="number"
                        placeholder="Quantity"
                        value={newOrder.quantity}
                        onChange={(e) => setNewOrder({ ...newOrder, quantity: e.target.value })}
                        className="mb-3"
                    />
                    <Form.Control
                        as="textarea"
                        placeholder="Notes (optional)"
                        value={newOrder.notes}
                        onChange={(e) => setNewOrder({ ...newOrder, notes: e.target.value })}
                        className="mb-3"
                    />
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowAddModal(false)}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={addOrder} disabled={loading}>
                        Add Order
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Edit Order Modal */}
            <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Edit Order</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedOrder && (
                        <>
                            <Form.Control
                                type="text"
                                placeholder="Category"
                                value={selectedOrder.product.category} // Display category name
                                readOnly // Prevent user modification
                                className="mb-3"
                            />
                            <Form.Control
                                type="number"
                                placeholder="Quantity"
                                value={selectedOrder.quantity}
                                onChange={(e) =>
                                    setSelectedOrder({ ...selectedOrder, quantity: e.target.value })
                                }
                                className="mb-3"
                            />
                            <Form.Control
                                as="textarea"
                                placeholder="Notes"
                                value={selectedOrder.notes || ""}
                                onChange={(e) =>
                                    setSelectedOrder({ ...selectedOrder, notes: e.target.value })
                                }
                                className="mb-3"
                            />
                        </>
                    )}

                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowEditModal(false)}>
                        Close
                    </Button>
                    <Button variant="warning" onClick={updateOrder} disabled={loading}>
                        Save Changes
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default Order;