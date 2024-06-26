import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import Container from "react-bootstrap/Container";
import Alert from "react-bootstrap/Alert";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import { Instagram, Youtube, Linkedin, Envelope } from "react-bootstrap-icons";
import logo from "assets/kurku-logo.png";
import { Button } from "react-bootstrap";
import styled from "styled-components";
import Subscription from "./StripeModal/Subscription";
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
  color: ${theme.text};
  padding: 20px 20px 0 20px;
`;

const StyledNavbar = styled(Navbar)`
  padding: 0;
`;

const StyledNav = styled(Nav)`
  gap: 20px;
`;

const Span = styled.span`
  color: ${theme.text};
`;

const StyledAlert = styled(Alert)`
  margin: 0;
`;

const CircleContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

const SubscriptionInfo = styled(CircleContainer)`
  font-size: 12px;
  gap: 6px;
`;

const A = styled.a`
  cursor: pointer;
  color: white;
  text-decoration: none;

  &:hover {
    color: ${theme.border};
  }
`;

export type StatusType = "notConnected" | "connected";

enum StatusToButtonText {
  notConnected = "Log In / Sign up",
  connected = "Log Out",
}

const LoginStateCircle = styled.div<{ color: string }>`
  background-color: ${({ color }) => color};
  height: 16px;
  width: 16px;
  border-radius: 8px;
`;

function Header({
  howToUseModal,
  hideOptions,
}: {
  howToUseModal: () => void;
  hideOptions?: Boolean;
}) {
  const [displayForm, setDisplayForm] = useState(false);
  const [loginForm, setLoginForm] = useState(false);
  const isPaidUser = useContext(User);
  const [userAccount, setUserAccount] = useRecoilState(accountInState);

  const [alert, setAlert] = useState({
    display: false,
    variant: "",
    message: "",
  });

  const connected = useMemo(
    () => Boolean(userAccount.userId),
    [userAccount.userId]
  );

  const userEmail = userAccount.email;

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
            email: data.email,
            checkoutId: data.checkoutId || "",
          });
        }
      })
      .catch((_) => {
        const decoded = jwtToken
          ? (jwtDecode(jwtToken) as { [index: string]: string })
          : {};

        // TODO: Figure out how to add expiry data in Token instead of storing it locally
        // where it can be altered
        if (decoded.id) {
          setAlert({
            display: true,
            variant: "success",
            message: "Loading local data",
          });
          setUserAccount({
            dateExpiry: userAccount.dateExpiry,
            userId: decoded.id,
            email: decoded.email,
            checkoutId: decoded.checkoutId || userAccount.checkoutId || "",
          });
        }
      });
  }, [setUserAccount, userAccount.checkoutId, userAccount.dateExpiry]);

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
          setAlert({
            display: true,
            variant: "success",
            message: "Log out successful",
          });
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
      email: "",
      checkoutId: "",
    });
  };

  const color = connected
    ? isPaidUser
      ? theme.paid
      : theme.loggedIn
    : theme.loggedOut;

  return (
    <>
      <StyledNavbar>
        <StyledContainer>
          <Navbar.Brand
            href="https://about.kurku.tech"
            target="_blank"
            rel="noreferrer"
          >
            <img
              alt=""
              src={logo}
              width="30"
              height="30"
              className="d-inline-block align-top"
            />{" "}
            <Span>Kurku - Body-tracking web MIDI controller</Span>
          </Navbar.Brand>
          {alert.display && (
            <StyledAlert key={alert.variant} variant={alert.variant}>
              {alert.message}
            </StyledAlert>
          )}
          <StyledNav>
            <Button onClick={howToUseModal} variant="outline-light">
              How to use
            </Button>
            <Button
              variant="outline-light"
              onClick={() => setDisplayForm(true)}
            >
              {!isPaidUser ? "Pro Subscription" : "Manage subscription"}
            </Button>
            {!hideOptions && (
              <>
                <Button
                  variant="outline-light"
                  onClick={
                    !connected ? () => setLoginForm(true) : () => handleLogout()
                  }
                >
                  {buttonText}
                </Button>
                {
                  <SubscriptionInfo>
                    <CircleContainer>
                      <LoginStateCircle color={color} />
                    </CircleContainer>
                    {!connected ? (
                      "Disconnected"
                    ) : isPaidUser ? (
                      <>
                        {userEmail} <br />
                        Expires{" "}
                        {new Date(userAccount.dateExpiry).toLocaleDateString()}
                      </>
                    ) : (
                      <>{userEmail}</>
                    )}
                  </SubscriptionInfo>
                }
              </>
            )}
          </StyledNav>
          <StyledNav>
            <A href="https://www.instagram.com/kurkusounds/" target="_blank">
              <Instagram size={20} />
            </A>
            <A
              href="https://www.youtube.com/channel/UCmWikEn62An79cbUTfL5eGw"
              target="_blank"
            >
              <Youtube size={20} />
            </A>
            <A href="https://www.linkedin.com/company/kurku/" target="_blank">
              <Linkedin size={20} />
            </A>
            <A href="mailto:admin@kurku.tech" target="_blank">
              <Envelope size={20} />
            </A>
          </StyledNav>
        </StyledContainer>
        <Subscription
          open={displayForm}
          handleClose={() => setDisplayForm(false)}
        />
        <LoginModal open={loginForm} handleClose={() => setLoginForm(false)} />
      </StyledNavbar>
    </>
  );
}

export default Header;
