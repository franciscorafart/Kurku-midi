import { useMemo } from "react";
import { useRecoilState } from "recoil";
import styled from "styled-components";
import selectedMidiEffect, { SelectedMidiEffectType } from "atoms/selectedMidiEffect";
import midiSession from "atoms/midiSession";
import { Offcanvas } from "react-bootstrap";
import { isEmpty } from "lodash";

const InputContainer = styled.div`
  display: flex;
`;

const Input = styled.input``;

const Label = styled.label``;

function BodyTrackingMidiPanel() {
  const [selected, setSelected]= useRecoilState(selectedMidiEffect);
  const [sessionCfg, setSessionCfg] = useRecoilState(midiSession);

  const idxEffect = useMemo(() => {
    if (sessionCfg.midi) {
      return sessionCfg.midi.findIndex(
        (eff) => selected.controller === eff.controller && selected.bodyPart === eff.bodyPart
      );
    }
  }, [selected.bodyPart, selected.controller, sessionCfg.midi]);

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
    <Offcanvas show={!isEmpty(selected)} placement='end' onHide={() => setSelected({} as SelectedMidiEffectType)}>
    <Offcanvas.Header closeButton>
      <Offcanvas.Title>{selected.controller}-{selected.bodyPart}</Offcanvas.Title>
    </Offcanvas.Header>
    <Offcanvas.Body>
      <Label>Midi Channel (1-16)</Label>
      <InputContainer>
        <Input
            type="number"
            value={effect?.channel}
            onChange={e => onChangeMidiConfig(e, 'channel')}
        />
      </InputContainer>
      <Label>CC Control (1-128)</Label>
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
    </Offcanvas.Body>
  </Offcanvas>
  );
}

export default BodyTrackingMidiPanel;