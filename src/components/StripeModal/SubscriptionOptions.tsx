import React, { useContext, useState } from "react";

import Spinner from "react-bootstrap/Spinner";

import styled from "styled-components";
import { Button, FormText } from "react-bootstrap";
import { apiUrl } from "../../constants";
import { User } from "context";
import { useRecoilValue } from "recoil";
import account from "atoms/account";

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

const SubscriptionOptions = ({ onError }: { onError: () => void }) => {
  const isPaidUser = useContext(User);
  const userAccount = useRecoilValue(account);

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
          console.log("data before error", data);
          const { url } = data;

          window.location.href = url;
        })
        .catch((e) => {
          setSpinner(false);
          onError();
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
        if (data.success) {
          const { url } = data;
          window.location.href = url;
        } else {
          onError();
        }
      })
      .catch((e) => {
        setSpinner(false);
        onError();
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
            <Button
              disabled={!Boolean(userAccount.checkoutId)}
              onClick={handleCancel}
              variant="warning"
            >
              Manage Subscription
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

export default SubscriptionOptions;
