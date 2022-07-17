import { useEffect } from "react";
import styled from "styled-components";
import {
  Dropdown,
  DropdownButton,
  Button,
  ButtonGroup,
  ToggleButton,
} from "react-bootstrap";
import midiOutput from "atoms/selectedMidiOutput";
import midiOutputs from "atoms/midiOutputs";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { MidiOutputType } from "utils/types";
import { initMidi } from "utils/midiCtx";
import sessionConfig from "atoms/sessionConfig";
import theme from "config/theme";
import { SubTitle2 } from "./shared";

const Container = styled.div`
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 8px;
  border-right: 1px solid ${theme.background2};
  min-height: 600px;
`;

const UpperSection = styled.div`
  display: flex;
  flex-direction: column;
`;

const OptionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding-bottom: 20px;
`;

const Label = styled.span``;

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

const MidiSessionConfig = ({ onInit }: { onInit: () => Promise<void> }) => {
  const [sessionCfg, setSessionCfg] = useRecoilState(sessionConfig);
  const setMidiOutputs = useSetRecoilState(midiOutputs);

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
      <UpperSection>
        <SubTitle2>Session Config</SubTitle2>
        <OptionsContainer>
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
        </OptionsContainer>
        <OptionsContainer>
          <Label>Midi Output</Label>
          <MidiDropdown />
        </OptionsContainer>
      </UpperSection>
      <Button onClick={() => initMidiSession()}>Start Body Mapping</Button>
    </Container>
  );
};

export default MidiSessionConfig;
