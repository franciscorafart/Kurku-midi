import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import logo from "assets/kurku-logo.png";
import { Button } from "react-bootstrap";
import styled from "styled-components";
import StripeModal from "./StripeModal";
import { User } from "context";
import accountInState from "atoms/account";
import { useRecoilState } from "recoil";
import theme from "config/theme";
import LoginModal from "./LoginModal";
import { apiUrl } from "../constants";
import jwtDecode from "jwt-decode";

const StyledContainer = styled(Container)`
  max-width: 2000px;
  background-color: ${theme.background};
  color: ${theme.text2};
`;

const StyledNav = styled(Nav)`
  gap: 20px;
`;

const Span = styled.span`
  color: ${theme.text2};
`;

const SubscriptionInfo = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

export type StatusType = "notConnected" | "connected";

enum StatusToButtonText {
  notConnected = "Log In",
  connected = "Log Out",
}

const renewSoon = (d: string) => {
  const oneMonthToExpiry = new Date(d);
  oneMonthToExpiry.setMonth(oneMonthToExpiry.getMonth() - 1);

  return new Date() > oneMonthToExpiry;
};

function Header({
  kurkuModal,
  howToUseModal,
}: {
  kurkuModal: () => void;
  howToUseModal: () => void;
}) {
  const [displayForm, setDisplayForm] = useState(false);
  const [loginForm, setLoginForm] = useState(false);
  const isPaidUser = useContext(User);
  const [userAccount, setUserAccount] = useRecoilState(accountInState);
  const [renew, setRenew] = useState(false);

  const connected = useMemo(
    () => Boolean(userAccount.userId),
    [userAccount.userId]
  );
  const buttonText = connected
    ? StatusToButtonText.connected
    : StatusToButtonText.notConnected;

  const getUser = useCallback(() => {
    const jwtToken = localStorage.getItem("kurkuToken") || "";
    fetch(`${apiUrl}/auth/user`, {
      method: "POST",
      cache: "no-cache",
      headers: {
        "Content-Type": "application/json",
        Authorization: jwtToken,
      },
      redirect: "follow",
      referrerPolicy: "no-referrer",
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          setUserAccount({
            dateExpiry: userAccount.dateExpiry,
            userId: data.id,
          });
          setRenew(renewSoon(userAccount.dateExpiry));
        }
      })
      .catch((_) => {
        const decoded = jwtToken
          ? (jwtDecode(jwtToken) as { [index: string]: string })
          : {};
        if (decoded.id) {
          setUserAccount({
            dateExpiry: userAccount.dateExpiry,
            userId: decoded.id,
          });
          setRenew(renewSoon(userAccount.dateExpiry));
        }
      });
  }, [setUserAccount, userAccount.dateExpiry]);

  useEffect(() => {
    getUser();
  }, []);

  const handleLogout = () => {
    const jwtToken = localStorage.getItem("kurkuToken") || "";

    fetch(`${apiUrl}/auth/logout`, {
      method: "POST",
      cache: "no-cache",
      headers: {
        "Content-Type": "application/json",
        Authorization: jwtToken,
      },
      redirect: "follow",
      referrerPolicy: "no-referrer",
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          console.log("Log out sucessful");
        }
      });

    // Remove local storage anyway.
    // TODO: If no server, figure out how to invalidate
    // the token later.
    localStorage.removeItem("kurkuToken");
    localStorage.removeItem("expiry");

    setUserAccount({
      userId: "",
      dateExpiry: "",
    });
  };
  return (
    <>
      <Navbar expand="lg" bg="light" variant="dark">
        <StyledContainer>
          <Navbar.Brand href="https://kurku.tech">
            <img
              alt=""
              src={logo}
              width="30"
              height="30"
              className="d-inline-block align-top"
            />{" "}
            <Span>Kurku - Body tracking web MIDI controller</Span>
          </Navbar.Brand>
          <StyledNav>
            <Button onClick={kurkuModal} variant="outline-dark">
              What is Kurku?
            </Button>
            <Button onClick={howToUseModal} variant="outline-dark">
              How to use
            </Button>
            <Button
              variant="outline-dark"
              onClick={
                !connected ? () => setLoginForm(true) : () => handleLogout()
              }
            >
              {buttonText}
            </Button>
            {!isPaidUser && connected && (
              <Button
                variant="outline-dark"
                onClick={() => setDisplayForm(true)}
                // disabled
              >
                Subscribe
              </Button>
            )}
            {renew && connected && (
              <Button
                variant="outline-dark"
                onClick={() => setDisplayForm(true)}
              >
                Renew subscription now!
              </Button>
            )}
            {isPaidUser && (
              <SubscriptionInfo>
                Subscribed until{" "}
                {new Date(userAccount.dateExpiry).toLocaleDateString()}
              </SubscriptionInfo>
            )}
          </StyledNav>
        </StyledContainer>
        <StripeModal
          open={displayForm}
          handleClose={() => setDisplayForm(false)}
        />
        <LoginModal open={loginForm} handleClose={() => setLoginForm(false)} />
      </Navbar>
    </>
  );
}

export default Header;
