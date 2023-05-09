import * as posenet from "@tensorflow-models/posenet";
import * as handpose from "@tensorflow-models/hand-pose-detection";

export interface ScreenRange {
  a: number;
  b: number;
}

export interface ValueRange {
  x: number;
  y: number;
}

interface BodyPartValueRange {
  x: number | undefined;
  y: number | undefined;
}

interface HandPartValueRange extends BodyPartValueRange {}

export type effectKeyType =
  | "gain"
  | "pan"
  | "reverb"
  | "bitcrusher"
  | "hpf"
  | "distortion"
  | "delay"
  | "crosssynth"
  | "analyser";

export type BodyPartKey =
  | "nose"
  | "rightAnkle"
  | "rightEar"
  | "rightElbow"
  | "rightEye"
  | "rightHip"
  | "rightShoulder"
  | "rightWrist"
  | "rightKnee"
  | "leftKnee"
  | "leftAnkle"
  | "leftEar"
  | "leftElbow"
  | "leftEye"
  | "leftHip"
  | "leftWrist"
  | "leftShoulder";

export enum BodyPartEnum {
  nose = "Nose",
  leftAnkle = "Left Ankle",
  rightAnkle = "Right Ankle",
  leftEar = "Left Ear",
  rightEar = "Right Ear",
  leftElbow = "Left Elbow",
  rightElbow = "Right Elbow",
  leftEye = "Left Eye",
  rightEye = "Right Eye",
  leftHip = "Left Hip",
  rightHip = "Right Hip",
  leftShoulder = "Left Shoulder",
  rightShoulder = "Right Shoulder",
  leftWrist = "Left Wrist",
  rightWrist = "Right Wrist",
  leftKnee = "Left Knee",
  rightKnee = "Right Knee",
}

export type HandPartKey =
  | "wrist"
  | "thumb_cmc"
  | "thumb_mcp"
  | "thumb_ip"
  | "thumb_tip"
  | "index_finger_mcp"
  | "index_finger_pip"
  | "index_finger_dip"
  | "index_finger_tip"
  | "middle_finger_mcp"
  | "middle_finger_pip"
  | "middle_finger_dip"
  | "middle_finger_tip"
  | "ring_finger_mcp"
  | "ring_finger_pip"
  | "ring_finger_dip"
  | "ring_finger_tip"
  | "pinky_finger_mcp"
  | "pinky_finger_pip"
  | "pinky_finger_dip"
  | "pinky_finger_tip";

export type HandType = "Left" | "Right";

export enum HandPartEnum {
  wrist = "Wrist",
  thumb_cmc = "Thumb cmc",
  thumb_mcp = "Thumb mcp",
  thumb_ip = "Thumb ip",
  thumb_tip = "Thumb tip",
  index_finger_mcp = "Index mcp",
  index_finger_pip = "Index pip",
  index_finger_dip = "Index dip",
  index_finger_tip = "Index tip",
  middle_finger_mcp = "Middle finger mcp",
  middle_finger_pip = "Middle finger pip",
  middle_finger_dip = "Middle finger dip",
  middle_finger_tip = "Middle finger tip",
  ring_finger_mcp = "Ring finger mcp",
  ring_finger_pip = "Ring finger pip",
  ring_finger_dip = "Ring finger dip",
  ring_finger_tip = "Ring finger tip",
  pinky_finger_mcp = "Ring finger mcp",
  pinky_finger_pip = "Ring finger pip",
  pinky_finger_dip = "Ring finger dip",
  pinky_finger_tip = "Ring finger tip",
}
export type BodyPartPositionType = {
  [index in BodyPartKey]: BodyPartValueRange;
};

export type HandPartPositionType = {
  [index in HandPartKey]: HandPartValueRange;
};

export type HandKeypointsType = {
  Right: {
    "2d": HandKeypoints;
    "3d": HandKeypoints;
  };
  Left: {
    "2d": HandKeypoints;
    "3d": HandKeypoints;
  };
};

export type MachineType = "slow" | "decent" | "fast" | "beast";

export interface SessionConfigType {
  machineType: MachineType;
}

export const defaultSessionConfig: SessionConfigType = {
  machineType: "fast",
};

export type Keypoints = posenet.Keypoint[];
export type HandKeypoints = handpose.Keypoint[];
