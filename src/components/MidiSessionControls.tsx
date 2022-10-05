import { useEffect, useState } from "react";
import styled from "styled-components";
import { Dropdown, DropdownButton, Button } from "react-bootstrap";
import midiOutput from "atoms/selectedMidiOutput";
import midiOutputs from "atoms/midiOutputs";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { MidiOutputType } from "utils/types";
import { initMidi } from "utils/midiCtx";
import theme from "config/theme";
import MidiSessionConfigPanel from "./MidiSessionConfigPanel";
import { Text, SubTitle } from "./shared";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 140px;
  padding: 20px;
  background-color: ${theme.background2};
`;

const ButtonSection = styled.div`
  display: flex;
  justify-content: flex-start;
  gap: 20px;
`;

const OptionsContainer = styled.div`
  display: flex;
  align-items: center;
`;

const TextContainer = styled.div`
  display: flex;
  justify-content: flex-start;
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
    >
      {options.map((o) => (
        <Dropdown.Item key={o.id} eventKey={o.id}>
          {o.name}
        </Dropdown.Item>
      ))}
    </DropdownButton>
  );
}

const MidiSessionControl = ({ onInit }: { onInit: () => Promise<void> }) => {
  const setMidiOutputs = useSetRecoilState(midiOutputs);
  const selectedOutput = useRecoilValue(midiOutput);
  const [sessionPanel, setSessionPanel] = useState(false);

  useEffect(() => {
    const loadMidiInputs = async () => {
      const midiOut = await initMidi();
      setMidiOutputs(midiOut);
    };
    loadMidiInputs();
  }, [setMidiOutputs]);

  const initMidiSession = async () => {
    await onInit();
  };

  return (
    <Container>
      <TextContainer>
        <SubTitle>
          <Text>Session Controls</Text>
        </SubTitle>
      </TextContainer>
      <ButtonSection>
        <OptionsContainer>
          <MidiDropdown />
        </OptionsContainer>
        <OptionsContainer>
          {selectedOutput && (
            <Button onClick={() => initMidiSession()} variant="outline-light">
              Start MIDI
            </Button>
          )}
        </OptionsContainer>
      </ButtonSection>
      <MidiSessionConfigPanel
        show={sessionPanel}
        onClose={() => setSessionPanel(false)}
      />
    </Container>
  );
};

export default MidiSessionControl;
