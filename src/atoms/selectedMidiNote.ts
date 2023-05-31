import { atom } from "recoil";

const selectedMidiNote = atom({
  key: "selectedMidiNote",
  default: null as number | null, // Midi Note number
});

export default selectedMidiNote;
