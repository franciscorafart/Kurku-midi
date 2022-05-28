import { useMemo } from "react";
import { useRecoilValue, useRecoilState } from "recoil";
import styled from "styled-components";
import selectedMidiEffect from "atoms/selectedMidiEffect";
import midiSession from "atoms/midiSession";

const Container = styled.div`
  width: 25%;
`;

const InputContainer = styled.div`
  display: flex;
`;

const Input = styled.input``;

const Title = styled.h2``;

const Label = styled.label``;

function BodyTrackingMidiPanel() {
  const selected = useRecoilValue(selectedMidiEffect);
  const [sessionCfg, setSessionCfg] = useRecoilState(midiSession);

  const idxEffect = useMemo(() => {
    if (sessionCfg.midi) {
      return sessionCfg.midi.findIndex(
        (eff) => selected.controller === eff.controller && selected.bodyPart === eff.bodyPart
      );
    }
  }, [selected.bodyPart, selected.controller, sessionCfg.midi]);
  // TODO: State setter out of selected element onInputChange

  const effect =
    idxEffect !== undefined ? sessionCfg.midi[idxEffect] : undefined;

  const onChangeScreen = (
    e: React.ChangeEvent<HTMLInputElement>,
    d: "a" | "b"
  ) => {
    const v = e.target.value;
    if (effect && idxEffect !== undefined) {
      const newEffects = sessionCfg.midi.map((eff, idx) =>
        idxEffect === idx
          ? {
              ...eff,
              screenRange: { ...eff.screenRange, [d]: Number(v) }
            }
          : eff
      );
      setSessionCfg({
        ...sessionCfg,
        midi: newEffects
      });
    }
  };

  const onChangeMidiConfig = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'controller' | 'channel'
  ) => {
    const v = e.target.value;
    if (effect && idxEffect !== undefined) {
        const newEffects = sessionCfg.midi.map((eff, idx) =>
          idxEffect === idx
            ? {
                ...eff,
                [type]: Number(v),
              }
            : eff
        );
        setSessionCfg({
          ...sessionCfg,
          midi: newEffects
        });
    }
  }

  const onChangeRange = (
    e: React.ChangeEvent<HTMLInputElement>,
    d: "x" | "y"
  ) => {
    const v = e.target.value;
    if (effect && idxEffect !== undefined) {
      const newEffects = sessionCfg.midi.map((eff, idx) =>
        idxEffect === idx
          ? {
              ...eff,
              valueRange: { ...eff.valueRange, [d]: Number(v) }
            }
          : eff
      );

      setSessionCfg({
        ...sessionCfg,
        midi: newEffects
      });
    }
  };

  return (
    <Container>
      <Title>
        {selected.controller}-{selected.bodyPart}
      </Title>
      <Label>Midi Channel</Label>
      <InputContainer>
        <Input
            type="number"
            value={effect?.channel}
            onChange={e => onChangeMidiConfig(e, 'channel')}
        />
      </InputContainer>
      <Label>CC Control</Label>
      <InputContainer>
        <Input
            type="number"
            value={effect?.controller}
            onChange={e => onChangeMidiConfig(e, 'controller')}
        />
      </InputContainer>
      <Label>Screen Range</Label>
      <InputContainer>
        <Input
          type="number"
          value={effect?.screenRange.a}
          onChange={(e) => onChangeScreen(e, "a")}
        />
        <Input
          type="number"
          value={effect?.screenRange.b}
          onChange={(e) => onChangeScreen(e, "b")}
        />
      </InputContainer>
      <Label>Output Range</Label>
      <InputContainer>
        <Input
          type="number"
          value={effect?.valueRange.x}
          onChange={(e) => onChangeRange(e, "x")}
        />
        <Input
          type="number"
          value={effect?.valueRange.y}
          onChange={(e) => onChangeRange(e, "y")}
        />
      </InputContainer>
    </Container>
  );
}

export default BodyTrackingMidiPanel;