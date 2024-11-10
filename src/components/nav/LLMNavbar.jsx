import { Container, Nav, Navbar } from "react-bootstrap";
import { Link } from "react-router-dom";

import sensei from "../../assets/sensei.png";

export default function LLMNavbar(props) {
  return (
    <Navbar bg="dark" variant="dark" sticky="top" expand="sm" collapseOnSelect>
      <Container>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Brand as={Link} to="/">
          <img
            alt="Sensei"
            src={sensei}
            width="30"
            height="30"
            className="d-inline-block align-top"
          />{" "}
          V-RAG
        </Navbar.Brand>
        <Navbar.Collapse id="responsive-navbar-nav" className="me-auto">
          <Nav>
            <Nav.Link as={Link} to="/">Home</Nav.Link>
            <Nav.Link as={Link} to="/about">About Us</Nav.Link>
            <Nav.Link as={Link} to="/chat">Chat</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
