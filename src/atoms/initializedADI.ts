import { atom } from "recoil";

const initializedADI = atom({
  key: "initializedADI",
  default: false,
});

export default initializedADI;
