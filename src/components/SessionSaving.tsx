import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import styled from "styled-components";
import midiEffects from "atoms/midiEffects";
import { Dropdown, DropdownButton, Button } from "react-bootstrap";
import { useRecoilState, useRecoilValue } from "recoil";

import theme from "config/theme";
import { Text, SubTitle, SubTitle2 } from "./shared";
import { v4 } from "uuid";
import { makeCCSender } from "utils/midiCtx";
import midiOutput from "atoms/selectedMidiOutput";
import ADI from "localDB";
import { CCEffectType } from "config/midi";
import { DBEffect } from "localDB/effectConfig";
import selectedSession from "atoms/selectedSession";
import { DBSession } from "localDB/sessionConfig";
import storedSessions from "atoms/storedSessions";
import { User } from "context";
import { defaultMidiCCs } from "config/midi";
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
  border-radius: 10px;
  gap: 20px;
`;

const UpperBar = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
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

const effectToDBEffect = (effect: CCEffectType, sessionId: string) => {
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
  } as CCEffectType;
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

function SessionSaving() {
  const [selectedSessionUid, setSelectedSessionUid] =
    useRecoilState(selectedSession);
  const [storedFx, setStoredFx] = useRecoilState(storedEffects); // TODO: Store this a key value pair instead of array
  const [storedSess, setStoredSess] = useRecoilState(storedSessions);
  const [modal, setModal] = useState<ConfirmationModalBaseProps | undefined>(
    undefined
  );

  const [tempCCs, setTempCCs] = useRecoilState(midiEffects); // FX Panel temporary state
  const isPaidUser = useContext(User);
  const [sessionName, setSessionName] = useState("");
  const [effectsToRemove, setEffectsToRemove] = useState<string[]>([]);
  const [dirty, setDirty] = useRecoilState(dirtyAtom);

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
      setTempCCs(displayStored);
    }
  }, [selectedSessionUid, setTempCCs, storedFx, storedSess]);

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

    // NOTE: Make sure logged users can only create 1 session, even if they
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

    let allEffects: DBEffect[] = [];
    let allSessions: DBSession[] = [];

    if (selectedSessionUid) {
      const initialSessionEffects = tempCCs
        .map((f) => f.uid)
        .concat(effectsToRemove);

      // concat tempCCs (dirty state) to the ones not in the session (original)
      allEffects = storedFx
        .filter((sEff) => !initialSessionEffects.includes(sEff.id))
        .concat(tempCCs.map((f) => effectToDBEffect(f, sessionId)));

      allSessions = storedSess
        .filter((s) => s.id !== sessionId) // all sessions minus selected one
        .concat(sessionToDBSessions(sessionId, sessionName)); // Rename
    } else {
      // New session
      allEffects = storedFx.concat(
        tempCCs.map((f) => effectToDBEffect(f, sessionId))
      );
      allSessions = [
        ...storedSess,
        sessionToDBSessions(sessionId, sessionName),
      ];
    }
    setStoredFx(allEffects);
    setStoredSess(allSessions);

    // IndexedDB update sessions
    ADI.cacheItem(
      sessionId,
      sessionToDBSessions(sessionId, sessionName),
      "sessions"
    );

    // IndexedDb update effects
    for (const f of allEffects) {
      ADI.cacheItem(f.id, f, "effects");
    }
    for (const uid of effectsToRemove) {
      ADI.removeItem(uid, "effects");
    }

    setSelectedSessionUid(sessionId);
    setDirty(false);
  }, [
    sessionName,
    isPaidUser,
    storedSess,
    selectedSessionUid,
    setStoredFx,
    setStoredSess,
    setSelectedSessionUid,
    tempCCs,
    effectsToRemove,
    storedFx,
  ]);

  const makeNewSession = useCallback(() => {
    setTempCCs(defaultMidiCCs);
    setSelectedSessionUid("");
    setSessionName("");
    setDirty(false);
    setModal(undefined);
    setEffectsToRemove([]);
  }, [setTempCCs, setSelectedSessionUid]);

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

  const deleteSession = useCallback(() => {
    if (selectedSessionUid) {
      const effectsAfterDelete = storedFx.filter(
        (sEff) => selectedSessionUid !== sEff.sessionId
      );

      const effectsToDelete = storedFx.filter(
        (sEff) => selectedSessionUid === sEff.sessionId
      );

      const sessionsAfterDelete = storedSess.filter(
        (s) => s.id !== selectedSessionUid
      );

      // Delete sessions and effects from indexedDB
      ADI.removeItem(selectedSessionUid, "sessions");
      for (const eff of effectsToDelete) {
        ADI.removeItem(eff.id, "effects");
      }

      setStoredFx(effectsAfterDelete);
      setStoredSess(sessionsAfterDelete);
      makeNewSession();
    }
  }, [
    makeNewSession,
    selectedSessionUid,
    setStoredFx,
    setStoredSess,
    storedFx,
    storedSess,
  ]);

  const handleDelete = () => {
    setModal({
      type: "deleteSession",
      title: "Confirm delete session",
      text: `Are you sure you want to delete ${sessionName}?`,
      onConfirm: deleteSession,
      onCancel: () => setModal(undefined),
    });
  };

  return (
    <Container>
      <UpperBar>
        <SubTitle2>
          <Text>Session Saving</Text>
        </SubTitle2>
        <ButtonContainer>
          <Form>
            <Form.Group>
              <Form.Control
                type="text"
                value={sessionName}
                onChange={onNameChange}
                placeholder="Session name"
                size="sm"
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
        </ButtonContainer>
        <ButtonContainer>
          <div>
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
                size="sm"
              >
                Save
              </Button>
            </OverlayTrigger>
          </div>
          <div>
            <Button variant="outline-light" onClick={newSession} size="sm">
              New Session
            </Button>
          </div>
          <div>
            <Button
              variant="outline-danger"
              disabled={!Boolean(selectedSessionUid)}
              onClick={handleDelete}
              size="sm"
            >
              Delete
            </Button>
          </div>
        </ButtonContainer>
      </UpperBar>
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

export default SessionSaving;
