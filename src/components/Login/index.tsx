import React, { useState } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import styled from "styled-components";

import Alert from "react-bootstrap/Alert";

import LoginForm from "./LoginForm";

const PositionedAlert = styled(Alert)`
  position: static;
  margin-top: 10px;
  width: 90%;
  float: left;
`;

const LoginModal = ({
  open,
  handleClose,
}: {
  open: boolean;
  handleClose: () => void;
}) => {
  const [alert, setAlert] = useState({
    display: false,
    message: "",
    variant: "",
  });

  const clearMessage = () => {
    setAlert({ display: false, variant: "", message: "" });
  };

  const displayAlert = (display: boolean, variant: string, message: string) => {
    setAlert({ display: display, variant: variant, message: message });
  };

  return (
    <div>
      <Modal
        show={open}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Header>
          <Modal.Title id="contained-modal-title-vcenter">Login</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <LoginForm displayAlert={displayAlert} handleClose={handleClose} />
        </Modal.Body>
        <Modal.Footer>
          {handleClose && (
            <Button variant="secondary" onClick={handleClose}>
              Close
            </Button>
          )}
        </Modal.Footer>
      </Modal>
      <Modal
        show={alert.display}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centerd
      >
        <Modal.Body>
          <PositionedAlert key={alert.variant} variant={alert.variant}>
            {alert.message}
          </PositionedAlert>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={clearMessage}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default LoginModal;
