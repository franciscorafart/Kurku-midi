import { useState } from "react";
import styled from "styled-components";
import { Button, Alert } from "react-bootstrap";
import theme from "config/theme";
import HowToUse from "components/HowToUse";
import WhatIsKurku from "components/WhatIsKurku";
import Header from "components/Header";
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

  // TODO: Get session id from url and write to local storage
  return (
    <>
      <Header
        kurkuModal={() => setShowKurkuModal(true)}
        howToUseModal={() => setShowModal(true)}
        hideOptions
      />
      <Container>
        <FormContainer>
          <Alert key={"success"} variant={"success"}>
            {"Susbcription success!"}
          </Alert>
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
