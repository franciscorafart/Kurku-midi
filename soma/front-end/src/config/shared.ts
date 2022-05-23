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
    | "leftElbow"
    | "leftEye"
    | "leftHip"
    | "leftWrist"
    | "leftShoulder";
  
  export type BodyPartPositionType = {
    [index in BodyPartKey]: BodyPartValueRange;
  };