import { atom } from "recoil";
import { MidiOutputType } from "utils/types";

const midiOutput = atom({
  key: "midiOutput",
  default: undefined as MidiOutputType | undefined,
});

export default midiOutput;
