import { useCallback, useContext, useMemo } from "react";
import styled from "styled-components";
import { useRecoilState, useRecoilValue } from "recoil";
import theme from "config/theme";
import { Text, SubTitle } from "./shared";
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

const NoteContainer = styled.div`
  border: 1px dashed white;
  padding: 8px;
  color: white;
`;

function MidiNotes() {
  const [selectedNote, setSelectedNote] = useRecoilState(selectedMidiNote);
  const userAccount = useRecoilValue(accountInState);
  const [tempMidiNotes, setTempMidiNotes] = useRecoilState(midiNotes);
  const isPaidUser = useContext(User);
  const [dirty, setDirty] = useRecoilState(dirtyAtom);

  const connected = useMemo(
    () => Boolean(userAccount.userId),
    [userAccount.userId]
  );
  const maxNotes = connected ? (isPaidUser ? 8 : 2) : 1;
  const emptyFxCount = maxNotes - Object.keys(tempMidiNotes).length;
  // console.log("Keyboard shortcuts", KeyboardShortcuts);
  const onAddNote = useCallback(() => {
    const newNotes = { ...tempMidiNotes };
    const uid = v4();

    newNotes[uid] = { ...defaultMidiNote, uid };
    setTempMidiNotes(newNotes);
    setDirty(true);
  }, [setTempMidiNotes, tempMidiNotes]);

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
                  <Tooltip>Add up to 8 CCs with paid tier</Tooltip>
                ) : (
                  <div />
                )
              }
            >
              <PlusButton
                color="white"
                size={32}
                onClick={emptyFxCount > 0 ? onAddNote : undefined}
              />
            </OverlayTrigger>
          </div>
        </ButtonContainer>
        {Object.entries(tempMidiNotes).map(([_, tmn]) => (
          <NoteContainer
            key={`midi-note-${tmn.uid}`}
            onClick={() => setSelectedNote(tmn.uid)}
          >{`uid: ${tmn.uid} Note: ${tmn.note}`}</NoteContainer>
        ))}
        {/* <Piano
          noteRange={{ first: firstNote, last: lastNote }}
          playNote={(midiNumber: number) => {
            console.log("midiNumber", midiNumber);
            // Play a given note - see notes below
            setSelectedNote(midiNumber);
          }}
          stopNote={(midiNumber: number) => {
            console.log("stop note", midiNumber);
            // Stop playing a given note - see notes below
          }}
          width={700}
          // activeNotes={[62]}
          disabled={Boolean(selectedNote)}
          // keyboardShortcuts={keyboardShortcuts}
        /> */}
      </UpperBar>
    </Container>
  );
}

export default MidiNotes;
