import { useState } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import LoginForm from "./LoginForm";

const LoginModal = ({
  open,
  handleClose,
}: {
  open: boolean;
  handleClose: () => void;
}) => {
  const [formMode, setFormMode] = useState<"login" | "signup">("login");
  const title = formMode === "login" ? "Log In" : "Sign Up";

  return (
    <div>
      <Modal
        show={open}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Header>
          <Modal.Title id="contained-modal-title-vcenter">{title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <LoginForm mode={formMode} handleClose={handleClose} />
        </Modal.Body>
        <Modal.Footer>
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
