import { useContext, useMemo } from "react";
import styled from "styled-components";
import theme from "config/theme";
import { ToggleButton } from "react-bootstrap";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import { makeCCSender } from "utils/midiCtx";
import muteMidi from "atoms/muteMidi";
import { Text, SubTitle } from "./shared";
import { useRecoilState, useRecoilValue } from "recoil";
import midiOutput from "atoms/selectedMidiOutput";
import { User } from "context";

const Container = styled.div`
  flex: 2;
  display: flex;
  flex-direction: column;
  background-color: ${theme.background2};
  padding: 20px;
  border-radius: 10px;
  gap: 20px;
`;

const TextContainer = styled.div`
  display: flex;
  justify-content: center;
`;

function GlobalMidi() {
  const isPaidUser = useContext(User);
  const selectedOutput = useRecoilValue(midiOutput);
  const [muted, setMuted] = useRecoilState(muteMidi);

  const ccSender = useMemo(
    () => (selectedOutput ? makeCCSender(selectedOutput) : undefined),
    [selectedOutput]
  );

  return (
    <Container>
      <TextContainer>
        <SubTitle>
          <Text>Tools</Text>
        </SubTitle>
      </TextContainer>
      <div>
        <OverlayTrigger
          overlay={
            !isPaidUser ? <Tooltip>Mute MIDI with paid tier</Tooltip> : <div />
          }
        >
          <ToggleButton
            size="sm"
            variant="outline-light"
            disabled={!ccSender}
            onClick={
              isPaidUser
                ? (e) => {
                    e.stopPropagation();
                    setMuted(!muted);
                  }
                : undefined
            }
            value={1}
            active={muted}
          >
            Lock
          </ToggleButton>
        </OverlayTrigger>
      </div>
    </Container>
  );
}

export default GlobalMidi;
