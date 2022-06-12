import { atom } from "recoil";
import { BodyPartKey } from "config/shared";

export type SelectedMidiEffectType = {
    controller: number;
    bodyPart: BodyPartKey;
    axis: "x" | "y"
}

const selectedMidiEffect = atom({
  key: "selectedMidiEffect",
  default: {} as SelectedMidiEffectType,
});

export default selectedMidiEffect;
