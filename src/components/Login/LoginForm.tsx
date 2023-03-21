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
    console.log("submiting");
    // TODO: Validations

    const payload = {
      email: formEmail,
      password: formPassword,
    };

    fetch(`${apiUrl}/${formState}`, {
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
      .then((data) => {})
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
            placeholder="jfd9i2302_3MEFI8"
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
              placeholder="jfd9i2302_3MEFI8"
              required
            />
          </FormGroup>
        )}
        <Button
          onClick={() =>
            formState === "login"
              ? setFormState("signup")
              : setFormState("login")
          }
        >
          {formState === "login" ? "Sign up" : "Log in"}
        </Button>
        <Button
          type="submit"
          //   variant={validCheckout() ? "success" : "secondary"}
          //   disabled={!validCheckout()}
        >
          {spinner ? <Spinner animation="border" /> : <span>Submit</span>}
        </Button>
      </Form>
    </FormContainer>
  );
};

export default LoginForm;
