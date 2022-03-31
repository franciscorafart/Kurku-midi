import { atom } from "recoil";
import { defaultSessionConfig } from "utils/configUtils";

const sessionConfig = atom({
  key: "sessionConfig",
  default: defaultSessionConfig
});

export default sessionConfig;
