import { atom } from "recoil";

const dirty = atom({
  key: "dirty",
  default: false,
});

export default dirty;
