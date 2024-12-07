import React from "react";
import { Link } from "react-router-dom";
import { Dropdown, Nav, Navbar, Container } from "react-bootstrap";

const UserNavbar = () => {
  return (
    <Navbar bg="light" expand="lg" className="shadow-sm">
      <Container fluid>
        {/* Navbar Brand */}
        <Navbar.Brand as={Link} to="/customer">
          User Dashboard
        </Navbar.Brand>

        {/* Toggle for responsiveness */}
        <Navbar.Toggle aria-controls="user-navbar" />
        <Navbar.Collapse id="user-navbar">
          <Nav className="mx-auto"> {/* Center the links */}
            <Nav.Link as={Link} to="/customer">
              Home
            </Nav.Link>
            <Nav.Link as={Link} to="/customer/orders">
              Orders
            </Nav.Link>
          </Nav>
          <Nav className="ms-auto">
            {/* User Dropdown */}
            <Dropdown align="end">
              <Dropdown.Toggle
                variant="light"
                id="user-dropdown"
                className="border-0 shadow-none"
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
