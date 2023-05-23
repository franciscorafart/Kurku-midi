import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
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
import { defaultMidiEffects } from "config/midi";
import Form from "react-bootstrap/Form";
import ConfirmationModal, {
  ConfirmationModalBaseProps,
} from "./ConfirmationModal";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import storedEffects from "atoms/storedEffects";
import accountInState from "atoms/account";
import muteMidi from "atoms/muteMidi";
import dirtyAtom from "atoms/dirty";

const Container = styled.div`
  flex: 1;
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

const LastRowContainer = styled.div`
  display: flex;
  justify-content: flex-end;
`;

const ColumnContainer = styled.div`
  display: flex;
  flex-direction: column;
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

function SessionsDropdown({
  onSelectCallback,
  selectedSes,
  setSelectedSes,
  dirty,
  onDirtyCallback,
}: {
  dirty: boolean;
  onDirtyCallback: (id: string) => void;
  onSelectCallback: () => void;
  selectedSes: string;
  setSelectedSes: (id: string) => void;
}) {
  const options = useRecoilValue(storedSessions);
  const selectedOption = options?.find((o) => o.id === selectedSes);

  const onSelect = (e: keyof DBSession) => {
    const selected = options?.find((o) => o.id === e);
    if (dirty) {
      onDirtyCallback(selected?.id ?? "");
    } else {
      setSelectedSes(selected?.id ?? "");
      onSelectCallback();
    }
  };
  // TODO: Implement delete button and confirm modal for sessions
  return (
    <>
      <DropdownButton
        variant="outline-light"
        title={
          selectedOption ? `Session: ${selectedOption.name}` : "Select Session"
        }
        onSelect={(e) => onSelect(e as keyof DBSession)}
        disabled={!options.length}
        size="sm"
      >
        {options.map((o) => (
          <Dropdown.Item key={o.id} eventKey={o.id}>
            {o.name}
          </Dropdown.Item>
        ))}
      </DropdownButton>
    </>
  );
}

function MidiFXPanel() {
  const [selectedUid, setSelectedUid] = useRecoilState(selectedMidiEffect);
  const [selectedSessionUid, setSelectedSessionUid] =
    useRecoilState(selectedSession);
  const [storedFx, setStoredFx] = useRecoilState(storedEffects); // TODO: Store this a key value pair instead of array
  const [storedSess, setStoredSess] = useRecoilState(storedSessions);
  const [modal, setModal] = useState<ConfirmationModalBaseProps | undefined>(
    undefined
  );

  const [tempFx, setTempFx] = useRecoilState(midiEffects); // FX Panel temporary state
  const inputOutputMap = useRecoilValue(valueMap);
  const [dirty, setDirty] = useRecoilState(dirtyAtom);
  const isPaidUser = useContext(User);
  const [sessionName, setSessionName] = useState("");
  const [effectsToRemove, setEffectsToRemove] = useState<string[]>([]);

  const selectedOutput = useRecoilValue(midiOutput);
  const [muted, setMuted] = useRecoilState(muteMidi);
  const userAccount = useRecoilValue(accountInState);

  const connected = useMemo(
    () => Boolean(userAccount.userId),
    [userAccount.userId]
  );

  useEffect(() => {
    if (selectedSessionUid) {
      const displayStored = storedFx
        .filter((sEff) => sEff.sessionId === selectedSessionUid)
        .map((sEff) => dbEffectToEffect(sEff));

      const sess = storedSess.find((ss) => ss.id === selectedSessionUid);

      setSessionName(sess?.name || "");
      setTempFx(displayStored);
    }
  }, [selectedSessionUid, setTempFx, storedFx, storedSess]);

  const handleUserKeyPress = (event: KeyboardEvent) => {
    const { code, target } = event;
    // @ts-ignore
    if (code === "Space" && target?.localName !== "input") {
      setMuted(!muted);
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleUserKeyPress);

    return () => {
      window.removeEventListener("keydown", handleUserKeyPress);
    };
  });

  const handleDisconnect = useCallback(
    (uid: string) => {
      const idxOfRemove = tempFx.findIndex((msc) => msc.uid === uid);
      const elementToRemove = tempFx.find((msc) => msc.uid === uid);
      const newMidiFx = [...tempFx];

      if (idxOfRemove !== undefined && elementToRemove !== undefined) {
        newMidiFx.splice(idxOfRemove, 1);
        setTempFx(newMidiFx);
        setEffectsToRemove([...effectsToRemove, elementToRemove.uid]);
        setDirty(true);
      }
    },
    [effectsToRemove, tempFx, setTempFx]
  );
  const maxFx = connected ? (isPaidUser ? 8 : 3) : 1;
  const emptyFxCount = maxFx - tempFx.length;

  const onAddEffect = useCallback(() => {
    const newMidiFx = [...tempFx];
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

    setTempFx(newMidiFx);
    setDirty(true);
  }, [tempFx, setTempFx]);

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
                  <Tooltip>Add up to 8 CCs with paid tier</Tooltip>
                ) : (
                  <div />
                )
              }
            >
              <Button
                variant="outline-light"
                onClick={emptyFxCount > 0 ? onAddEffect : undefined}
                size="sm"
              >
                Add CC
              </Button>
            </OverlayTrigger>
          </div>
        </ButtonContainer>
      </UpperBar>
      <StlFXContainer>
        {tempFx.map((mEff) => (
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
                    {mEff.direction === "x" ? "Horizontal" : "Vertical"}
                    <br></br>
                  </EffectData>
                </ColumnItem>
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
              </ColumnContainer>
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
      {modal && (
        <ConfirmationModal
          show={!!modal}
          type={modal.type}
          text={modal.text}
          title={modal.title}
          onConfirm={modal.onConfirm}
          onCancel={modal.onCancel}
        />
      )}
    </Container>
  );
}

export default MidiFXPanel;
