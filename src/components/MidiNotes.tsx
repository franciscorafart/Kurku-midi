import { useCallback, useContext, useMemo } from "react";
import styled from "styled-components";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import theme from "config/theme";
import {
  Text,
  SubTitle,
  EffectContainer,
  OptionsContainer,
  GearButton,
  CloseButton,
  Icons,
  EmptyEffectContainer,
  EffectBox,
  EffectData,
  ColumnContainer,
} from "./shared";
import accountInState from "atoms/account";
import { v4 } from "uuid";
import selectedMidiNote from "atoms/selectedMidiNote";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import { User } from "context";
import Tooltip from "react-bootstrap/Tooltip";
import { Plus } from "react-bootstrap-icons";
import midiNotes from "atoms/midiNotes";
import { defaultMidiNote } from "config/midi";
import dirtyAtom from "atoms/dirty";
import { Button } from "react-bootstrap";
import { makeNoteSender } from "utils/midiCtx";
import midiOutput from "atoms/selectedMidiOutput";
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

const PlusButton = styled(Plus)`
  cursor: pointer;
`;

const NotesContainer = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
`;

function MidiNotes() {
  const [selectedNoteValue, setSelectedNoteValue] =
    useRecoilState(selectedMidiNote);
  const userAccount = useRecoilValue(accountInState);
  const [tempMidiNotes, setTempMidiNotes] = useRecoilState(midiNotes);
  const isPaidUser = useContext(User);
  const setDirty = useSetRecoilState(dirtyAtom);
  const selectedOutput = useRecoilValue(midiOutput);

  const connected = useMemo(
    () => Boolean(userAccount.userId),
    [userAccount.userId]
  );
  const maxNotes = connected ? (isPaidUser ? 6 : 2) : 1;
  const emptyMidiSlotsCount = Math.max(
    0,
    maxNotes - Object.keys(tempMidiNotes).length
  );

  const onAddNote = useCallback(() => {
    const newNotes = { ...tempMidiNotes };
    const uid = v4();
    const existingNoteList = Object.values(newNotes).map((nn) => nn.note);
    const note = findAvailableCCorNote(existingNoteList);
    newNotes[uid] = { ...defaultMidiNote, uid, note };
    setTempMidiNotes(newNotes);
    setDirty(true);
  }, [setDirty, setTempMidiNotes, tempMidiNotes]);

  const noteSender = useMemo(
    () => (selectedOutput ? makeNoteSender(selectedOutput) : undefined),
    [selectedOutput]
  );

  const removeNote = useCallback(
    (uid: string) => {
      const newNotes = { ...tempMidiNotes };
      delete newNotes[uid];

      setTempMidiNotes(newNotes);
      setSelectedNoteValue(null);
    },
    [tempMidiNotes, setTempMidiNotes, setSelectedNoteValue]
  );

  return (
    <Container>
      <UpperBar>
        <SubTitle>
          <Text>MIDI Notes</Text>
        </SubTitle>
        <ButtonContainer>
          <div>
            <OverlayTrigger
              overlay={
                !isPaidUser ? (
                  <Tooltip>Add up to 6 Midi notes with paid tier</Tooltip>
                ) : (
                  <div />
                )
              }
            >
              <PlusButton
                color="white"
                size={32}
                onClick={emptyMidiSlotsCount > 0 ? onAddNote : undefined}
              />
            </OverlayTrigger>
          </div>
        </ButtonContainer>
      </UpperBar>
      <NotesContainer>
        {Object.entries(tempMidiNotes)
          .slice(0, maxNotes)
          .map(([_, tmn]) => (
            <EffectContainer
              key={`midi-note-${tmn.uid}`}
              selectable
              selected={tmn.uid === selectedNoteValue}
            >
              <OptionsContainer>
                <Button
                  size="sm"
                  variant="outline-light"
                  disabled={!noteSender}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (noteSender) {
                      noteSender(tmn.channel, true, tmn.note, 127);
                    }
                  }}
                  active={false}
                >
                  Map
                </Button>
                <Icons>
                  <GearButton onClick={() => setSelectedNoteValue(tmn.uid)} />
                  <CloseButton onClick={() => removeNote(tmn.uid)} />
                </Icons>
              </OptionsContainer>
              <EffectBox>
                <ColumnContainer>
                  <EffectData>{`Note: ${tmn.note}`}</EffectData>
                  <EffectData>{`Ch: ${tmn.channel}`}</EffectData>
                </ColumnContainer>
              </EffectBox>
            </EffectContainer>
          ))}
        {emptyMidiSlotsCount ? (
          Array(emptyMidiSlotsCount)
            .fill(null)
            .map((_, idx) => (
              <EmptyEffectContainer key={`empty-${idx}`}>
                Empty
              </EmptyEffectContainer>
            ))
        ) : (
          <></>
        )}
      </NotesContainer>
    </Container>
  );
}

export default MidiNotes;
