import { atom } from "recoil";
import { DBEffect } from "localDB/effectConfig";

const storedEffects = atom({
  key: "storedEffects",
  default: [] as DBEffect[],
});

export default storedEffects;
