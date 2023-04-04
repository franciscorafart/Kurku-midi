import { useMemo, useState, useEffect, useCallback } from "react";
import styled from "styled-components";
import { Form, FormGroup, FormLabel, Button, Alert } from "react-bootstrap";
import theme from "config/theme";
import HowToUse from "components/HowToUse";
import WhatIsKurku from "components/WhatIsKurku";
import Header from "components/Header";
import { apiUrl } from "../constants";
import { goHome, isRepeatValid, passwordValid } from "utils/utils";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: ${theme.background};
`;

const FormContainer = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
`;

const StyledForm = styled(Form)`
  padding: 120px 0;
  width: 30%;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  padding-top: 20px;
`;

function ResetPassword() {
  const [showModal, setShowModal] = useState(false);
  const [showKurkuModal, setShowKurkuModal] = useState(false);
  const [token, setToken] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const validateToken = () => {
      const queryString = window.location.search;

      const urlParams = new URLSearchParams(queryString);

      const recoveryToken = urlParams.get("recovery") || "";
      fetch(`${apiUrl}/auth/validate-token`, {
        method: "POST",
        cache: "no-cache",
        headers: {
          "Content-Type": "application/json",
        },
        redirect: "follow",
        referrerPolicy: "no-referrer",
        body: JSON.stringify({ recoveryToken }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setToken(recoveryToken);
          } else {
            throw data.msg;
          }
        })
        .catch((e) => {
          console.error(e);
        });
    };

    validateToken();
  }, []);

  const [alert, setAlert] = useState({
    display: false,
    variant: "",
    message: "",
  });

  const [formPassword, setFormPassword] = useState("");
  const [formRepeatPassword, setFormRepeatPassword] = useState("");

  const handleFormPassword = (e: React.ChangeEvent<HTMLInputElement>) => {
    const password = e.currentTarget.value;
    setFormPassword(password);
  };

  const handleFormRepeatPassword = (e: React.ChangeEvent<HTMLInputElement>) => {
    const password = e.currentTarget.value;
    setFormRepeatPassword(password);
  };
  const clearMessage = () => {
    setAlert({ display: false, variant: "", message: "" });
  };

  const formSuccess = () => {
    setSuccess(true);
    setFormRepeatPassword("");
    setFormPassword("");
  };

  const handleSubmit = useCallback(
    async (event: React.SyntheticEvent) => {
      event.preventDefault();

      const payload = {
        recoveryToken: token,
        password: formPassword,
      };

      fetch(`${apiUrl}/auth/reset-password`, {
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
            // Place Notification of success, prompt user to log in
            setAlert({
              display: true,
              variant: "success",
              message: `Password reset successful for ${data.email}. Please log in.`,
            });
            formSuccess();
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
    },
    [formPassword, token]
  );

  const formValid = useMemo(
    () =>
      passwordValid(formPassword) &&
      isRepeatValid(formPassword, formRepeatPassword),
    [formPassword, formRepeatPassword]
  );

  return (
    <>
      <Container>
        <Header
          kurkuModal={() => setShowKurkuModal(true)}
          howToUseModal={() => setShowModal(true)}
          hideOptions
        />
        {Boolean(token) ? (
          <FormContainer>
            <StyledForm onSubmit={handleSubmit}>
              {alert.display && (
                <Alert key={alert.variant} variant={alert.variant}>
                  {alert.message}
                </Alert>
              )}
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

              <ButtonContainer>
                {!success ? (
                  <Button
                    type="submit"
                    disabled={!formValid || !Boolean(token)}
                  >
                    <span>Submit</span>
                  </Button>
                ) : (
                  <Button onClick={goHome} disabled={!success}>
                    <span>Back to Kurku</span>
                  </Button>
                )}
              </ButtonContainer>
            </StyledForm>
          </FormContainer>
        ) : (
          <h2>Link expired or invalid</h2>
        )}
        <HowToUse open={showModal} onClose={() => setShowModal(false)} />
        <WhatIsKurku
          open={showKurkuModal}
          onClose={() => setShowKurkuModal(false)}
        />
      </Container>
    </>
  );
}

export default ResetPassword;
