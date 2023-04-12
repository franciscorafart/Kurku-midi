import { atom } from "recoil";
import { HandKeypoints } from "config/shared";

const handKeypoints = atom({
  key: "handKeypoints",
  default: {
    Right: [] as HandKeypoints,
    Left: [] as HandKeypoints,
  },
});

export default handKeypoints;
