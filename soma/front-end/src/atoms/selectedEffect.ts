import { atom } from "recoil";
import { BodyPartKey, effectKeyType } from "config/shared";

export type SelectedEffectType = {
    key: effectKeyType;
    bodyPart: BodyPartKey;
}

const selectedEffect = atom({
  key: "selectedEffect",
  default: {} as SelectedEffectType,
});

export default selectedEffect;
