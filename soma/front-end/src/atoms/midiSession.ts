import { atom } from "recoil";
import { defaultMidiSession } from "config/midi";

const midiSession = atom({
  key: "midiSession",
  default: defaultMidiSession,
});

export default midiSession;
