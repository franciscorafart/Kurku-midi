import { atom } from "recoil";
import { DBMidiNote } from "localDB/midiNoteConfig";

const storedMidiNotes = atom({
  key: "storedMidiNotes",
  default: [] as DBMidiNote[],
});

export default storedMidiNotes;
