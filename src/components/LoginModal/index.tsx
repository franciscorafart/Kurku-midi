import { useState } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import LoginForm from "./LoginForm";

enum TitleText {
  login = "Log In",
  signup = "Sign Up",
  password = "Password Recovery",
}

const LoginModal = ({
  open,
  handleClose,
}: {
  open: boolean;
  handleClose: () => void;
}) => {
  const [formMode, setFormMode] = useState<"login" | "signup" | "password">(
    "login"
  );
  return (
    <div>
      <Modal
        show={open}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Header>
          <Modal.Title id="contained-modal-title-vcenter">
            {TitleText[formMode]}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <LoginForm mode={formMode} handleClose={handleClose} />
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="outline-dark"
            onClick={() => setFormMode("password")}
          >
            Forgot Password?
          </Button>
          <Button
            variant="outline-dark"
            onClick={() =>
              formMode === "login"
                ? setFormMode("signup")
                : setFormMode("login")
            }
          >
            {formMode === "login" ? "Sign up" : "Log in"}
          </Button>
          {handleClose && (
            <Button variant="secondary" onClick={handleClose}>
              Close
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default LoginModal;
