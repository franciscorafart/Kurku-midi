import { useEffect, useState } from "react";
import styled from "styled-components";
import { Cpu } from "react-bootstrap-icons";
import midiOutputs from "atoms/midiOutputs";
import { useSetRecoilState } from "recoil";
import { initMidi } from "utils/midiCtx";
import MidiSessionConfigPanel from "./MidiSessionConfigPanel";
import { Text, SubTitle2 } from "./shared";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const OptionsContainer = styled.div`
  display: flex;
  align-items: center;
`;

const CpuButton = styled(Cpu)`
  cursor: pointer;
`;

const SessionConfig = () => {
  const setMidiOutputs = useSetRecoilState(midiOutputs);

  const [sessionPanel, setSessionPanel] = useState(false);

  useEffect(() => {
    const loadMidiInputs = async () => {
      const midiOut = await initMidi();
      setMidiOutputs(midiOut);
    };
    loadMidiInputs();
  }, [setMidiOutputs]);

  return (
    <Container>
      <SubTitle2>
        <Text>Config</Text>
      </SubTitle2>
      <OptionsContainer>
        <CpuButton
          color="white"
          size={16}
          onClick={() => setSessionPanel(true)}
        />
      </OptionsContainer>
      <MidiSessionConfigPanel
        show={sessionPanel}
        onClose={() => setSessionPanel(false)}
      />
    </Container>
  );
};

export default SessionConfig;
