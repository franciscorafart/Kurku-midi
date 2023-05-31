import { atom } from "recoil";
import { defaultMidiCCs } from "config/midi";

const midiEffects = atom({
  key: "midiEffects",
  default: defaultMidiCCs,
});

export default midiEffects;
