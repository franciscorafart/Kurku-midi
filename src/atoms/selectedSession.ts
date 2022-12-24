import { atom } from "recoil";

const selectedSession = atom({
  key: "selectedSession",
  default: "" as string,
});

export default selectedSession;
