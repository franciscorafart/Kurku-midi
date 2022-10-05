import { useCallback, useMemo } from "react";
import styled from "styled-components";
import {
  Container as FXContainer,
  EffectContainer,
  EffectBox,
  CloseContainer,
  EmptyEffectContainer,
  EffectData,
} from "./shared";
import midiEffects from "atoms/midiEffects";
import { useRecoilState, useRecoilValue } from "recoil";
import selectedMidiEffect from "atoms/selectedMidiEffect";
import CloseButton from "react-bootstrap/CloseButton";
import Button from "react-bootstrap/Button";
import theme from "config/theme";
import { Text, SubTitle } from "./shared";
// @ts-ignore
import { v4 } from "uuid";
import { makeCCSender } from "utils/midiCtx";
import midiOutput from "atoms/selectedMidiOutput";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  background-color: ${theme.background2};
  padding: 20px;
  border-radius: 0 0 10px 10px;
`;

const UpperBar = styled.div`
  display: flex;
  justify-content: space-between;
`;

const StlFXContainer = styled(FXContainer)`
  gap: 10px;
`;

const LastRowContainer = styled.div`
  display: flex;
  justify-content: flex-end;
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

const MAX_FX = 5;

function MidiFXPanel() {
  const [selectedUid, setSelectedUid] = useRecoilState(selectedMidiEffect);
  const [fx, setFx] = useRecoilState(midiEffects);
  const handleDisconnect = useCallback(
    (uid: string) => {
      const idxOfRemove = fx.findIndex((msc) => msc.uid === uid);
      const newMidiFx = [...fx];

      if (idxOfRemove !== undefined) {
        newMidiFx.splice(idxOfRemove, 1);
        setFx(newMidiFx);
      }
    },
    [fx, setFx]
  );

  const emptyFxCount = MAX_FX - fx.length;

  const onAddEffect = useCallback(() => {
    const newMidiFx = [...fx];
    const ccList = newMidiFx.map((m) => m.controller);
    const cc = findCC(ccList);

    newMidiFx.push({
      uid: v4(),
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

    setFx(newMidiFx);
  }, [fx, setFx]);

  const selectedOutput = useRecoilValue(midiOutput);

  const ccSender = useMemo(
    () => (selectedOutput ? makeCCSender(selectedOutput) : undefined),
    [selectedOutput]
  );

  return (
    <Container>
      <UpperBar>
        <SubTitle>
          <Text>MIDI FX panel</Text>
        </SubTitle>
        <Button
          variant="outline-light"
          onClick={onAddEffect}
          disabled={emptyFxCount <= 0}
        >
          Add Effect
        </Button>
      </UpperBar>
      <StlFXContainer>
        {fx.map((mEff) => (
          <EffectContainer
            key={`midi-effect-${mEff.controller}`}
            selectable
            selected={mEff.uid === selectedUid}
          >
            <CloseContainer>
              <CloseButton onClick={() => handleDisconnect(mEff.uid)} />
            </CloseContainer>
            <EffectBox
              onClick={() => setSelectedUid(mEff.uid)}
              key={`${mEff.controller}-${mEff.bodyPart}`}
              selectable
            >
              <EffectData>{firstUpperCase(mEff.bodyPart)}</EffectData>
              <EffectData>CC: {mEff.controller}</EffectData>
              <EffectData>
                {mEff.direction.toUpperCase()} Axis <br></br>
              </EffectData>
              <LastRowContainer>
                <Button
                  size="sm"
                  variant="outline-light"
                  disabled={!ccSender}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (ccSender) {
                      ccSender(mEff.channel, mEff.controller, 127);
                    }
                  }}
                  active={false}
                >
                  Map
                </Button>
              </LastRowContainer>
            </EffectBox>
          </EffectContainer>
        ))}
        {Array(emptyFxCount)
          .fill(null)
          .map((_, idx) => (
            <EmptyEffectContainer key={`empty-${idx}`}>
              Empty
            </EmptyEffectContainer>
          ))}
      </StlFXContainer>
    </Container>
  );
}

export default MidiFXPanel;
