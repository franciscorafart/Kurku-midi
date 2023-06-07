import { useCallback, useContext, useMemo } from "react";
import styled from "styled-components";
import {
  Container as FXContainer,
  EffectContainer,
  EffectBox,
  OptionsContainer,
  EmptyEffectContainer,
  EffectData,
  CloseButton,
  GearButton,
  Icons,
  PlusButton,
  ColumnContainer,
  ColumnItem,
} from "./shared";
import midiEffects from "atoms/midiEffects";
import { Button } from "react-bootstrap";
import { useRecoilState, useRecoilValue } from "recoil";
import selectedMidiEffect from "atoms/selectedMidiEffect";
import theme from "config/theme";
import { Text, SubTitle } from "./shared";
import { v4 } from "uuid";
import { makeCCSender } from "utils/midiCtx";
import midiOutput from "atoms/selectedMidiOutput";
import MidiMeter from "./MidiMeter";
import ccMeterMap from "atoms/ccMeterMap";
import { User } from "context";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import accountInState from "atoms/account";
import dirtyAtom from "atoms/dirty";
import { findAvailableCCorNote } from "utils/midiUtils";

const Container = styled.div`
  flex: 6;
  display: flex;
  flex-direction: column;
  background-color: ${theme.background2};
  padding: 20px;
  border-radius: 10px;
  gap: 20px;
`;

const UpperBar = styled.div`
  display: flex;
  flex-direction: column;
`;

const StlFXContainer = styled(FXContainer)`
  gap: 10px;
`;

const RowItem = styled(ColumnItem)`
  flex-direction: row;
`;

const ButtonContainer = styled(RowItem)`
  gap: 10px;
`;

const firstUpperCase = (t: string) =>
  t[0].toLocaleUpperCase().concat(t.slice(1));

function MidiCC() {
  const [selectedUid, setSelectedUid] = useRecoilState(selectedMidiEffect);
  const [tempCCs, setTempCCs] = useRecoilState(midiEffects); // FX Panel temporary state
  const inputOutputMap = useRecoilValue(ccMeterMap);
  const [dirty, setDirty] = useRecoilState(dirtyAtom);
  const isPaidUser = useContext(User);

  const selectedOutput = useRecoilValue(midiOutput);
  const userAccount = useRecoilValue(accountInState);

  const connected = useMemo(
    () => Boolean(userAccount.userId),
    [userAccount.userId]
  );

  const handleDisconnect = useCallback(
    (uid: string) => {
      const idxOfRemove = tempCCs.findIndex((msc) => msc.uid === uid);
      const newMidiFx = [...tempCCs];

      if (idxOfRemove !== undefined) {
        newMidiFx.splice(idxOfRemove, 1);
        setTempCCs(newMidiFx);
        setDirty(true);
      }
    },
    [tempCCs, setTempCCs, setDirty]
  );

  const maxFx = connected ? (isPaidUser ? 6 : 3) : 1;
  const emptyFxCount = maxFx - tempCCs.length;

  const onAddEffect = useCallback(() => {
    const newMidiFx = [...tempCCs];
    const ccList = newMidiFx.map((m) => m.controller);
    const cc = findAvailableCCorNote(ccList);

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

    setTempCCs(newMidiFx);
    setDirty(true);
  }, [tempCCs, setTempCCs, setDirty]);

  const ccSender = useMemo(
    () => (selectedOutput ? makeCCSender(selectedOutput) : undefined),
    [selectedOutput]
  );

  return (
    <Container>
      <UpperBar>
        <SubTitle>
          <Text>MIDI CC</Text>
        </SubTitle>
        <ButtonContainer>
          <div>
            <OverlayTrigger
              overlay={
                !isPaidUser ? (
                  <Tooltip>Add up to 6 CCs with paid tier</Tooltip>
                ) : (
                  <div />
                )
              }
            >
              <PlusButton
                color="white"
                size={32}
                onClick={emptyFxCount > 0 ? onAddEffect : undefined}
              />
            </OverlayTrigger>
          </div>
        </ButtonContainer>
      </UpperBar>
      <StlFXContainer>
        {tempCCs.map((mEff) => (
          <EffectContainer
            key={`midi-effect-${mEff.controller}`}
            selectable
            selected={mEff.uid === selectedUid}
          >
            <OptionsContainer>
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
              <Icons>
                <GearButton onClick={() => setSelectedUid(mEff.uid)} />
                <CloseButton onClick={() => handleDisconnect(mEff.uid)} />
              </Icons>
            </OptionsContainer>
            <EffectBox key={`${mEff.controller}-${mEff.bodyPart}`}>
              {" "}
              <ColumnContainer>
                <ColumnItem>
                  <EffectData>{firstUpperCase(mEff.bodyPart)}</EffectData>
                  <EffectData>CC: {mEff.controller}</EffectData>
                  <EffectData>Ch: {mEff.channel}</EffectData>
                  <EffectData>
                    {mEff.direction === "x" ? "Horizontal" : "Vertical"}
                    <br></br>
                  </EffectData>
                </ColumnItem>
              </ColumnContainer>
              <RowItem>
                <MidiMeter
                  variant="input"
                  value={inputOutputMap[mEff.uid]?.input || 0}
                />
                <MidiMeter
                  base={127}
                  value={inputOutputMap[mEff.uid]?.output || 0}
                  variant="output"
                  cap
                />
              </RowItem>
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

export default MidiCC;
