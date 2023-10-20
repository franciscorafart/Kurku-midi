import React, { useContext, useMemo, useState } from "react";

import Spinner from "react-bootstrap/Spinner";

import styled from "styled-components";
import { Button, OverlayTrigger, Tooltip } from "react-bootstrap";
import { apiUrl } from "../../constants";
import { User } from "context";
import { useRecoilValue } from "recoil";
import account from "atoms/account";
import theme from "config/theme";

const LowerContainer = styled.div`
  padding: 0 0 40px 0;
`;
const ButtonContainer = styled.div`
  display: flex;
  gap: 20px;
  justify-content: center;
`;

const FormContainer = styled.div`
  padding: 20px;
`;

const H4 = styled.h4`
  font-size: 14px;
`;

const H5 = styled.h5`
  font-size: 12px;
`;

const P = styled.p`
  font-size: 10px;
`;

const Body = styled.div`
  display: flex;
  gap: 10px;
  justify-content: center;
`;

const TierContainer = styled.div`
  display: flex:
  flex-basis: 0;
  flex-grow: 1;
  background: ${theme.background3};
  padding: 20px;
  border-radius: 10px;
  `;

const SubscriptionOptions = ({ onError }: { onError: () => void }) => {
  const isPaidUser = useContext(User);
  const userAccount = useRecoilValue(account);

  const connected = useMemo(
    () => Boolean(userAccount.userId),
    [userAccount.userId]
  );

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
      {/* <FormText>
        1 year access to Kurku is $20 USD and you can access the paid features.
      </FormText> */}
      <LowerContainer>
        <OverlayTrigger
          overlay={
            !connected ? (
              <Tooltip>Login to get Pro Subscription</Tooltip>
            ) : (
              <></>
            )
          }
        >
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
              {/* <Button onClick={handleSubscription("monthly")}>
              Monthly Subscription $2
            </Button> */}
              <Button
                onClick={handleSubscription("yearly")}
                disabled={!connected}
              >
                Get Pro Performer subscription $20
              </Button>
              {spinner && <Spinner animation="border" />}
            </ButtonContainer>
          )}
        </OverlayTrigger>
      </LowerContainer>
      <>
        <Body>
          <TierContainer>
            <H4>Basic (Free)</H4>
            <ul>
              <li>
                <H5>Effects</H5>
                <P>One MIDI CC and note available.</P>
              </li>
              <li>
                <H5>Saving</H5>
                <P>No saving</P>
              </li>
              <li>
                <H5>Ads</H5>
                <P>Ads pop-up on every session</P>
              </li>
            </ul>
          </TierContainer>
          <TierContainer>
            <H4>Enthusiast (Freemium)</H4>
            <P>By creating a Kurku account and login in you get:</P>
            <ul>
              <li>
                <H5>Effects</H5>
                <P>Three MIDI effects and Notes.</P>
              </li>
              <li>
                <H5>Saving</H5>
                <P>Save one session to pick up your work later.</P>
              </li>
              <li>
                <H5>Ads</H5>
                <P>Ads pop-up on every session</P>
              </li>
            </ul>
          </TierContainer>
          <TierContainer>
            <H4>Pro Performer ($20 a year)</H4>
            <P>Paying users get useful extra features:</P>
            <ul>
              <li>
                <H5>Offline use</H5>
                <P>
                  You don't need an internet connection, Kurku runs like a
                  desktop app on your browser.
                </P>
              </li>
              <li>
                <H5>Saving</H5>
                <P>
                  Save any number of sessions and don't waste time setting it up
                  next time you use Kurku.
                </P>
              </li>
              <li>
                <H5>Effects</H5>
                <P>You can have eight MIDI effects for you performance.</P>
              </li>
              <li>
                <H5>Lock</H5>
                <P>
                  Lock (mute) MIDI output when you don't need it in your
                  performance
                </P>
              </li>
              <li>
                <H5>Ad free</H5>
                <P>No ads</P>
              </li>
              {/* <li>
              <h5>More accuracy:</h5>Use more precise algorithms for tracking
              body movement.
            </li> */}
            </ul>
          </TierContainer>
        </Body>
      </>
    </FormContainer>
  );
};

export default SubscriptionOptions;
