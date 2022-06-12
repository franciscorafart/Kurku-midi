import { atom } from "recoil";

const selectedMidiEffect = atom({
  key: "selectedMidiEffect",
  default: '' as string,
});

export default selectedMidiEffect;
