import React, { useState, useEffect } from "react";
import axios from "axios";

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

const DisplayUser = ({ apiBaseUrl, darkMode }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingUser, setEditingUser] = useState(null); // Track user being edited
  const [editForm, setEditForm] = useState({ name: "", email: "", password: "" });
  
  const currentColors = darkMode ? darkModeColors : lightModeColors;
  const cardCurrentColors = darkMode ? cardDarkModeColors : cardLightModeColors;

  // Fetch users from API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${apiBaseUrl}/admin/customer`);
        if (response.data && response.data.customers) {
          setUsers(response.data.customers);
        }
      } catch (err) {
        setError("Failed to load users");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [apiBaseUrl]);

  // Handle Edit Button Click
  const handleEditClick = (user) => {
    setEditingUser(user._id);
    setEditForm({ name: user.name, email: user.email, password: "" });
  };

  // Handle Edit Form Change
  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  // Save Changes to User
  const saveChanges = async () => {
    try {
      const response = await axios.patch(`${apiBaseUrl}/admin/customer`, {
        ...editForm,
        role: "CUSTOMER",
      });
      alert(response.data.message);

      // Update the local state
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user._id === editingUser ? { ...user, ...editForm } : user
        )
      );
      setEditingUser(null);
    } catch (err) {
      console.error(err);
      alert("Failed to update customer");
    }
  };

  // Handle Delete
  const handleDelete = async (email) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      const response = await axios.delete(`${apiBaseUrl}/admin/customer`, {
        data: { email },
      });
      alert(response.data.message);

      // Remove deleted user from the state
      setUsers((prevUsers) => prevUsers.filter((user) => user.email !== email));
    } catch (err) {
      console.error(err);
      alert("Failed to delete customer");
    }
  };

  return (
    <div
      className="p-3"
      style={{
        backgroundColor: currentColors.background,
        color: currentColors.text,
        borderRadius: "0px",
        boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
      }}
    >
      <h3 className="mb-4">All Users</h3>

      {loading && <p>Loading users...</p>}
      {error && <p className="text-danger">{error}</p>}

      {!loading && !error && (
        <div className="row">
          {users.map((user, index) => (
            <div className="col-md-4 mb-4" key={user._id}>
              <div
                className="card shadow-sm h-100"
                style={{ borderRadius: "10px",backgroundColor:cardCurrentColors.background,color:cardCurrentColors.text }}
              >
                <div className="card-body">
                  {editingUser === user._id ? (
                    <>
                      <input
                        type="text"
                        className="form-control mb-2"
                        name="name"
                        value={editForm.name}
                        onChange={handleEditFormChange}
                        placeholder="Name"
                      />
                      <input
                        type="email"
                        className="form-control mb-2"
                        name="email"
                        value={editForm.email}
                        onChange={handleEditFormChange}
                        placeholder="Email"
                      />
                      <input
                        type="password"
                        className="form-control mb-2"
                        name="password"
                        value={editForm.password}
                        onChange={handleEditFormChange}
                        placeholder="New Password"
                      />
                      <button
                        className="btn btn-sm btn-success me-2"
                        onClick={saveChanges}
                      >
                        Save
                      </button>
                      <button
                        className="btn btn-sm btn-secondary"
                        onClick={() => setEditingUser(null)}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <h5 className="card-title">{user.name}</h5>
                      <p className="card-text">
                        <strong>Email:</strong> {user.email}
                      </p>
                      <p className="card-text">
                        <strong>Role:</strong> {user.role}
                      </p>
                      <p className="card-text">
                        <strong>Delivery Address:</strong>{" "}
                        {user.delivery_address}
                      </p>
                      <div className="d-flex justify-content-between">
                        <button
                          className="btn btn-sm btn-primary"
                          onClick={() => handleEditClick(user)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(user.email)}
                        >
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DisplayUser;
