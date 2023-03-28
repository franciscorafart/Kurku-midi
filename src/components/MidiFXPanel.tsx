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
import {
  Dropdown,
  DropdownButton,
  Button,
  ToggleButton,
} from "react-bootstrap";
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
        size="lg"
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

  const [fx, setFx] = useRecoilState(midiEffects);
  const inputOutputMap = useRecoilValue(valueMap);
  const isPaidUser = useContext(User);
  const [sessionName, setSessionName] = useState("");
  const [effectsToRemove, setEffectsToRemove] = useState<string[]>([]);
  const [dirty, setDirty] = useState(false);
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
      setFx(displayStored);
    }
  }, [selectedSessionUid, setFx, storedFx, storedSess]);

  const handleUserKeyPress = (event: KeyboardEvent) => {
    const { code } = event;
    if (code === "Space") {
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
      const idxOfRemove = fx.findIndex((msc) => msc.uid === uid);
      const elementToRemove = fx.find((msc) => msc.uid === uid);
      const newMidiFx = [...fx];

      if (idxOfRemove !== undefined && elementToRemove !== undefined) {
        newMidiFx.splice(idxOfRemove, 1);
        setFx(newMidiFx);
        setEffectsToRemove([...effectsToRemove, elementToRemove.uid]);
        setDirty(true);
      }
    },
    [effectsToRemove, fx, setFx]
  );
  const maxFx = connected ? (isPaidUser ? 8 : 3) : 1;
  const emptyFxCount = maxFx - fx.length;

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
    setDirty(true);
  }, [fx, setFx]);

  const ccSender = useMemo(
    () => (selectedOutput ? makeCCSender(selectedOutput) : undefined),
    [selectedOutput]
  );

  const onSaveSession = useCallback(async () => {
    if (!sessionName) {
      setModal({
        type: "sessionName",
        title: "Set session name",
        text: "Your session needs a name!",
        onCancel: () => setModal(undefined),
      });
      return;
    }

    // NOTE: MAke sure logged users can only create 1 session, even if they
    // are downgraded from paid to logged. They just keep the ones they had.
    if (!isPaidUser && storedSess.length >= 1 && !selectedSessionUid) {
      setModal({
        type: "sessionName",
        title: "Get paid tier",
        text: "You need a paid tier to save more than one session",
        onCancel: () => setModal(undefined),
      });

      return;
    }

    const sessionId = selectedSessionUid || v4();

    ADI.cacheItem(
      sessionId,
      sessionToDBSessions(sessionId, sessionName),
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
    if (selectedSessionUid) {
      // Overwrite effects
      const existingFXIds = fx.map((f) => f.uid).concat(effectsToRemove);
      setStoredFx(
        storedFx
          .filter((sEff) => !existingFXIds.includes(sEff.id))
          .concat(fx.map((f) => effectToDBEffect(f, sessionId)))
      );

      setStoredSess(
        storedSess
          .filter((s) => s.id !== sessionId)
          .concat(sessionToDBSessions(sessionId, sessionName))
      );
    } else {
      // new effect
      setStoredFx(
        storedFx.concat(fx.map((f) => effectToDBEffect(f, sessionId)))
      );

      setStoredSess([
        ...storedSess,
        sessionToDBSessions(sessionId, sessionName),
      ]);
    }

    setDirty(false);
  }, [
    sessionName,
    isPaidUser,
    storedSess,
    selectedSessionUid,
    fx,
    effectsToRemove,
    setStoredFx,
    storedFx,
    setStoredSess,
  ]);

  const makeNewSession = useCallback(() => {
    setFx(defaultMidiEffects);
    setSelectedSessionUid("");
    setSessionName("");
    setDirty(false);
    setModal(undefined);
    setEffectsToRemove([]);
  }, [setFx, setSelectedSessionUid]);

  const newSession = useCallback(() => {
    if (dirty) {
      setModal({
        type: "newSession",
        title: "Confirm new session",
        text: `Make new session without saving ${sessionName}?`,
        onConfirm: makeNewSession,
        onCancel: () => setModal(undefined),
      });
    } else {
      makeNewSession();
    }
  }, [dirty, makeNewSession, sessionName]);

  const onNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setSessionName(v);
    setDirty(true);
  };

  return (
    <Container>
      <UpperBar>
        <SubTitle>
          <Text>MIDI FX panel</Text>
        </SubTitle>
        <ButtonContainer>
          <Form>
            <Form.Group>
              <Form.Control
                type="text"
                value={sessionName}
                onChange={onNameChange}
                placeholder="Session name"
              />
            </Form.Group>
          </Form>
          {connected && (
            <SessionsDropdown
              dirty={dirty}
              selectedSes={selectedSessionUid}
              setSelectedSes={setSelectedSessionUid}
              onDirtyCallback={(id: string) => {
                setModal({
                  type: "selectSession",
                  text: `Select session without saving ${sessionName}`,
                  title: "Select session",
                  onConfirm: () => {
                    setSelectedSessionUid(id);
                    setEffectsToRemove([]);
                    setDirty(false);
                    setModal(undefined);
                  },
                  onCancel: () => setModal(undefined),
                });
              }}
              onSelectCallback={() => {
                setEffectsToRemove([]);
                setDirty(false);
                setModal(undefined);
              }}
            />
          )}
          <OverlayTrigger
            overlay={
              !isPaidUser ? (
                <Tooltip>Save more sessions on paid tier</Tooltip>
              ) : (
                <div />
              )
            }
          >
            <Button
              variant={dirty ? "outline-warning" : "outline-light"}
              onClick={connected ? onSaveSession : undefined}
              // disabled={!isPaidUser}
              size="lg"
            >
              Save
            </Button>
          </OverlayTrigger>
          <OverlayTrigger
            overlay={
              !isPaidUser ? (
                <Tooltip>Add up to 8 effects with paid tier</Tooltip>
              ) : (
                <div />
              )
            }
          >
            <Button
              variant="outline-light"
              onClick={emptyFxCount > 0 ? onAddEffect : undefined}
              // disabled={emptyFxCount <= 0}
              size="lg"
            >
              Add Effect
            </Button>
          </OverlayTrigger>
          <Button variant="outline-light" onClick={newSession} size="lg">
            New Session
          </Button>
          <OverlayTrigger
            overlay={
              !isPaidUser ? (
                <Tooltip>Mute MIDI with paid tier</Tooltip>
              ) : (
                <div />
              )
            }
          >
            <ToggleButton
              size="lg"
              variant="outline-light"
              disabled={!ccSender}
              onClick={
                isPaidUser
                  ? (e) => {
                      e.stopPropagation();
                      setMuted(!muted);
                    }
                  : undefined
              }
              value={1}
              active={muted}
            >
              Mute
            </ToggleButton>
          </OverlayTrigger>
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
                    {mEff.direction === "x" ? "Horizontal" : "Vertical"}
                    <br></br>
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
