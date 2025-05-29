import React from 'react';
import { Navbar, Container, Nav } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import "./Header.css";

const Header = () => {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <Navbar bg={token ? "dark" : "dark"} variant="dark">
      <Container>
        <Navbar.Brand as={Link} to="/" className="gradient-heading" style={{ fontWeight: 700, fontSize: '2rem', letterSpacing: '2px' }}>
          MagicFrames
        </Navbar.Brand>
        <Nav className="ml-auto">
          {token ? (
            <>
              
              <Nav.Link className="nav-link" onClick={handleLogout}>
                Logout
              </Nav.Link>
            </>
          ) : (
            <>
              <Nav.Link as={Link} to="/login" className="nav-link">
                Login
              </Nav.Link>
              <Nav.Link as={Link} to="/register" className="nav-link">
                Signup
              </Nav.Link>
            </>
          )}
        </Nav>
      </Container>
    </Navbar>
  );
};

export default Header;