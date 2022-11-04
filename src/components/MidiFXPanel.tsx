import { useCallback, useContext, useEffect, useMemo } from "react";
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
import { Dropdown, DropdownButton, Button } from "react-bootstrap";
import { useRecoilState, useRecoilValue } from "recoil";
import selectedMidiEffect from "atoms/selectedMidiEffect";
import CloseButton from "react-bootstrap/CloseButton";
import theme from "config/theme";
import { Text, SubTitle } from "./shared";
import { v4 } from "uuid";
import { makeCCSender } from "utils/midiCtx";
import midiOutput from "atoms/selectedMidiOutput";
import MidiMeter from "./MidiMeter";
import valueMap from "atoms/valueMap";
import ADI from "localDB";
import { MidiEffectType } from "~/config/midi";
import { DBEffect } from "localDB/effectConfig";
import selectedSession from "atoms/selectedSession";
import { DBSession } from "localDB/sessionConfig";
import storedSessions from "atoms/storedSessions";
import { User } from "context";
import storedEffects from "atoms/storedEffects";
import { defaultMidiEffects } from "config/midi";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  background-color: ${theme.background2};
  padding: 20px;
  border-radius: 0 0 10px 10px;
  gap: 20px;
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

const ColumnContainer = styled.div`
  display: flex;
  justify-content: space-between;
`;

const ColumnItem = styled.div`
  display: flex;
  flex-direction: column;
`;
const ColumnItem2 = styled(ColumnItem)`
  flex-direction: row;
`;

const ButtonContainer = styled(ColumnItem2)`
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

const MAX_FX = 5;

const effectToDBEffect = (effect: MidiEffectType, sessionId: string) => {
  return {
    id: effect.uid,
    sessionId: sessionId,
    cc: effect.controller,
    bodyPart: effect.bodyPart,
    direction: effect.direction === "y" ? "vertical" : "horizontal",
    inputFrom: effect.screenRange.a,
    inputTo: effect.screenRange.b,
    outputFrom: effect.valueRange.x,
    outputTo: effect.valueRange.y,
  } as DBEffect;
};

const dbEffectToEffect = (effect: DBEffect) => {
  return {
    uid: effect.id,
    sessionId: effect.sessionId,
    controller: effect.cc,
    bodyPart: effect.bodyPart,
    direction: effect.direction === "vertical" ? "y" : "x",
    screenRange: {
      a: effect.inputFrom,
      b: effect.inputTo,
    },
    valueRange: {
      x: effect.outputFrom,
      y: effect.outputTo,
    },
  } as MidiEffectType;
};
const sessionToDBSessions = (id: string, name: string) => {
  return {
    id,
    name,
  };
};

function SessionsDropdown() {
  const options = useRecoilValue(storedSessions);
  const [selectedSes, setSelectedSes] = useRecoilState(selectedSession);
  const selectedOption = options?.find((o) => o.id === selectedSes);

  const onSelect = (e: keyof DBSession) => {
    const selected = options?.find((o) => o.id === e);
    setSelectedSes(selected?.id ?? "");
  };

  return (
    <DropdownButton
      variant="outline-light"
      title={
        selectedOption ? `Session: ${selectedOption.name}` : "Select Session"
      }
      onSelect={(e) => onSelect(e as keyof DBSession)}
      size="lg"
    >
      {options.map((o) => (
        <Dropdown.Item key={o.id} eventKey={o.id}>
          {o.name}
        </Dropdown.Item>
      ))}
    </DropdownButton>
  );
}

function MidiFXPanel() {
  const [selectedUid, setSelectedUid] = useRecoilState(selectedMidiEffect);
  const [selectedSessionUid, setSelectedSessionUid] =
    useRecoilState(selectedSession);
  const [storedFx, setStoredFx] = useRecoilState(storedEffects);

  const [fx, setFx] = useRecoilState(midiEffects);
  const inputOutputMap = useRecoilValue(valueMap);
  const isPaidUser = useContext(User);

  useEffect(() => {
    if (selectedSessionUid) {
      const displayStored = storedFx
        .filter((sEff) => sEff.sessionId === selectedSessionUid)
        .map((sEff) => dbEffectToEffect(sEff));
      setFx(displayStored);
    }
  }, [selectedSessionUid, setFx, storedFx]);

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

  const onSaveSession = useCallback(async () => {
    const sessionId = selectedSessionUid || v4();

    ADI.cacheItem(
      sessionId,
      sessionToDBSessions(sessionId, "tempName"), // TODO: Figure out way to modify session name
      "sessions"
    );

    for (const f of fx) {
      ADI.cacheItem(
        f.uid.toString(),
        effectToDBEffect(f, sessionId),
        "effects"
      );
    }

    // Update local state
    setStoredFx(storedFx.concat(fx.map((f) => effectToDBEffect(f, sessionId))));
  }, [fx, selectedSessionUid, setStoredFx, storedFx]);

  const newSession = () => {
    setFx(defaultMidiEffects);
    setSelectedSessionUid("");
  };

  return (
    <Container>
      <UpperBar>
        <SubTitle>
          <Text>MIDI FX panel</Text>
        </SubTitle>
        <ButtonContainer>
          <Button variant="outline-light" onClick={newSession} size="lg">
            New Session
          </Button>
          {isPaidUser && <SessionsDropdown />}
          <Button
            variant="outline-light"
            onClick={onSaveSession}
            disabled={!isPaidUser}
            size="lg"
          >
            Save
          </Button>
          <Button
            variant="outline-light"
            onClick={onAddEffect}
            disabled={emptyFxCount <= 0}
            size="lg"
          >
            Add Effect
          </Button>
        </ButtonContainer>
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
              {" "}
              <ColumnContainer>
                <ColumnItem>
                  <EffectData>{firstUpperCase(mEff.bodyPart)}</EffectData>
                  <EffectData>CC: {mEff.controller}</EffectData>
                  <EffectData>
                    {mEff.direction.toUpperCase()} Axis <br></br>
                  </EffectData>
                </ColumnItem>
                <ColumnItem2>
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
                </ColumnItem2>
              </ColumnContainer>
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
                {/* <ToggleButton
                  size="sm"
                  variant="outline-light"
                  disabled={!ccSender}
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  value={1}
                  active={false}
                >
                  Mute
                </ToggleButton> */}
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
