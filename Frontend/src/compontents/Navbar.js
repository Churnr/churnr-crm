import React, { useState } from "react";
import { Navbar, Container, NavDropdown, Nav, Button } from "react-bootstrap";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
export default function Navbar_site() {
  const { logout } = useAuth();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  async function handleLogout() {
    setError("");

    try {
      await logout();
      navigate("/login", { replace: true });
    } catch {
      setError("Failed to logout");
    }
  }
  return (
    <Navbar bg="dark" variant="dark" expand="lg">
      <Container>
        <Navbar.Brand href="/">Churnr Dashboard</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            {/* <Nav.Link href="#home">Home</Nav.Link> */}
            <NavDropdown title="Guides" id="basic-nav-dropdown">
              <NavDropdown.Item href="/guide">Slack commands</NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
        <p
          style={{
            color: "white",
            lineHeight: "50px",
            paddingRight: "1rem",
            marginTop: "1rem",
          }}
        >
          {currentUser.email}
        </p>
        <Button variant="light" size="sm" onClick={handleLogout}>
          Log Out{error}
        </Button>
      </Container>
    </Navbar>
  );
}
