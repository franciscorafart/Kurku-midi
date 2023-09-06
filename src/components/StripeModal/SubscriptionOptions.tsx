import React, { useContext, useState } from "react";

import Spinner from "react-bootstrap/Spinner";

import styled from "styled-components";
import { Button, FormText } from "react-bootstrap";
import account from "atoms/account";
import { useRecoilState } from "recoil";
import { apiUrl } from "../../constants";
import { User } from "context";

const LowerContainer = styled.div`
  padding: 40px 0;
`;
const ButtonContainer = styled.div`
  display: flex;
  gap: 20px;
  justify-content: center;
`;

const FormContainer = styled.div`
  padding: 20px;
`;

const SplitForm = ({
  displayAlert,
  handleClose,
}: {
  displayAlert: (display: boolean, variant: string, message: string) => void;
  handleClose: () => void;
}) => {
  const isPaidUser = useContext(User);
  const [spinner, setSpinner] = useState(false);

  const handleSubscription =
    (type: "monthly" | "yearly") => async (event: React.SyntheticEvent) => {
      event.preventDefault();
      setSpinner(true);

      const payload = {
        lookup_key:
          type === "monthly"
            ? process.env.REACT_APP_PRICE_MONTHLY
            : process.env.REACT_APP_PRICE_YEARLY,
      };

      const jwt = localStorage.getItem("kurkuToken") || "";

      fetch(`${apiUrl}/transactions/createCheckoutSession`, {
        method: "POST",
        cache: "no-cache",
        headers: {
          "Content-Type": "application/json",
          Authorization: jwt,
        },
        redirect: "follow",
        referrerPolicy: "unsafe-url",
        body: JSON.stringify(payload),
      })
        .then((response) => response.json())
        .then((data) => {
          setSpinner(false);
          const { url } = data;
          // NOTE: Set session id here?
          window.location.href = url;
        });
    };

  const handleCancel = async (event: React.SyntheticEvent) => {
    event.preventDefault();
    setSpinner(true);
    const jwt = localStorage.getItem("kurkuToken") || "";

    fetch(`${apiUrl}/transactions/createPortalSession`, {
      method: "POST",
      cache: "no-cache",
      headers: {
        "Content-Type": "application/json",
        Authorization: jwt,
      },
      redirect: "follow",
      referrerPolicy: "unsafe-url",
      body: JSON.stringify({}),
    })
      .then((response) => response.json())
      .then((data) => {
        setSpinner(false);
        const { url } = data;
        window.location.href = url;
      });
  };

  return (
    <FormContainer>
      <FormText>
        1 year access to Kurku is $20 USD and you can access the paid features.
        You can also subscribe monthly for $2.
      </FormText>
      <LowerContainer>
        {isPaidUser ? (
          <ButtonContainer>
            <Button onClick={handleCancel} variant="warning">
              Cancel subscription
            </Button>
          </ButtonContainer>
        ) : (
          <ButtonContainer>
            <Button onClick={handleSubscription("monthly")}>
              Monthly Subscription $2
            </Button>
            <Button onClick={handleSubscription("yearly")}>
              Yearly subscription $20
            </Button>
            {spinner && <Spinner animation="border" />}
          </ButtonContainer>
        )}
      </LowerContainer>
    </FormContainer>
  );
};

export default SplitForm;
