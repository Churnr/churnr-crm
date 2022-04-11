import React, {useState} from 'react'
import {Navbar, Container, NavDropdown, Nav, Button } from 'react-bootstrap'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
export default function Navbar_site() {
    const { logout} = useAuth()
    const navigate = useNavigate();
    const [error, setError] = useState('')
async function handleLogout() {
    setError('')

    try {

    await logout()
    navigate('/login', { replace: true })
    } catch {
        setError('Failed to logout')
    }

}
  return (
  <Navbar bg="dark" variant="dark" expand="lg">
  <Container>
    <Navbar.Brand href="#home">Churnr CRM</Navbar.Brand>
    <Navbar.Toggle aria-controls="basic-navbar-nav" />
    <Navbar.Collapse id="basic-navbar-nav">
      <Nav className="me-auto">
        <Nav.Link href="#home">Home</Nav.Link>
        <Nav.Link href="#link">Link</Nav.Link>
        <NavDropdown title="Dropdown" id="basic-nav-dropdown">
          <NavDropdown.Item href="#action/3.1">Action</NavDropdown.Item>
          <NavDropdown.Item href="#action/3.2">Another action</NavDropdown.Item>
          <NavDropdown.Item href="#action/3.3">Something</NavDropdown.Item>
          <NavDropdown.Divider />
          <NavDropdown.Item href="#action/3.4">Separated link</NavDropdown.Item>
        </NavDropdown>
      </Nav>
    </Navbar.Collapse>
    <Button variant='light' size="sm" onClick={handleLogout}>Log Out {error}</Button>
  </Container>
</Navbar>
  )
}


