import styled from "styled-components";
import { useRecoilState } from "recoil";
import selectedEffect, { SelectedEffectType } from "atoms/selectedEffect";
import sessionConfig from "atoms/sessionConfig";
import { useMemo } from "react";
import { Offcanvas } from "react-bootstrap";
import { isEmpty } from "lodash";

const InputContainer = styled.div`
  display: flex;
`;

const Input = styled.input``;

const Label = styled.label``;

function BodyTrackingPanel() {
  const [selected, setSelected] = useRecoilState(selectedEffect);
  const [sessionCfg, setSessionCfg] = useRecoilState(sessionConfig);

  const idxEffect = useMemo(() => {
    if (sessionCfg.effects) {
      return sessionCfg.effects.findIndex(
        (eff) => selected.key === eff.key && selected.bodyPart === eff.bodyPart
      );
    }
  }, [selected.bodyPart, selected.key, sessionCfg.effects]);
  // TODO: State setter out of selected element onInputChange

  const effect =
    idxEffect !== undefined ? sessionCfg.effects[idxEffect] : undefined;

  const onChangeScreen = (
    e: React.ChangeEvent<HTMLInputElement>,
    d: "a" | "b"
  ) => {
    const v = e.target.value;
    if (effect && idxEffect !== undefined) {
      const newEffects = sessionCfg.effects.map((eff, idx) =>
        idxEffect === idx
          ? {
              ...eff,
              screenRange: { ...eff.screenRange, [d]: Number(v) }
            }
          : eff
      );
      setSessionCfg({
        ...sessionCfg,
        effects: newEffects
      });
    }
  };

  const onChangeRange = (
    e: React.ChangeEvent<HTMLInputElement>,
    d: "x" | "y"
  ) => {
    const v = e.target.value;
    if (effect && idxEffect !== undefined) {
      const newEffects = sessionCfg.effects.map((eff, idx) =>
        idxEffect === idx
          ? {
              ...eff,
              valueRange: { ...eff.valueRange, [d]: Number(v) }
            }
          : eff
      );

      setSessionCfg({
        ...sessionCfg,
        effects: newEffects
      });
    }
  };

  return (
    <Offcanvas show={!isEmpty(selected)} onHide={() => setSelected({} as SelectedEffectType)} placement='end'>
    <Offcanvas.Header closeButton>
      <Offcanvas.Title>{selected.key}-{selected.bodyPart}</Offcanvas.Title>
    </Offcanvas.Header>
    <Offcanvas.Body>
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

export default BodyTrackingPanel;
