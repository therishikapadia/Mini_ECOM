import React, { useState } from "react";
import Sidebar from "./Sidebar";
import NavbarComponent from "./Navbar";
import OverviewCards from "./OverviewCards";
import Charts from "./Charts";
import { Container } from "react-bootstrap";

function AdminPanel() {
  const [darkMode, setDarkMode] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const darkModeColor = "#111d2e";
  const lightModeColor = "#f8f9fa";

  return (
    <div
      className="d-flex"
      style={{
        backgroundColor: darkMode ? darkModeColor : lightModeColor,
        minHeight: "100vh",
        overflow: "hidden", // Prevent horizontal scrolling
      }}
    >
      {/* Sidebar */}
      <Sidebar
        toggleSidebar={toggleSidebar}
        sidebarOpen={sidebarOpen}
        toggleTheme={toggleTheme}
        darkMode={darkMode}
      />
      
      {/* Main content */}
      <div
        className="flex-grow-1"
        style={{
          marginLeft: sidebarOpen ? "250px" : "60px", // Shift the content based on sidebar width
          transition: "margin-left 0.3s",
          height: "100vh", // Ensures the main content occupies full viewport height
          overflowY: "auto", // Allows vertical scrolling inside content
        }}
      >
        {/* Sticky Navbar */}
        <div
          style={{
            position: "sticky",
            top: 0,
            zIndex: 1000,
            width: "100%",
            backgroundColor: darkMode ? "#18283e" : "#f8f9fa", // Set appropriate background
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)", // Optional: for a subtle shadow effect
          }}
        >
          <Container
            fluid
            className={`px-4 ${darkMode ? "navbar-dark-mode" : "bg-light text-dark"}`}
          >
            <NavbarComponent darkMode={darkMode} toggleTheme={toggleTheme} />
          </Container>
        </div>

        <hr
          style={{
            borderColor: darkMode ? "#232222" : "#ddd",
            borderWidth: "3px",
            margin: "0",
            opacity: 1,
          }}
        />

        {/* Content Section */}
        <div className="p-4" style={{ height: "calc(100vh - 160px)" }}>
          {/* Content blocks */}
          <OverviewCards darkMode={darkMode} />
          <Charts darkMode={darkMode} />
          <OverviewCards darkMode={darkMode} />
          <Charts darkMode={darkMode} />
          <OverviewCards darkMode={darkMode} />
          <Charts darkMode={darkMode} />
          <OverviewCards darkMode={darkMode} />
          <Charts darkMode={darkMode} />
        </div>
      </div>
    </div>
  );
}

export default AdminPanel;
