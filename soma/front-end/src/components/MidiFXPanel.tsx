import { useCallback } from "react";
import styled from "styled-components";
import {
  Container as FXContainer,
  EffectConnect,
  EffectContainer,
  EffectBox,
} from "./shared";
import midiSession from "atoms/midiSession";
import { useRecoilState } from "recoil";
import selectedMidiEffect from "atoms/selectedMidiEffect";
import CloseButton from "react-bootstrap/CloseButton";
import Button from "react-bootstrap/Button";
import theme from "config/theme";
import { Text, SubTitle } from "./shared";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  background-color: ${theme.background2};
  padding: 20px;
`;

const UpperBar = styled.div`
  display: flex;
  justify-content: space-between;
`;

const StlFXContainer = styled(FXContainer)`
  gap: 10px;
`;

const firstUpperCase = (t: string) =>
  t[0].toLocaleUpperCase().concat(t.slice(1));

const findCC = (ccList: number[]) => {
  for (let i = 1; i <= 127; i++) {
    if (ccList.includes(i)) {
      continue;
    }
    return i;
  }

  return 1;
};

function MidiFXPanel() {
  const [selected, setSelected] = useRecoilState(selectedMidiEffect);
  const [midiSessionConfig, setMidiSessionConfig] = useRecoilState(midiSession);
  const handleDisconnect = useCallback(
    (controller: number) => {
      const idxOfRemove = midiSessionConfig.midi.findIndex(
        (msc) => msc.controller === controller
      );
      const newMidiFx = [...midiSessionConfig.midi];

      if (idxOfRemove !== undefined) {
        newMidiFx.splice(idxOfRemove, 1);
        setMidiSessionConfig({ ...midiSessionConfig, midi: newMidiFx });
      }
    },
    [midiSessionConfig, setMidiSessionConfig]
  );

  const onAddEffect = useCallback(() => {
    const newMidiFx = [...midiSessionConfig.midi];
    const ccList = newMidiFx.map((m) => m.controller);
    const cc = findCC(ccList);

    newMidiFx.push({
      direction: "y",
      screenRange: { a: 0, b: 1 },
      valueRange: { x: 0, y: 127 },
      scaleFactor: 1,
      bodyPart: "rightWrist",
      previousValue: 0,
      targetValue: 0,
      channel: 1,
      controller: cc,
    });

    setMidiSessionConfig({ ...midiSessionConfig, midi: newMidiFx });
  }, [midiSessionConfig, setMidiSessionConfig]);

  return (
    <Container>
      <UpperBar>
        <SubTitle>
          <Text>MIDI FX panel</Text>
        </SubTitle>
        <Button variant="primary" onClick={onAddEffect}>
          Add Effect
        </Button>
      </UpperBar>
      <StlFXContainer>
        {midiSessionConfig.midi.map((mEff) => (
          <EffectConnect key={`midi-effect-${mEff.controller}`}>
            <EffectContainer
              selectable
              selected={
                mEff.controller === selected.controller &&
                mEff.bodyPart === selected.bodyPart
              }
            >
              <CloseButton onClick={() => handleDisconnect(mEff.controller)} />
              <EffectBox
                onClick={() =>
                  setSelected({
                    controller: mEff.controller,
                    bodyPart: mEff.bodyPart,
                  })
                }
                key={`${mEff.controller}-${mEff.bodyPart}`}
                selectable
              >
                {firstUpperCase(mEff.bodyPart)} | CC: {mEff.controller} |{" "}
                {mEff.direction.toUpperCase()} Axis
              </EffectBox>
            </EffectContainer>
          </EffectConnect>
        ))}
      </StlFXContainer>
    </Container>
  );
}

export default MidiFXPanel;
