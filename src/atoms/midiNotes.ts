import { atom } from "recoil";
import { defaultMidiNotes } from "config/midi";

const midiNotes = atom({
  key: "midiNotes",
  default: defaultMidiNotes,
});

export default midiNotes;
