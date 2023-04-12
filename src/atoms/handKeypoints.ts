import { atom } from "recoil";
import { HandKeypointsType } from "config/shared";

const handKeypoints = atom({
  key: "handKeypoints",
  default: {
    Right: {
      "2d": [],
      "3d": [],
    },
    Left: {
      "2d": [],
      "3d": [],
    },
  } as HandKeypointsType,
});

export default handKeypoints;
