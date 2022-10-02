import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import logo from "assets/kurku-logo.png";
import { Button } from "react-bootstrap";

function Header({
  kurkuModal,
  howToUseModal,
}: {
  kurkuModal: () => void;
  howToUseModal: () => void;
}) {
  return (
    <>
      <Navbar expand="lg" bg="dark" variant="dark">
        <Container>
          <Navbar.Brand href="#home">
            <img
              alt=""
              src={logo}
              width="30"
              height="30"
              className="d-inline-block align-top"
            />{" "}
            Kurku - Body tracking web MIDI controller
          </Navbar.Brand>
          <Navbar.Collapse id="responsive-navbar-nav">
            <Nav.Link href="#home">Back to website</Nav.Link>
          </Navbar.Collapse>
          <Nav className="me-auto">
            <Button onClick={kurkuModal} variant="secondary">
              What is Kurku?
            </Button>
            <Button onClick={howToUseModal} variant="secondary">
              How to use
            </Button>
          </Nav>
        </Container>
      </Navbar>
    </>
  );
}

export default Header;
