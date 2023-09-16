import { atom } from "recoil";
import { MidiNoteOnOffMap } from "utils/types";

const noteOnOffMap = atom({
  key: "noteOnOffMap",
  default: {} as MidiNoteOnOffMap,
});

export default noteOnOffMap;
