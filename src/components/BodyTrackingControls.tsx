import { Dropdown, DropdownButton, Button } from "react-bootstrap";
import { useRecoilState, useRecoilValue } from "recoil";
import { MidiOutputType } from "utils/types";
import midiOutputs from "atoms/midiOutputs";
import midiOutput from "atoms/selectedMidiOutput";
import styled from "styled-components";
import { Text, SubTitle2 } from "./shared";

const ButtonSection = styled.div`
  display: flex;
  justify-content: flex-start;
  gap: 20px;
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
      size="lg"
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
          {selectedOutput && (
            <Button
              onClick={() => initMidiSession()}
              variant="outline-light"
              size="lg"
            >
              Start MIDI
            </Button>
          )}
        </OptionsContainer>
      </ButtonSection>
    </Container>
  );
}

export default BodyTrackingControls;
