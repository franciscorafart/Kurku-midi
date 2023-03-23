import React, { useState } from "react";
import Spinner from "react-bootstrap/Spinner";

import styled from "styled-components";
import { Form, FormGroup, FormLabel, Button, Alert } from "react-bootstrap";
import account from "atoms/account";
import { useRecoilState } from "recoil";
import { apiUrl } from "../../constants";

const FormContainer = styled.div`
  padding: 20px;
`;

const initialFormState = {
  ccNumber: false,
  csv: false,
  expiry: false,
};

const LoginForm = ({
  displayAlert,
  handleClose,
}: {
  displayAlert: (display: boolean, variant: string, message: string) => void;
  handleClose: () => void;
}) => {
  const [userAccount, setUserAccount] = useRecoilState(account);

  const [errorAlert, setErrorAlert] = useState({
    display: false,
    variant: "",
    message: "",
  });
  const [spinner, setSpinner] = useState(false);
  const [formEmail, setFormEmail] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formRepeatPassword, setFormRepeatPassword] = useState("");

  const [formState, setFormState] = useState<"login" | "signup">("login");

  const [formValidState, setFormValidState] = useState(initialFormState);

  const clearMessage = () => {
    setErrorAlert({ display: false, variant: "", message: "" });
  };

  const handleFormEmail = (e: React.ChangeEvent<HTMLInputElement>) => {
    const emailAddress = e.currentTarget.value;
    setFormEmail(emailAddress);
  };

  const handleFormPassword = (e: React.ChangeEvent<HTMLInputElement>) => {
    const password = e.currentTarget.value;
    setFormPassword(password);
  };

  const handleFormRepeatPassword = (e: React.ChangeEvent<HTMLInputElement>) => {
    const password = e.currentTarget.value;
    setFormRepeatPassword(password);
  };

  const handleSubmit = async (event: React.SyntheticEvent) => {
    event.preventDefault();
    // TODO: Validations

    const payload = {
      username: formEmail,
      password: formPassword,
    };
    console.log("running submit");

    fetch(`${apiUrl}/auth/${formState}`, {
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
        if (data.success) {
          if (formState === "signup") {
            // Place Notification of success, promt user to log in
            setErrorAlert({
              display: true,
              variant: "success",
              message: `Sing up succeeded for ${data.email}`,
            });
          } else {
            // TODO: Save JWT token in local storage
            localStorage.setItem("kurkuToken", data.token);

            setErrorAlert({
              display: true,
              variant: "success",
              message: `Log in succeeded`,
            });
            // TODO: set up sessionS
            setUserAccount({
              dateExpiry: userAccount.dateExpiry,
              walletAddress: data.id,
            });
          }
        } else {
          throw data.msg;
        }
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

  return (
    <FormContainer>
      <Form onSubmit={handleSubmit}>
        {errorAlert.display && (
          <Alert key={errorAlert.variant} variant={errorAlert.variant}>
            {errorAlert.message}
          </Alert>
        )}
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
          <FormLabel>Password</FormLabel>
          <Form.Control
            onFocus={clearMessage}
            onChange={handleFormPassword}
            type="password"
            placeholder="Password"
            required
          />
        </FormGroup>
        {formState === "signup" && (
          <FormGroup>
            <FormLabel>Repeat Password</FormLabel>
            <Form.Control
              onFocus={clearMessage}
              onChange={handleFormRepeatPassword}
              type="password"
              placeholder="Passwprd"
              required
            />
          </FormGroup>
        )}
        <Button
          type="submit"
          //   variant={validCheckout() ? "success" : "secondary"}
          //   disabled={!validCheckout()}
        >
          {spinner ? <Spinner animation="border" /> : <span>Submit</span>}
        </Button>
        <span
          onClick={() =>
            formState === "login"
              ? setFormState("signup")
              : setFormState("login")
          }
        >
          {formState === "login" ? "Sign up" : "Log in"}
        </span>
      </Form>
    </FormContainer>
  );
};

export default LoginForm;
