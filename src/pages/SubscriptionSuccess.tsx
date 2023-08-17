import { useState, useEffect, useCallback } from "react";
import styled from "styled-components";
import { Form, Button, Alert } from "react-bootstrap";
import theme from "config/theme";
import HowToUse from "components/HowToUse";
import WhatIsKurku from "components/WhatIsKurku";
import Header from "components/Header";
import { apiUrl } from "../constants";
import { goHome } from "utils/utils";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  min-height: 100vh;
  background-color: ${theme.background};
`;

const FormContainer = styled.div`
  padding-top: 60px;
  gap: 80px;
  width: 40%;
  display: flex;
  flex-direction: column;
`;

const VStack = styled.div`
  display: flex;
  justify-content: center;
  padding-top: 20px;
`;

function SubscriptionSuccess() {
  const [showModal, setShowModal] = useState(false);
  const [showKurkuModal, setShowKurkuModal] = useState(false);

  useEffect(() => {
    // TODO: Figure out how to write to database

    const validateToken = () => {
      const queryString = window.location.search;
      const urlParams = new URLSearchParams(queryString);

      const recoveryToken = urlParams.get("session_id") || "";
      // TODO:
      // 1. Send session Id to backend
      // 2. Backend gets session data and writes/updates the db

      // NOTE: How to write to db when subscription is renewed? => cron job, lambda callback?

      fetch(`${apiUrl}/transactions/add`, {
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
          } else {
            throw data.msg;
          }
        })
        .catch((e) => {
          console.error(e);
        });
    };
  }, []);

  const alert = {
    variant: "success",
  };

  return (
    <>
      <Header
        kurkuModal={() => setShowKurkuModal(true)}
        howToUseModal={() => setShowModal(true)}
        hideOptions
      />
      <Container>
        <FormContainer>
          <Alert key={alert.variant} variant={alert.variant}>
            {"Susbcription success!"}
          </Alert>

          {/* <VStack>
            <span>{email}</span>
          </VStack> */}
          <VStack>
            <Button onClick={goHome}>
              <span>Back to Kurku</span>
            </Button>
          </VStack>
        </FormContainer>
        <HowToUse open={showModal} onClose={() => setShowModal(false)} />
        <WhatIsKurku
          open={showKurkuModal}
          onClose={() => setShowKurkuModal(false)}
        />
      </Container>
    </>
  );
}

export default SubscriptionSuccess;
