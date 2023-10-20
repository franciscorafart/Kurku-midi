import { atom } from "recoil";
import * as posenet from "@tensorflow-models/posenet";

type StatusType = {
  modelLoaded: posenet.PoseNet | null;
  tracking: boolean;
};
const trackingStatus = atom({
  key: "trackingStatus",
  default: {
    modelLoaded: null,
    tracking: false,
  } as StatusType,
});

export default trackingStatus;
