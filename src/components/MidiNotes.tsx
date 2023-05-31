import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import styled from "styled-components";
import { Container as FXContainer } from "./shared";
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
import ccMeterMap from "atoms/ccMeterMap";
import ADI from "localDB";
import { CCEffectType } from "config/midi";
import { DBEffect } from "localDB/effectConfig";
import selectedSession from "atoms/selectedSession";
import { DBSession } from "localDB/sessionConfig";
import storedSessions from "atoms/storedSessions";
import { User } from "context";
import Form from "react-bootstrap/Form";
import ConfirmationModal, {
  ConfirmationModalBaseProps,
} from "./ConfirmationModal";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import storedEffects from "atoms/storedEffects";
import accountInState from "atoms/account";
import muteMidi from "atoms/muteMidi";
import { Plus } from "react-bootstrap-icons";
// @ts-ignore
import { Piano, KeyboardShortcuts, MidiNumbers } from "react-piano";
import "react-piano/dist/styles.css";
import selectedMidiNote from "atoms/selectedMidiNote";

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

const PlusButton = styled(Plus)`
  cursor: pointer;
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

function MidiNotes() {
  const [selectedNote, setSelectedNote] = useRecoilState(selectedMidiNote);
  const [selectedSessionUid, setSelectedSessionUid] =
    useRecoilState(selectedSession);
  const [storedFx, setStoredFx] = useRecoilState(storedEffects); // TODO: Store this a key value pair instead of array
  const [storedSess, setStoredSess] = useRecoilState(storedSessions);
  const [modal, setModal] = useState<ConfirmationModalBaseProps | undefined>(
    undefined
  );

  const [tempFx, setTempFx] = useRecoilState(midiEffects); // FX Panel temporary state
  const inputOutputMap = useRecoilValue(ccMeterMap);
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
      setTempFx(displayStored);
    }
  }, [selectedSessionUid, setTempFx, storedFx, storedSess]);

  // TODO: Replace for NoteSender
  const ccSender = useMemo(
    () => (selectedOutput ? makeCCSender(selectedOutput) : undefined),
    [selectedOutput]
  );

  const firstNote = MidiNumbers.fromNote("c1");
  const lastNote = MidiNumbers.fromNote("f6");
  const keyboardShortcuts = KeyboardShortcuts.create({
    firstNote: firstNote,
    lastNote: lastNote,
    keyboardConfig: KeyboardShortcuts.HOME_ROW,
  });

  console.log("Keyboard shortcuts", KeyboardShortcuts);

  return (
    <Container>
      <UpperBar>
        <SubTitle>
          <Text>MIDI Notes</Text>
        </SubTitle>
        <ButtonContainer></ButtonContainer>
        <Piano
          noteRange={{ first: firstNote, last: lastNote }}
          playNote={(midiNumber: number) => {
            console.log("midiNumber", midiNumber);
            // Play a given note - see notes below
            setSelectedNote(midiNumber);
          }}
          stopNote={(midiNumber: number) => {
            // Stop playing a given note - see notes below
          }}
          width={700}
          keyboardShortcuts={keyboardShortcuts}
        />
      </UpperBar>
    </Container>
  );
}

export default MidiNotes;
