import { atom } from "recoil";
import { BodyPartKey } from "config/shared";

export type SelectedMidiEffectType = {
    controller: number;
    bodyPart: BodyPartKey;
}

const selectedMidiEffect = atom({
  key: "selectedMidiEffect",
  default: {} as SelectedMidiEffectType,
});

export default selectedMidiEffect;
