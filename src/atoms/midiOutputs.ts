import { atom } from "recoil";
import { MidiOutputType } from "utils/types";

const midiOutputs = atom({
  key: "midiOutputs",
  default: [] as MidiOutputType[],
});

export default midiOutputs;
