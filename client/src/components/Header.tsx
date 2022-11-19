import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import logo from "assets/kurku-logo.png";
import { Button } from "react-bootstrap";
import styled from "styled-components";
import { useMetaMask } from "metamask-react";

const StyledContainer = styled(Container)`
  max-width: 2000px;
  color: black;
`;

const StyledNav = styled(Nav)`
  gap: 20px;
`;

const Span = styled.span`
  color: black;
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

enum Blockchains {
  mainnet = "0x1", // 1
  // Test nets
  goerli = "0x5", // 5
  ropsten = "0x3", // 3
  rinkeby = "0x4", // 4
  kovan = "0x2a", // 42
  mumbai = "0x13881", // 80001
  // Layers 2
  arbitrum = "0xa4b1", // 42161
  optimism = "0xa", // 10
  // Side chains
  polygon = "0x89", // 137
  gnosisChain = "0x64", // 100
  // Alt layer 1
  binanceSmartChain = "0x38", // 56
  avalanche = "0xa86a", // 43114
  cronos = "0x19", // 25
  fantom = "0xfa", // 250
}

function Header({
  kurkuModal,
  howToUseModal,
}: {
  kurkuModal: () => void;
  howToUseModal: () => void;
}) {
  const allProps = useMetaMask();
  const { status, connect, account, chainId, ethereum } = allProps;
  const buttonText = StatusToButtonText[status];

  return (
    <>
      <Navbar expand="lg" bg="light" variant="dark">
        <StyledContainer>
          <Navbar.Brand href="#home">
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
            <Button href="https://kurku.tech" variant="outline-dark">
              Home
            </Button>
            <Button onClick={kurkuModal} variant="outline-dark">
              What is Kurku?
            </Button>
            <Button onClick={howToUseModal} variant="outline-dark">
              How to use
            </Button>
            <Button disabled={!(status === "notConnected")} onClick={connect}>
              {buttonText}
            </Button>
          </StyledNav>
        </StyledContainer>
      </Navbar>
    </>
  );
}

export default Header;
