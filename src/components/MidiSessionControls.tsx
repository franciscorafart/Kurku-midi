import { useEffect, useState } from "react";
import styled from "styled-components";
import {
  Dropdown,
  DropdownButton,
  Button,
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap";
import midiOutput from "atoms/selectedMidiOutput";
import midiOutputs from "atoms/midiOutputs";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { MidiOutputType } from "utils/types";
import { initMidi } from "utils/midiCtx";
import theme from "config/theme";
import MidiSessionConfigPanel from "./MidiSessionConfigPanel";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 8px;
  border-bottom: 1px solid ${theme.background2};
`;

const ButtonSection = styled.div`
  display: flex;
  justify-content: space-between;
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
      <ButtonSection>
        <OptionsContainer>
          <MidiDropdown />
        </OptionsContainer>
        <OptionsContainer>
          <OverlayTrigger
            key={"left"}
            placement={"left"}
            overlay={
              !selectedOutput ? (
                <Tooltip id="tooltip-left">Select MIDI output first</Tooltip>
              ) : (
                <div />
              )
            }
          >
            <Button
              onClick={selectedOutput ? () => initMidiSession() : () => {}}
              variant="success"
            >
              Start MIDI
            </Button>
          </OverlayTrigger>
        </OptionsContainer>
        <OptionsContainer>
          <Button variant="secondary" onClick={() => setSessionPanel(true)}>
            Config Session
          </Button>
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
