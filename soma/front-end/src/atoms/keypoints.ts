import { atom } from "recoil";
import { Keypoints } from "utils/configUtils";

const keypoints = atom({
  key: "positions",
  default: [] as Keypoints
});

export default keypoints;
