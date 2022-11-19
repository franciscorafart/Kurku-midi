import { atom } from "recoil";
import { defaultMidiEffects } from "config/midi";

const midiEffects = atom({
  key: "midiEffects",
  default: defaultMidiEffects,
});

export default midiEffects;
