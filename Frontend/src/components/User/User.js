import React from "react";
import { Routes, Route } from "react-router-dom";
import UserNavbar from "./UserNavbar";
import HomePage from "./HomePage"; // Home component
import OrdersPage from "./OrdersPage"; // Orders component
import SettingsPage from "./SettingsPage"; // Settings component

function User() {
  return (
    <>
      <UserNavbar />
      <div className="container mt-4">
        <Routes>
          {/* Define the routes */}
          <Route path="/" element={<HomePage apiBaseUrl="http://localhost:8000"/>} />
          <Route path="/orders" element={<OrdersPage apiBaseUrl="http://localhost:8000"/>} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </div>
    </>
  );
}

export default User;
