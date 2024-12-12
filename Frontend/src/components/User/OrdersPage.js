import React, { useState, useEffect } from "react";
import axios from "axios";

const Order = ({ apiBaseUrl }) => {
    const [orders, setOrders] = useState([]);
    const [inventory, setInventory] = useState([]); // Holds inventory items
    const [newOrder, setNewOrder] = useState({ product: "", quantity: "", notes: "" });
    const [updateOrder, setUpdateOrder] = useState({ orderId: "", quantity: "" });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Fetch customer orders
    const fetchOrders = async () => {
        // console.log())
        setLoading(true);
        try {
            const response = await axios.get(`http://localhost:8000/customer/order`, {
                //  headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("authToken")}`,
                    'Content-Type': 'application/json',
                },
                    withCredentials:true
            });
            console.log(response)
            setOrders(response.data.orders);
            setError("");
        } catch (err) {
            setError(err.response?.data?.error || "Failed to fetch orders");
        } finally {
            setLoading(false);
        }
    };

    // Fetch inventory for dropdown
    const fetchInventory = async () => {
        try {
            const response = await axios.get(`http://localhost:8000/admin/inventory`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },withCredentials:true
            });
            setInventory(response.data.products);
        } catch (err) {
            console.error("Error fetching inventory:", err);
            setError("Failed to fetch inventory.");
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
                `http://localhost:8000/customer/order`,
                { ...newOrder },
                { headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },withCredentials:true }
            );
            setOrders([response.data.order, ...orders]); // Add new order to the list
            setNewOrder({ product: "", quantity: "", notes: "" }); // Reset form
            setError("");
        } catch (err) {
            console.error(err);
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
                `http://localhost:8000/customer/order`,
                { ...updateOrder },
                { headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` } ,withCredentials:true}
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
        fetchInventory();
    }, []);

    return (
        <div className="container mt-4">
            <h2>Orders</h2>

            {error && <div className="alert alert-danger">{error}</div>}

            <div className="mb-4">
                <h4>Add Order</h4>
                <select
                    className="form-control mb-2"
                    value={newOrder.product}
                    onChange={(e) => setNewOrder({ ...newOrder, product: e.target.value })}
                >
                    <option value="">Select Product</option>
                    {inventory.map((item) => (
                        <option key={item._id} value={item._id}>
                            {item.category}
                            {item.attributes &&
                                " (" +
                                Object.entries(item.attributes)
                                    .filter(([key]) => key !== "_id") // Exclude "_id" key
                                    .map(([key, value]) => `${key}: ${value}`)
                                    .join(", ") +
                                ")"}
                        </option>
                    ))}
                </select>

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
                {/* {orders.map((order) => (
                    <li key={order._id} className="list-group-item">
                        <strong>Product:</strong> {order.product.name || order.product} <br />
                        <strong>Quantity:</strong> {order.quantity} <br />
                        <strong>Status:</strong> {order.orderStatus} <br />
                        <strong>Notes:</strong> {order.notes || "N/A"} <br />
                        <small className="text-muted">Order ID: {order._id}</small>
                    </li>
                ))} */}
            </ul>
        </div>
    );
};

export default Order;