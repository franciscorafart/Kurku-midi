import React, { useState } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import styled from "styled-components";

import Alert from "react-bootstrap/Alert";

import SubscriptionOptions from "./SubscriptionOptions";

const PositionedAlert = styled(Alert)`
  position: static;
  margin-top: 10px;
  width: 90%;
  float: left;
`;

const Subscription = ({
  open,
  handleClose,
}: {
  open: boolean;
  handleClose: () => void;
}) => {
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
            Subscribe to Kurku
          </Modal.Title>
          <PositionedAlert key={alert.variant} variant={alert.variant}>
            {alert.message}
          </PositionedAlert>
        </Modal.Header>
        <Modal.Body>
          <Elements stripe={stripePromise}>
            <SubscriptionOptions
              onError={() =>
                setAlert({
                  display: true,
                  variant: "danger",
                  message: "Error accessing checkout session",
                })
              }
            />
          </Elements>
        </Modal.Body>
        <Modal.Footer>
          <span>Powered by Stripe</span>
          {handleClose && (
            <Button
              variant="secondary"
              onClick={() => {
                handleClose();
                clearMessage();
              }}
            >
              Close
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Subscription;
