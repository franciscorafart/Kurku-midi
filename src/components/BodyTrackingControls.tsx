import { Dropdown, DropdownButton, Button } from "react-bootstrap";
import { useRecoilState, useRecoilValue } from "recoil";
import { MidiOutputType } from "utils/types";
import midiOutputs from "atoms/midiOutputs";
import midiOutput from "atoms/selectedMidiOutput";
import styled from "styled-components";
import { Text, SubTitle2 } from "./shared";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";

const ButtonSection = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  gap: 10px;
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const OptionsContainer = styled.div`
  display: flex;
  align-items: center;
`;

function MidiDropdown() {
  const options = useRecoilValue(midiOutputs);
  const [selectedOutput, setSelectedOutput] = useRecoilState(midiOutput);

  const onSelect = (e: keyof MidiOutputType) => {
    const selected = options?.find((o) => o.id === e);
    setSelectedOutput(selected);
  };

  return (
    <DropdownButton
      variant="outline-light"
      title={
        selectedOutput
          ? `Midi Output: ${selectedOutput.name}`
          : "Select Midi Output"
      }
      onSelect={(e) => onSelect(e as keyof MidiOutputType)}
      size="sm"
    >
      {options.map((o) => (
        <Dropdown.Item key={o.id} eventKey={o.id}>
          {o.name}
        </Dropdown.Item>
      ))}
    </DropdownButton>
  );
}

function BodyTrackingControls({ onInit }: { onInit: () => Promise<void> }) {
  const selectedOutput = useRecoilValue(midiOutput);
  const initMidiSession = async () => {
    await onInit();
  };

  return (
    <Container>
      <SubTitle2>
        <Text>Body Tracking</Text>
      </SubTitle2>
      <ButtonSection>
        <OptionsContainer>
          <MidiDropdown />
        </OptionsContainer>
        <OptionsContainer>
          <OverlayTrigger
            overlay={
              !selectedOutput ? (
                <Tooltip>Select Midi output before starting MIDI</Tooltip>
              ) : (
                <Tooltip>
                  Tip: Map your MIDI notes and CCs before tracking
                </Tooltip>
              )
            }
          >
            <Button
              onClick={selectedOutput ? () => initMidiSession() : () => {}}
              variant="outline-light"
              size="sm"
            >
              Start MIDI Tracking
            </Button>
          </OverlayTrigger>
        </OptionsContainer>
      </ButtonSection>
    </Container>
  );
}

export default BodyTrackingControls;
