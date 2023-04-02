import { useState } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import LoginForm from "./LoginForm";
import styled from "styled-components";

enum TitleText {
  login = "Log In",
  signup = "Sign Up",
  password = "Password Recovery",
  "resend-confirm" = "Confirm Email again",
}

const Footer = styled(Modal.Footer)`
  display: flex;
  justify-content: space-between;
`;

const Buttons = styled.div`
  display: flex;
  gap: 10px;
`;

const LoginModal = ({
  open,
  handleClose,
}: {
  open: boolean;
  handleClose: () => void;
}) => {
  const [formMode, setFormMode] = useState<
    "login" | "signup" | "password" | "resend-confirm"
  >("login");
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
        <Footer>
          <Buttons>
            <Button
              variant="outline-dark"
              onClick={() => setFormMode("password")}
            >
              Forgot Password?
            </Button>
            <Button
              variant="outline-dark"
              onClick={() => setFormMode("resend-confirm")}
            >
              Confirm email again
            </Button>
          </Buttons>
          <Buttons>
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
          </Buttons>
        </Footer>
      </Modal>
    </div>
  );
};

export default LoginModal;
