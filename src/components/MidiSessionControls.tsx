import { useEffect } from "react";
import styled from "styled-components";
import midiOutputs from "atoms/midiOutputs";
import { useSetRecoilState } from "recoil";
import { initMidi } from "utils/midiCtx";
import theme from "config/theme";
import SessionSaving from "./SessionSaving";
import { Text, SubTitle } from "./shared";
import BodyTrackingControls from "./BodyTrackingControls";
import SessionConfig from "./SessionConfig";

const Container = styled.div`
  flex: 4;
  display: flex;
  flex-direction: column;
  padding: 20px;
  gap: 30px;
  border-radius: 8px;
  background-color: ${theme.background4};
`;

const TextContainer = styled.div`
  display: flex;
  justify-content: center;
`;

const MidiSessionControl = ({
  onInit,
  onResume,
  onPause,
}: {
  onInit: () => Promise<void>;
  onResume: () => Promise<void>;
  onPause: () => Promise<void>;
}) => {
  const setMidiOutputs = useSetRecoilState(midiOutputs);

  useEffect(() => {
    const loadMidiInputs = async () => {
      const midiOut = await initMidi();
      setMidiOutputs(midiOut);
    };
    loadMidiInputs();
  }, [setMidiOutputs]);

  return (
    <Container>
      <TextContainer>
        <SubTitle>
          <Text>Controls</Text>
        </SubTitle>
      </TextContainer>
      <BodyTrackingControls
        onInit={onInit}
        onResume={onResume}
        onPause={onPause}
      />
      <SessionSaving />
      <SessionConfig />
    </Container>
  );
};

export default MidiSessionControl;
