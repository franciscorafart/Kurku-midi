import { useContext, useEffect, useState } from "react";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import logo from "assets/kurku-logo.png";
import { Button } from "react-bootstrap";
import styled from "styled-components";
import { useMetaMask } from "metamask-react";
import StripeModal from "./StripeModal";
import { User } from "context";
import accountInState from "atoms/account";
import { useRecoilState } from "recoil";
import theme from "config/theme";
import LoginModal from "./Login";

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

export type StatusType =
  | "initializing"
  | "unavailable"
  | "notConnected"
  | "connecting"
  | "connected";

enum StatusToButtonText {
  initializing = "Initializing...",
  unavailable = "Login with Metamask",
  notConnected = "Login with MetaMask",
  connecting = "Connecting...",
  connected = "Connected to MetaMask",
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

  const metamaskProps = useMetaMask();
  const { status, connect, account, chainId, ethereum } = metamaskProps;
  const buttonText = StatusToButtonText[status];

  useEffect(() => {
    if (account) {
      setUserAccount({
        dateExpiry: userAccount.dateExpiry,
        walletAddress: account,
      });

      setRenew(renewSoon(userAccount.dateExpiry));
      // localStorage.setItem("walletId", account); // Always set on connect to avoid user changing it
    }
    // Else get from local storage
  }, [
    account,
    setUserAccount,
    userAccount.walletAddress,
    userAccount.dateExpiry,
  ]);

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
              disabled={!(status === "notConnected")}
              onClick={connect}
            >
              {buttonText}
            </Button>
            <Button variant="outline-dark" onClick={() => setLoginForm(true)}>
              Login
            </Button>
            {!isPaidUser && status === "connected" && (
              <Button
                variant="outline-dark"
                onClick={() => setDisplayForm(true)}
              >
                Get paid feature access
              </Button>
            )}
            {renew && status === "connected" && (
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
