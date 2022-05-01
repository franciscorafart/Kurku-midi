import styled from "styled-components";
import { useRecoilValue, useRecoilState } from "recoil";
import selectedEffect from "atoms/selectedEffect";
import sessionConfig from "atoms/sessionConfig";
import { useMemo } from "react";
import { effectConfigType } from "~/utils/configUtils";

const Container = styled.div`
  width: 25%;
  // background-color: gray;
`;

const InputContainer = styled.div`
  display: flex;
`;

const Input = styled.input``;

const Title = styled.h2``;

const Label = styled.label``;

function BodyTrackingPanel() {
  const selected = useRecoilValue(selectedEffect);
  const [sessionCfg, setSessionCfg] = useRecoilState(sessionConfig);

  const idxEffect = useMemo(() => {
    if (sessionCfg.effects) {
      return sessionCfg.effects.findIndex(
        (eff) => selected.key === eff.key && selected.bodyPart === eff.bodyPart
      );
    }
  }, [selected]);
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
    <Container>
      <Title>
        {selected.key}-{selected.bodyPart}
      </Title>
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

export default BodyTrackingPanel;
