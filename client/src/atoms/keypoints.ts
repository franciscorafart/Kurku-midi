import { atom } from "recoil";
import { Keypoints } from "config/shared";

const keypoints = atom({
  key: "positions",
  default: [] as Keypoints
});

export default keypoints;
