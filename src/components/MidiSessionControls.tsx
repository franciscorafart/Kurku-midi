import { useEffect, useState } from "react";
import styled from "styled-components";
import {
  Dropdown,
  DropdownButton,
  Button,
  ButtonGroup,
  ToggleButton,
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap";
import midiOutput from "atoms/selectedMidiOutput";
import midiOutputs from "atoms/midiOutputs";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { MidiOutputType } from "utils/types";
import { initMidi } from "utils/midiCtx";
import sessionConfig from "atoms/sessionConfig";
import theme from "config/theme";

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

// const Label = styled.span``;

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
  const [sessionCfg, setSessionCfg] = useRecoilState(sessionConfig);
  const setMidiOutputs = useSetRecoilState(midiOutputs);
  const selectedOutput = useRecoilValue(midiOutput);
  const [selectOutputTooltip, setSelectOutputTooltip] = useState(false);

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
                <Tooltip id="tooltip-left">Select midi output first</Tooltip>
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
        {/* <OptionsContainer>
          <Label>Computer speed</Label>
          <ButtonGroup>
            <ToggleButton
              id={`radio-slow`}
              type="radio"
              name="Slow"
              value="slow"
              checked={sessionCfg.machineType === "slow"}
              onChange={() =>
                setSessionCfg({ ...sessionCfg, machineType: "slow" })
              }
            >
              Slow
            </ToggleButton>
            <ToggleButton
              id={`radio-decent`}
              type="radio"
              name="Decent"
              value="decent"
              checked={sessionCfg.machineType === "decent"}
              onChange={() =>
                setSessionCfg({ ...sessionCfg, machineType: "decent" })
              }
            >
              Decent
            </ToggleButton>
            <ToggleButton
              id={`radio-fast`}
              type="radio"
              name="Fast"
              value="fast"
              checked={sessionCfg.machineType === "fast"}
              onChange={() =>
                setSessionCfg({ ...sessionCfg, machineType: "fast" })
              }
            >
              Fast
            </ToggleButton>
          </ButtonGroup>
        </OptionsContainer> */}
      </ButtonSection>
    </Container>
  );
};

export default MidiSessionControl;
