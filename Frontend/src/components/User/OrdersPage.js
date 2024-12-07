import React, { useState, useEffect } from "react";
import axios from "axios";

const Order = ({ apiBaseUrl }) => {
    const [orders, setOrders] = useState([]);
    const [newOrder, setNewOrder] = useState({ product: "", quantity: "", notes: "" });
    const [updateOrder, setUpdateOrder] = useState({ orderId: "", quantity: "" });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Fetch customer orders
    const fetchOrders = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${apiBaseUrl}/customer/order`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
            });
            setOrders(response.data.orders);
            setError("");
        } catch (err) {
            setError(err.response?.data?.error || "Failed to fetch orders");
        } finally {
            setLoading(false);
        }
    };

    // Add a new order
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
                { headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` } }
            );
            setOrders([response.data.order, ...orders]); // Add new order to the list
            setNewOrder({ product: "", quantity: "", notes: "" }); // Reset form
            setError("");
        } catch (err) {
            setError(err.response?.data?.error || "Failed to add order");
        } finally {
            setLoading(false);
        }
    };

    // Update an existing order
    const updateCustomerOrder = async () => {
        if (!updateOrder.orderId || !updateOrder.quantity) {
            setError("Order ID and a valid quantity are required");
            return;
        }
        setLoading(true);
        try {
            const response = await axios.patch(
                `${apiBaseUrl}/customer/order`,
                { ...updateOrder },
                { headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` } }
            );
            // Update the order in the state
            setOrders((prevOrders) =>
                prevOrders.map((order) =>
                    order._id === updateOrder.orderId ? response.data.order : order
                )
            );
            setUpdateOrder({ orderId: "", quantity: "" }); // Reset form
            setError("");
        } catch (err) {
            setError(err.response?.data?.error || "Failed to update order");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    return (
        <div className="container mt-4">
            <h2>Orders</h2>

            {error && <div className="alert alert-danger">{error}</div>}

            <div className="mb-4">
                <h4>Add Order</h4>
                <input
                    type="text"
                    className="form-control mb-2"
                    placeholder="Product ID"
                    value={newOrder.product}
                    onChange={(e) => setNewOrder({ ...newOrder, product: e.target.value })}
                />
                <input
                    type="number"
                    className="form-control mb-2"
                    placeholder="Quantity"
                    value={newOrder.quantity}
                    onChange={(e) => setNewOrder({ ...newOrder, quantity: e.target.value })}
                />
                <textarea
                    className="form-control mb-2"
                    placeholder="Notes (optional)"
                    value={newOrder.notes}
                    onChange={(e) => setNewOrder({ ...newOrder, notes: e.target.value })}
                ></textarea>
                <button className="btn btn-primary" onClick={addOrder} disabled={loading}>
                    Add Order
                </button>
            </div>

            <div className="mb-4">
                <h4>Update Order</h4>
                <input
                    type="text"
                    className="form-control mb-2"
                    placeholder="Order ID"
                    value={updateOrder.orderId}
                    onChange={(e) => setUpdateOrder({ ...updateOrder, orderId: e.target.value })}
                />
                <input
                    type="number"
                    className="form-control mb-2"
                    placeholder="Quantity"
                    value={updateOrder.quantity}
                    onChange={(e) => setUpdateOrder({ ...updateOrder, quantity: e.target.value })}
                />
                <button
                    className="btn btn-warning"
                    onClick={updateCustomerOrder}
                    disabled={loading}
                >
                    Update Order
                </button>
            </div>

            <h4>Order List</h4>
            {loading && <div className="spinner-border text-primary" role="status"></div>}
            <ul className="list-group">
                {orders.map((order) => (
                    <li key={order._id} className="list-group-item">
                        <strong>Product:</strong> {order.product.name || order.product} <br />
                        <strong>Quantity:</strong> {order.quantity} <br />
                        <strong>Status:</strong> {order.orderStatus} <br />
                        <strong>Notes:</strong> {order.notes || "N/A"} <br />
                        <small className="text-muted">Order ID: {order._id}</small>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Order;
