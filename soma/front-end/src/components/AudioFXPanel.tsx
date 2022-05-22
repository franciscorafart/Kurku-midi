import styled from "styled-components";
import sessionConfig from "atoms/sessionConfig";
import { useRecoilValue, useRecoilState } from "recoil";
import selectedEffect from "atoms/selectedEffect";
import { KeyedEffectType } from "utils/types";

const Container = styled.div`
  display: flex;
  flex: wrap;
  padding: 20px;
  min-height: 300px;
  border: 1px solid black;
`;

const EffectConnect = styled.div`
  display: flex;
`;

const EffectContainer = styled.div<{ selected?: boolean; selectable: boolean }>`
  display: flex;
  flex-direction: column;
  height: 86px;
  width: 160px;
  padding: 5px;
  border: 1px solid
    ${({ selected, selectable }) =>
      selectable ? (selected ? "red" : "blue") : "purple"};
  border-radius: 5px;
`;

const CloseX = styled.div`
  height: 16px;
  width: 10px;
  cursor: pointer;
  align-self: flex-end;
  &:hover {
    color: red;
  }
`;

const EffectBox = styled.div<{ selectable?: boolean }>`
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: ${({ selectable }) => (selectable ? "pointer" : "auto")};
`;

const Cable = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 80px;
  width: 40px;
`;

function AudioFXPanel({ audioFXs }: { audioFXs: KeyedEffectType }) {
  const sessionCfg = useRecoilValue(sessionConfig);
  const [selected, setSelected] = useRecoilState(selectedEffect);

  console.log("sessionCfg", sessionCfg);

  const handleDisconnect = () => {
    // Get AudioFx node with selected key, previous and next
    // Trigger disconnect
    // Update state
  };

  return (
    <Container>
      <EffectContainer selectable={false}>
        <EffectBox>Source</EffectBox>
      </EffectContainer>
      <Cable>{`==>`}</Cable>
      {sessionCfg.effects.map((eff) => (
        <EffectConnect key={eff.key}>
          <EffectContainer
            selectable
            selected={
              eff.key === selected.key && eff.bodyPart === selected.bodyPart
            }
          >
            <CloseX onClick={handleDisconnect}>X</CloseX>
            <EffectBox
              onClick={() =>
                setSelected({ key: eff.key, bodyPart: eff.bodyPart })
              }
              key={`${eff.key}-${eff.bodyPart}`}
              selectable
            >
              {eff.key}-{eff.bodyPart}
            </EffectBox>
          </EffectContainer>
          <Cable>{`==>`}</Cable>
        </EffectConnect>
      ))}
      <EffectContainer selectable={false}>
        <EffectBox>Master</EffectBox>
      </EffectContainer>
    </Container>
  );
}

export default AudioFXPanel;
