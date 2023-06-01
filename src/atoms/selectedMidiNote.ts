import { atom } from "recoil";

const selectedMidiNote = atom({
  key: "selectedMidiNote",
  default: null as string | null, // Midi Note uid
});

export default selectedMidiNote;
