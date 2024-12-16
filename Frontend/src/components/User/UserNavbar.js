import React from "react";
import { Link } from "react-router-dom";
import { Dropdown, Nav, Navbar, Container, Button } from "react-bootstrap";
import { FaSun, FaMoon } from "react-icons/fa";


const darkModeColors = {
  background: "#18283e",
  text: "#e0e0e0",
  border: "#fff",
  icon: "#fff",
};

const lightModeColors = {
  background: "#f8f9fa",
  text: "#000",
  border: "#000",
  icon: "#000",
};


const UserNavbar = ({ darkMode, toggleTheme }) => {
  const currentColors = darkMode ? darkModeColors : lightModeColors;

  return (
    <Navbar expand="lg" style={{ backgroundColor: currentColors.background,borderBottom:"px solid",borderBottomColor:currentColors.text, color: currentColors.text }} className="shadow-sm px-3">
      <Container fluid style={{ color: currentColors.text }}>
        {/* Navbar Brand */}
        <Navbar.Brand as={Link} style={{ color: currentColors.text }} to="/customer">
          User Dashboard
        </Navbar.Brand>

        {/* Toggle for responsiveness */}
        <Navbar.Toggle aria-controls="user-navbar" />
        <Navbar.Collapse id="user-navbar">
          <Nav className="mx-auto"> {/* Center the links */}
            <Nav.Link as={Link} style={{ color: currentColors.text }} to="/customer">
              Home
            </Nav.Link>
            <Nav.Link as={Link} style={{ color: currentColors.text }} to="/customer/orders">
              Orders
            </Nav.Link>
          </Nav>
          <Nav className="ms-auto">
            <Button
              onClick={toggleTheme}
              className="me-3"
              style={{
                backgroundColor: "transparent",
                // border: `1px solid ${currentColors.border}`,
                border: "none",
                fontSize: "20px",
                cursor: "pointer",
              }}
            >
              {darkMode ? (
                <FaSun style={{ color: currentColors.icon }} />
              ) : (
                <FaMoon style={{ color: currentColors.icon }} />
              )}
            </Button>
            {/* User Dropdown */}
            <Dropdown align="end">
              <Dropdown.Toggle
                variant="light" 
                id="user-dropdown"
                className="border-0 shadow-none"
                style={{backgroundColor:currentColors.background,color:currentColors.text}}
              >
                <img
                  src="https://via.placeholder.com/40"
                  alt="User Avatar"
                  className="rounded-circle"
                  style={{ width: "40px", height: "40px", objectFit: "cover" }}
                />
              </Dropdown.Toggle>

              <Dropdown.Menu>
                <Dropdown.Item as={Link} to="/customer/settings">
                  Settings
                </Dropdown.Item>
                <Dropdown.Item
                  onClick={() => {
                    // Logout logic here
                    localStorage.removeItem("authToken");
                    localStorage.removeItem("role");
                    window.location.reload();
                  }}
                >
                  Logout
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default UserNavbar;
