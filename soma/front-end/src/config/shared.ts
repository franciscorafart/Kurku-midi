import * as posenet from "@tensorflow-models/posenet";

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
  
  export type BodyPartPositionType = {
    [index in BodyPartKey]: BodyPartValueRange;
  };

  export type MachineType = "slow" | "decent" | "fast";

  export interface SessionConfigType {
    machineType: MachineType;
  }

  export const defaultSessionConfig: SessionConfigType = {
    machineType: "slow",
  }
  
  export type Keypoints = posenet.Keypoint[];