import React, { useState } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import styled from "styled-components";

import Alert from "react-bootstrap/Alert";

import SplitForm from "./SplitForm";

const PositionedAlert = styled(Alert)`
  position: static;
  margin-top: 10px;
  width: 90%;
  float: left;
`;

const StripeModal = ({ open, handleClose }) => {
  const isProduction = process.env.NODE_ENV === "production";

  const stripeKey = isProduction
    ? process.env.REACT_APP_LIVE_STRIPE_PUBLIC_KEY
    : process.env.REACT_APP_TEST_STRIPE_PUBLIC_KEY;

  const stripePromise = loadStripe(stripeKey ?? "");

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
          <Modal.Title id="contained-modal-title-vcenter">
            Enter your card information
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Elements stripe={stripePromise}>
            <SplitForm displayAlert={displayAlert} handleClose={handleClose} />
          </Elements>
        </Modal.Body>
        <Modal.Footer>
          <span>Powered by Stripe</span>
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

export default StripeModal;
