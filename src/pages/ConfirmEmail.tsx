import { useState, useEffect, useCallback } from "react";
import styled from "styled-components";
import { Form, Button, Alert } from "react-bootstrap";
import theme from "config/theme";
import HowToUse from "components/HowToUse";
import WhatIsKurku from "components/WhatIsKurku";
import Header from "components/Header";
import { apiUrl } from "../constants";

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

function ConfirmEmail() {
  const [showModal, setShowModal] = useState(false);
  const [showKurkuModal, setShowKurkuModal] = useState(false);
  const [token, setToken] = useState("");

  useEffect(() => {
    const validateToken = () => {
      const queryString = window.location.search;
      const urlParams = new URLSearchParams(queryString);

      const recoveryToken = urlParams.get("confirmation") || "";
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

  const handleSubmit = useCallback(
    async (event: React.SyntheticEvent) => {
      event.preventDefault();

      const payload = {
        confirmationToken: token,
      };

      fetch(`${apiUrl}/auth/confirm-user`, {
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
              message: `Email ${data.email} confirmed. Please log in.`,
            });
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
    [token]
  );

  return (
    <>
      <Container>
        <Header
          kurkuModal={() => setShowKurkuModal(true)}
          howToUseModal={() => setShowModal(true)}
        />
        {Boolean(token) ? (
          <FormContainer>
            <StyledForm onSubmit={handleSubmit}>
              {alert.display && (
                <Alert key={alert.variant} variant={alert.variant}>
                  {alert.message}
                </Alert>
              )}
              <ButtonContainer>
                <Button type="submit" disabled={!Boolean(token)}>
                  <span>Confirm Email</span>
                </Button>
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

export default ConfirmEmail;