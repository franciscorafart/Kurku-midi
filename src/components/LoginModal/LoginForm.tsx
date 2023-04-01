import React, { useMemo, useState, useEffect } from "react";
import styled from "styled-components";
import { Form, FormGroup, FormLabel, Button, Alert } from "react-bootstrap";
import account from "atoms/account";
import { useRecoilState } from "recoil";
import { apiUrl } from "../../constants";
import { isRepeatValid, passwordValid, validateEmail } from "utils/utils";

const FormContainer = styled.div`
  padding: 20px;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  padding-top: 20px;
`;

const LoginForm = ({
  mode,
  handleClose,
}: {
  mode: string;
  handleClose: () => void;
}) => {
  const [userAccount, setUserAccount] = useRecoilState(account);

  const [alert, setAlert] = useState({
    display: false,
    variant: "",
    message: "",
  });
  const [formEmail, setFormEmail] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formRepeatPassword, setFormRepeatPassword] = useState("");

  const resetForm = () => {
    setFormEmail("");
    setFormPassword("");
    setFormRepeatPassword("");
  };

  useEffect(() => {
    resetForm();
  }, [mode]);

  const clearMessage = () => {
    setAlert({ display: false, variant: "", message: "" });
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

    const payload = {
      email: formEmail,
      password: formPassword,
    };

    fetch(`${apiUrl}/auth/${mode}`, {
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
          if (mode === "signup") {
            // Place Notification of success, promt user to log in
            setAlert({
              display: true,
              variant: "success",
              message: `Sing up succeeded for ${data.email}. Please log in.`,
            });
          } else {
            localStorage.setItem("kurkuToken", data.token);

            setAlert({
              display: true,
              variant: "success",
              message: `Log in succeeded`,
            });

            setUserAccount({
              dateExpiry: userAccount.dateExpiry,
              userId: data.id,
            });
            handleClose();
          }
        } else {
          throw data.msg;
        }
      })
      .catch((error) => {
        setAlert({
          display: true,
          variant: "danger",
          message: `There was an error: ${error}`,
        });
      });
  };

  const formValid = useMemo(
    () =>
      mode === "login"
        ? validateEmail(formEmail) && passwordValid(formPassword)
        : validateEmail(formEmail) &&
          passwordValid(formPassword) &&
          isRepeatValid(formPassword, formRepeatPassword),
    [formEmail, formPassword, formRepeatPassword, mode]
  );

  return (
    <FormContainer>
      <Form onSubmit={handleSubmit}>
        {alert.display && (
          <Alert key={alert.variant} variant={alert.variant}>
            {alert.message}
          </Alert>
        )}

        <FormGroup>
          <FormLabel>Email</FormLabel>
          <Form.Control
            onFocus={clearMessage}
            value={formEmail}
            onChange={handleFormEmail}
            type="email"
            placeholder="name@example.com"
            isValid={validateEmail(formEmail)}
            required
          />
        </FormGroup>
        <FormGroup>
          <FormLabel>Password</FormLabel>
          <Form.Control
            onFocus={clearMessage}
            value={formPassword}
            onChange={handleFormPassword}
            type="password"
            placeholder="Password"
            isValid={passwordValid(formPassword)}
            required
          />
        </FormGroup>
        {mode === "signup" && (
          <FormGroup>
            <FormLabel>Repeat Password</FormLabel>
            <Form.Control
              onFocus={clearMessage}
              value={formRepeatPassword}
              onChange={handleFormRepeatPassword}
              type="password"
              placeholder="Password"
              isValid={isRepeatValid(formPassword, formRepeatPassword)}
              required
            />
          </FormGroup>
        )}
        <ButtonContainer>
          <Button type="submit" disabled={!formValid}>
            <span>Submit</span>
          </Button>
        </ButtonContainer>
      </Form>
    </FormContainer>
  );
};

export default LoginForm;
