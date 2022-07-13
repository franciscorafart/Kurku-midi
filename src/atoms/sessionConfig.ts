import { atom } from "recoil";
import { defaultSessionConfig } from "config/shared";

const sessionConfig = atom({
  key: "sessionConfig",
  default: defaultSessionConfig
});

export default sessionConfig;
