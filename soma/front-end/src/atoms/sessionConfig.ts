import { atom } from "recoil";
import { defaultSessionConfig } from "config/configUtils";

const sessionConfig = atom({
  key: "sessionConfig",
  default: defaultSessionConfig
});

export default sessionConfig;
