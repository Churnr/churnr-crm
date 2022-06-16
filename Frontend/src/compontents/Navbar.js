import React, { useState } from "react";
import { Navbar, Container, NavDropdown, Nav, Button } from "react-bootstrap";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Wrap,Avatar,WrapItem } from '@chakra-ui/react'
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
        {/* <p
          style={{
            color: "white",
            lineHeight: "50px",
            paddingRight: "1rem",
            marginTop: "1rem",
          }}
        >
          {currentUser.email}
        </p> */}
        <Wrap>
          <WrapItem>            
            <p
          style={{
            color: "white",
            paddingRight: "0.5rem"
          }}
        >
          {currentUser.email}
        </p>
            <Avatar size='sm' name='Dan Abrahmov' src='https://berlingske.bmcdn.dk/media/cache/resolve/image_x_large_vertical/image/97/973869/6980615-ole.jpg' style={{margin: "0 15px"}}/>

          </WrapItem>
        </Wrap>
        <Button variant="light" size="sm" onClick={handleLogout}>
          Log Out{error}
        </Button>
      </Container>
    </Navbar>
  );
}
