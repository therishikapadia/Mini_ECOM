import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";
import UserNavbar from "./UserNavbar";
import HomePage from "./HomePage"; // Home component
import OrdersPage from "./OrdersPage"; // Orders component
import SettingsPage from "./SettingsPage"; // Settings component
import '../../App.css';

function User({apiBaseUrl}) {
  
  const [darkMode, setDarkMode] = useState(true);
  const toggleTheme = () => setDarkMode(!darkMode);
  return (
    <>
      <UserNavbar darkMode={darkMode} toggleTheme={toggleTheme} />
        <Routes>
          {/* Define the routes */}
          <Route path="/" element={<HomePage darkMode={darkMode} apiBaseUrl={apiBaseUrl}/>} />
          <Route path="/orders" element={<OrdersPage darkMode={darkMode} apiBaseUrl={apiBaseUrl}/>} />
          <Route path="/settings" element={<SettingsPage apiBaseUrl={apiBaseUrl} darkMode={darkMode} />} />
        </Routes>
    </>
  );
}

export default User;
