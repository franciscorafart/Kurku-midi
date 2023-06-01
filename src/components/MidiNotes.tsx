import React, { useMemo } from "react";
import styled from "styled-components";
import { useRecoilState, useRecoilValue } from "recoil";
import theme from "config/theme";
import { Text, SubTitle } from "./shared";
import accountInState from "atoms/account";
// @ts-ignore
import { Piano, MidiNumbers } from "react-piano";
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

function MidiNotes() {
  const [selectedNote, setSelectedNote] = useRecoilState(selectedMidiNote);
  const userAccount = useRecoilValue(accountInState);

  const connected = useMemo(
    () => Boolean(userAccount.userId),
    [userAccount.userId]
  );

  const firstNote = MidiNumbers.fromNote("c1");
  const lastNote = MidiNumbers.fromNote("f6");
  // console.log("Keyboard shortcuts", KeyboardShortcuts);

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
            console.log("stop note", midiNumber);
            // Stop playing a given note - see notes below
          }}
          width={700}
          // activeNotes={[62]}
          disabled={Boolean(selectedNote)}
          // keyboardShortcuts={keyboardShortcuts}
        />
      </UpperBar>
    </Container>
  );
}

export default MidiNotes;
