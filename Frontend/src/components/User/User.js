import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import UserNavbar from "./UserNavbar";
import HomePage from "./HomePage"; // Home component
import OrdersPage from "./OrdersPage"; // Orders component
import SettingsPage from "./SettingsPage"; // Settings component
import '../../App.css';
import axios from "axios";

function User({ apiBaseUrl }) {
  const [darkMode, setDarkMode] = useState(true);
  const [error, setError] = useState("");
  const [forceSettings, setForceSettings] = useState(false);

  const toggleTheme = () => setDarkMode(!darkMode);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${apiBaseUrl}/admin/customer`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        });

        if (response.data && response.data.customers) {
          const customers = response.data.customers;

          // Check if any customer has latitude and longitude equal to 0
          const hasZeroLocation = customers.some(
            (customer) => customer.latitude === 0 && customer.longitude === 0
          );

          if (hasZeroLocation) {
            setForceSettings(true); // Force the settings route
          } else {
            setForceSettings(false);
            // console.log("No customers with zero latitude and longitude.");
          }
        }
      } catch (err) {
        setError("Failed to load users");
        console.error(err);
        alert("Failed to update customer");
      }
    };

    fetchUsers();
  }, [apiBaseUrl]);

  return (
    <>
      <UserNavbar darkMode={darkMode} toggleTheme={toggleTheme} />
      {forceSettings ? (
        // Force redirect to SettingsPage
        <Routes>
          <Route path="/settings" element={<SettingsPage apiBaseUrl={apiBaseUrl} darkMode={darkMode} />} />
        </Routes>
      ) : (
        // Render regular routes
        <Routes>
          <Route path="/" element={<HomePage darkMode={darkMode} apiBaseUrl={apiBaseUrl} />} />
          <Route path="/orders" element={<OrdersPage darkMode={darkMode} apiBaseUrl={apiBaseUrl} />} />
          <Route path="/settings" element={<SettingsPage apiBaseUrl={apiBaseUrl} darkMode={darkMode} />} />
        </Routes>
      )}
    </>
  );
}

export default User;
