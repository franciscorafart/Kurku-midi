import React, { useState } from "react";
import {
  useStripe,
  useElements,
  CardNumberElement,
  CardCvcElement,
  CardExpiryElement,
} from "@stripe/react-stripe-js";

import Spinner from "react-bootstrap/Spinner";

import styled from "styled-components";
import {
  Form,
  FormGroup,
  FormLabel,
  Button,
  Alert,
  FormControl,
  FormText,
} from "react-bootstrap";
import account from "atoms/account";
import { useRecoilState } from "recoil";
import { fetchBodyBase } from "../shared";

const options = {
  style: {
    base: {
      fontSize: 14,
      color: "#424770",
      letterSpacing: "0.025em",
      fontFamily: "Source Code Pro, monospace",
      "::placeholder": {
        color: "#aab7c4",
      },
    },
    invalid: {
      color: "#9e2146",
    },
  },
};

const FormContainer = styled.div`
  padding: 20px;
`;

const initialFormState = {
  ccNumber: false,
  csv: false,
  expiry: false,
};

const SplitForm = ({
  displayAlert,
  handleClose,
}: {
  displayAlert: (display: boolean, variant: string, message: string) => void;
  handleClose: () => void;
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [userAccount, setUserAccount] = useRecoilState(account);

  const [errorAlert, setErrorAlert] = useState({
    display: false,
    variant: "",
    message: "",
  });
  const [spinner, setSpinner] = useState(false);
  const [formEmail, setFormEmail] = useState("");
  const [formValidState, setFormValidState] = useState(initialFormState);
  // const [price, setPrice] = useState(0);
  const price = 20; // USD

  const clearMessage = () => {
    setErrorAlert({ display: false, variant: "", message: "" });
  };

  const handleFormEmail = (e: React.ChangeEvent<HTMLInputElement>) => {
    const emailAddress = e.currentTarget.value;
    setFormEmail(emailAddress);
  };

  const handleSubmit = async (event: React.SyntheticEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setSpinner(true);
    const card = elements.getElement(CardNumberElement);

    if (!card) {
      setSpinner(false);
      return;
    }

    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: "card",
      card,
    });

    if (error || !paymentMethod) {
      setSpinner(false);
      setErrorAlert({
        display: true,
        variant: "danger",
        message: `There was an error creating payment method: ${error}`,
      });
      return;
    }

    const payload = {
      paymentMethodId: paymentMethod.id,
      amount: Number(price),
      currency: "usd",
      customerEmail: formEmail,
    };

    fetch("/get_intent", {
      method: "POST",
      cache: "no-cache",
      headers: {
        "Content-Type": "application/json",
      },
      redirect: "follow",
      referrerPolicy: "no-referrer",
      body: JSON.stringify(payload),
    })
      .then((response) => response.json())
      .then((data) => {
        stripe
          .confirmCardPayment(data.clientSecret, {
            payment_method: paymentMethod.id,
          })
          .then((result) => {
            setSpinner(false);

            if (result.error) {
              setErrorAlert({
                display: true,
                variant: "danger",
                message: result?.error?.message || "",
              });
            }

            if (result.paymentIntent) {
              fetch("/addTransaction", {
                method: "POST",
                cache: "no-cache",
                headers: {
                  "Content-Type": "application/json",
                },
                redirect: "follow",
                referrerPolicy: "no-referrer",
                body: JSON.stringify({
                  walletId: userAccount.walletAddress,
                  intent: result.paymentIntent.id,
                }),
              })
                .then((response) => response.json())
                .then((data) => {
                  // TODO:
                  // 1. Get encrypted date back
                  // 2. Write encrypted date to local storage
                  // 3. Update User account with unencrypted date

                  const dateString = new Date(data.expiry).toLocaleDateString();
                  setUserAccount({
                    ...userAccount,
                    dateExpiry: dateString,
                  });

                  // Storing locally for offline use
                  localStorage.setItem("walletId", userAccount.walletAddress);
                  localStorage.setItem("expiry", dateString);

                  handleClose();
                  displayAlert(
                    true,
                    "success",
                    `Your payment was submitted successfully. You have access until ${dateString}.`
                  );
                })
                .catch((e) => {
                  setSpinner(false);
                  setErrorAlert({
                    display: true,
                    variant: "danger",
                    message: `There was an error. Please reach out to support: ${e}`,
                  });
                });
            } else {
              handleClose();
            }
          });
      })
      .catch((error) => {
        setSpinner(false);
        setErrorAlert({
          display: true,
          variant: "danger",
          message: `There was an error: ${error}`,
        });
      });
  };

  const formValid = (fieldValid: { [index: string]: boolean }) => {
    const validFormStateClone = { ...formValidState };
    const updatedFormState = {
      ...validFormStateClone,
      ...fieldValid,
    };

    setFormValidState(updatedFormState);
  };

  const validCheckout = () =>
    Object.values(formValidState).indexOf(false) === -1;

  return (
    <FormContainer>
      <FormText>
        1 year access to Kurku is $20 USD and you can access the paid features
        login in with your MetaMask wallet. Pay with your credit card via
        Stripe. Your email is for Stripe billing purposes, we don't store your
        data.
      </FormText>

      <Form onSubmit={handleSubmit}>
        {errorAlert.display && (
          <Alert key={errorAlert.variant} variant={errorAlert.variant}>
            {errorAlert.message}
          </Alert>
        )}
        <FormGroup>
          <FormLabel>Amount (USD)</FormLabel>
          <Form.Control
            onFocus={clearMessage}
            // onChange={(e) => setPrice(Number(e.target.value))}
            value={20}
            type="number"
            disabled
            // placeholder="30"
            // required
          />
        </FormGroup>
        <FormGroup>
          <FormLabel>Email</FormLabel>
          <Form.Control
            onFocus={clearMessage}
            onChange={handleFormEmail}
            type="email"
            placeholder="name@example.com"
            required
          />
        </FormGroup>
        <FormGroup>
          <FormLabel>Card number</FormLabel>
          <CardNumberElement
            onFocus={clearMessage}
            // options={options}
            onReady={() => {}}
            onChange={(e) => {
              const validField = e.complete === true && e.error === undefined;
              formValid({ ccNumber: validField });
            }}
            onBlur={() => {}}
          />
        </FormGroup>
        <FormGroup>
          <FormLabel>Expiration date</FormLabel>
          <CardExpiryElement
            onFocus={clearMessage}
            // options={options}
            onReady={() => {}}
            onChange={(e) => {
              const validField = e.complete === true && e.error === undefined;
              formValid({ expiry: validField });
            }}
            onBlur={() => {}}
          />
        </FormGroup>
        <FormGroup>
          <FormLabel>CVC</FormLabel>
          <CardCvcElement
            onFocus={clearMessage}
            // options={options}
            onReady={() => {}}
            onChange={(e) => {
              const validField = e.complete === true && e.error === undefined;
              formValid({ csv: validField });
            }}
            onBlur={() => {}}
          />
        </FormGroup>
        <Button
          type="submit"
          variant={validCheckout() ? "success" : "secondary"}
          disabled={!stripe || !validCheckout()}
        >
          {spinner ? <Spinner animation="border" /> : <span>Pay</span>}
        </Button>
      </Form>
    </FormContainer>
  );
};

export default SplitForm;
