import { atom } from "recoil";
import { DBSession } from "localDB/sessionConfig";

const storedSessions = atom({
  key: "storedSessions",
  default: [] as DBSession[],
});

export default storedSessions;
